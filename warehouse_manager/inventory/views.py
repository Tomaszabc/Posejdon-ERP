import csv
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib import messages
from django.http import JsonResponse

from rest_framework import viewsets, generics

from .models import (
    Product, Order, Component, DiffusorType, ProductToProduction, PartsBuilder
)
from .serializers import (
    OrderSerializer, ComponentSerializer, DiffusorTypeSerializer,
    ProductToProductionSerializer,  PartsBuilderSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth.hashers import check_password

import logging




# --- Django views ---

def index(request):
    return render(request, "inventory/index.html")

def product_order(request):
    diameters = [d[0] for d in Product.DIAMETER_CHOICES]
    shapes = [s[0] for s in Product.SHAPE_CHOICES]
    sizes = [s[0] for s in Product.SIZE_CHOICES]
    colors = [c[0] for c in Product.COLOR_CHOICES]
    errors = {}

    if request.method == "POST":
        order = Order(
            diameter=request.POST.get("diffuser_diameter"),
            shape=request.POST.get("diffuser_shape"),
            size=request.POST.get("diffuser_size"),
            color=request.POST.get("diffuser_color"),
            quantity_to_assemble=request.POST.get("quantity_to_assemble") or 0,
        )
        try:
            order.full_clean()
            order.save()
            messages.success(request, "Zamówienie zostało dodane!")
            return redirect("inventory:product_order")
        except ValidationError as e:
            errors = e.message_dict

    orders = Order.objects.order_by("-created_at")[:10]
    return render(
        request,
        "inventory/product_order.html",
        {
            "diameters": diameters,
            "shapes": shapes,
            "sizes": sizes,
            "colors": colors,
            "orders": orders,
            "errors": errors,
        },
    )

@login_required
def user_profile(request):
    return render(request, "account/user_profile.html")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    """
    API endpoint zwracający pełne dane profilu użytkownika
    """
    user = request.user
    return Response({
        'pk': user.pk,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,  # ✅ To jest potrzebne
        'last_login': user.last_login,
        'is_staff': user.is_staff,
    })

def delete_order(request, order_id):
    if request.method == "POST":
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "warehouse",
            {
                "type": "warehouse_update",
                "data": {"action": "refresh"}
            }
        )
        messages.success(request, "Zamówienie zostało usunięte!")
    return redirect("inventory:product_order")

def product_production(request):
    orders = Order.objects.filter(is_produced=False).order_by("created_at")
    produced_orders = Order.objects.filter(is_produced=True).order_by("-produced_at")[:10]
    if request.method == "POST":
        order_id = request.POST.get("order_id")
        order = get_object_or_404(Order, id=order_id)
        order.is_produced = True
        order.produced_at = timezone.now()
        order.save()
        return redirect("inventory:product_production")
    return render(
        request,
        "inventory/product_production.html",
        {
            "orders": orders,
            "produced_orders": produced_orders,
        },
    )

# --- DRF ViewSets & API views ---

# Orders
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def production_orders(request):
    orders = Order.objects.filter(is_produced=False).order_by("created_at")
    produced_orders = Order.objects.filter(is_produced=True).order_by("-produced_at")[:10]
    return Response({
        "orders": OrderSerializer(orders, many=True).data,
        "produced_orders": OrderSerializer(produced_orders, many=True).data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def produce_order(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"error": "Brak order_id"}, status=400)
    try:
        order = Order.objects.get(id=order_id)
        order.is_produced = True
        order.produced_at = timezone.now()
        order.save()
        return Response({"success": True})
    except Order.DoesNotExist:
        return Response({"error": "Nie znaleziono zamówienia"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def undo_produce_order(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"error": "Brak order_id"}, status=400)
    try:
        order = Order.objects.get(id=order_id)
        order.is_produced = False
        order.produced_at = None
        order.save()
        return Response({"success": True})
    except Order.DoesNotExist:
        return Response({"error": "Nie znaleziono zamówienia"}, status=404)

# Components
class ComponentListCreateView(generics.ListCreateAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer

class ComponentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer

def parse_csv_with_autofix(file):
    # Odczytaj plik jako tekst
    content = file.read().decode('utf-8-sig').replace('\r\n', '\n').replace('\r', '\n')
    lines = content.split('\n')
    if not lines or not lines[0].strip():
        return []

    # Wykryj separator
    first_line = lines[0]
    delimiter = ';' if first_line.count(';') > first_line.count(',') else ','

    # Przygotuj readera
    reader = csv.reader(lines, delimiter=delimiter)
    headers = next(reader)
    headers = [h.strip() for h in headers]

    data = []
    for row in reader:
        # Pomijaj puste wiersze
        if not any(cell.strip() for cell in row):
            continue
        # Uzupełnij brakujące wartości pustym stringiem
        if len(row) < len(headers):
            row += [''] * (len(headers) - len(row))
        # Usuń nadmiarowe wartości
        if len(row) > len(headers):
            row = row[:len(headers)]
        # Usuń cudzysłowy i zamień przecinek na kropkę w liczbach
        clean_row = []
        for val in row:
            val = val.strip().strip('"')
            # Zamień przecinek na kropkę tylko jeśli to liczba
            if val.replace(',', '', 1).replace('.', '', 1).isdigit() and ',' in val:
                val = val.replace(',', '.')
            clean_row.append(val)
        data.append(dict(zip(headers, clean_row)))
    return data

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def import_components_csv(request):
    """
    Importuje komponenty z pliku CSV przesłanego przez frontend.
    """
    file = request.FILES.get('file')
    if not file:
        return Response({"error": "Nie przesłano pliku."}, status=400)

    rows = parse_csv_with_autofix(file)
    count = 0
    errors = []

    for idx, row in enumerate(rows):
        try:
            def dec(val):
                val = (val or '').replace(',', '.').replace(' ', '')
                return Decimal(val) if val else Decimal('0')
            def valf(val):
                return val.strip() if val else ''
            
            catalog_index = valf(row.get('Indeks katalogowy'))
            if not catalog_index:
                raise ValueError("Brak indeksu katalogowego")

            Component.objects.update_or_create(
                catalog_index=valf(row.get('Indeks katalogowy')),
                defaults={
                    'r': valf(row.get('R')),
                    'full_name': valf(row.get('Nazwa cała')),
                    'stock': dec(row.get('Stan')),
                    'available_quantity': dec(row.get('Ilość dostępna')),
                    'unit': valf(row.get('j.m.')),
                    'purchase_price_net': dec(row.get('Cena zakupu netto')),
                    'sale_price_net': dec(row.get('Cena sprzedaży netto')),
                    'barcode': valf(row.get('Kod kreskowy')),
                    'reserved': dec(row.get('Zarezerwowano')),
                    'short_name': valf(row.get('Nazwa krótka')),
                    'original_name': valf(row.get('Nazwa oryg.')),
                    'suppliers_will_deliver': dec(row.get('Dostawcy dostarczą')),
                    'recipients_will_receive': dec(row.get('Odbiorcy odbiorą')),
                    'purchase_price_net_currency': dec(row.get('C. zakupu netto wal.')),
                    'vat_sale': dec(row.get('Vat sprz.')),
                    'margin_percent': dec(row.get('Marża [%]')),
                    'f': valf(row.get('F')),
                    'producer': valf(row.get('Producent')),
                    'article_number': valf(row.get('Nr artykułu')),
                    's': valf(row.get('S')),
                    'attachment': valf(row.get('Zał.')),
                    'marker': valf(row.get('Wyróżnik')),
                    'a': valf(row.get('A')),
                    'producer_index': valf(row.get('Indeks producenta')),
                    'cn_code': valf(row.get('Kod CN')),
                    'country_of_origin': valf(row.get('Kraj pochodzenia')),
                    'jpk_classification': valf(row.get('JPK Klasyfikacja')),
                    'markup_percent': dec(row.get('Narzut [%]')),
                }
            )
            count += 1
        except Exception as e:
            errors.append({
                "row": idx + 2,  # +2 bo 1 to nagłówek, 2 to pierwszy wiersz danych
                "error": str(e),
                "data": row
            })
            continue

    return Response({"success": True, "imported": count})

@api_view(['GET'])
def diffusor_types_list(request):
    types = DiffusorType.objects.all()
    serializer = DiffusorTypeSerializer(types, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def components_for_order(request):
    queryset = Component.objects.filter(r__in=["Produkt", "Towar"])
    serializer = ComponentSerializer(queryset, many=True)
    return Response(serializer.data)

class ProductToProductionListCreateView(generics.ListCreateAPIView):
    queryset = ProductToProduction.objects.all()
    serializer_class = ProductToProductionSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        # Debug - sprawdź użytkownika
        print(f"Request user: {self.request.user}")
        print(f"Is authenticated: {self.request.user.is_authenticated}")
        print(f"User type: {type(self.request.user)}")
        component = serializer.validated_data['component']
        quantity = serializer.validated_data['quantity']

        if ProductToProduction.objects.filter(component=component, quantity=quantity, is_produced=False).exists():
            raise ValidationError("To zamówienie już istnieje i nie zostało jeszcze wyprodukowane.")
        
        # Przypisz zalogowanego użytkownika
        order = serializer.save(created_by=self.request.user)
        print(f"Order created with created_by: {order.created_by}")
        
        # Odejmij materiały ze stanu magazynowego
        # parts = PartsBuilder.objects.filter(product=order.component)
        # for part in parts:
        #     material = part.material
        #     qty_to_subtract = float(part.quantity_needed) * order.quantity
        #     material.stock = float(material.stock) - qty_to_subtract
        #     if material.stock < 0:
        #         material.stock = 0
        #     material.save()
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "warehouse",
            {
                "type": "warehouse_update",
                "data": {"action": "refresh"}
            }
        )

@api_view(['POST'])
def produce_product_to_production(request, order_id):
    try:
        print(f"== PRODUCE DEBUG: order_id={order_id}")
        order = ProductToProduction.objects.get(id=order_id)
        print(f"Order: {order}")

        # ZABEZPIECZENIE: nie pozwól produkować drugi raz
        if order.is_produced:
            return Response({"error": "To zamówienie zostało już wyprodukowane."}, status=400)

        component = order.component
        print(f"Component: {component.full_name} (stock={component.stock})")
        parts = PartsBuilder.objects.filter(product=component)

         # Oblicz ile pozostało do wyprodukowania
        remaining_quantity = order.quantity - order.produced_quantity

        missing = []
        # 1. Najpierw sprawdź wszystkie stany magazynowe
        for part in parts:
            material = part.material
            qty_to_substract = part.quantity_needed * remaining_quantity
            print(f"Material: {material.full_name}, stock={material.stock}, needed={qty_to_substract}")
            if material.stock - qty_to_substract < 0:
                print(f"Brakuje: {material.full_name} ({material.catalog_index})")
                missing.append({
                    "name": material.full_name,
                    "sku": material.catalog_index,
                    "needed": float(qty_to_substract),
                    "available": float(material.stock),
                    "missing_qty": float(qty_to_substract - material.stock),
                    "unit": material.unit,
                })
        if missing:
            print(f"== PRODUCE DEBUG: missing={missing}")
            return Response({
                "missing": missing,
                "error": "Brak wystarczającej ilości materiałów."
            }, status=400)
        # 2. Jeśli wszystko OK, dopiero wtedy wykonaj produkcję
        order.produced_quantity = order.quantity 
        order.is_produced = True
        order.produced_at = timezone.now()
        order.save()
        component.stock += remaining_quantity
        component.save()

        for part in parts:
            material = part.material
            qty_to_substract = part.quantity_needed * remaining_quantity
            material.stock -= qty_to_substract
            material.save()
             # --- DODAJ TO PO ZMIANIE STANU ---
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "warehouse",
            {
                "type": "warehouse_update",
                "data": {"action": "refresh"}
            }
        ) 
        print("== PRODUCE DEBUG: success")
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        print("== PRODUCE DEBUG: Order not found")
        return Response({"error": "Order not found"}, status=404)

@api_view(['POST'])
def undo_product_to_production(request, order_id):
    try:
        order = ProductToProduction.objects.get(id=order_id)
        if order.is_produced or order.produced_quantity > 0:
            component = order.component
            
            # Cofnij całą wyprodukowaną ilość
            component.stock -= order.produced_quantity  # Zmienione!
            component.save()

            # Przywróć materiały
            parts = PartsBuilder.objects.filter(product=component)
            for part in parts:
                material = part.material
                qty_to_restore = part.quantity_needed * order.produced_quantity  # Zmienione!
                material.stock += qty_to_restore
                material.save()
            
            # Resetuj produkcję
            order.produced_quantity = 0
            order.is_produced = False
            order.produced_at = None
            order.save()
            
            # WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "warehouse",
                {
                    "type": "warehouse_update",
                    "data": {"action": "refresh"}
                }
            )
        
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)



@api_view(['GET'])
def materials_for_parts(request):
    queryset = Component.objects.filter(r__in=["Materiał", "Towar"])
    serializer = ComponentSerializer(queryset, many=True)
    return Response(serializer.data)

# PartsBuilder
class PartsBuilderViewSet(viewsets.ModelViewSet):
    queryset = PartsBuilder.objects.all().select_related('product', 'material').order_by('-created_at')
    serializer_class = PartsBuilderSerializer

@api_view(['GET'])
def product_recipe(request, product_id):
    """Pobiera przepis (listę materiałów) dla konkretnego produktu"""
    try:
        parts = PartsBuilder.objects.filter(product_id=product_id).select_related('material')
        serializer = PartsBuilderSerializer(parts, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def calculate_production_needs(request):
    """
    Oblicza potrzeby materiałowe dla danej ilości produktu
    Oczekuje: {"product_id": 1, "quantity": 10}
    """
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    if not product_id:
        return Response({"error": "Brak product_id"}, status=400)

    try:
        parts = PartsBuilder.objects.filter(product_id=product_id).select_related('material')
        needs = []

        for part in parts:
            needed_quantity = part.quantity_needed * Decimal(str(quantity))
            available = part.material.stock
            shortage = max(0, needed_quantity - available)

            needs.append({
                'material_id': part.material.id,
                'material_name': part.material.full_name,
                'material_unit': part.material.unit,
                'quantity_per_product': part.quantity_needed,
                'total_needed': needed_quantity,
                'available_stock': available,
                'shortage': shortage,
                'cost_per_unit': part.material.purchase_price_net,
                'total_cost': part.material.purchase_price_net * needed_quantity
            })

        return Response({
            'product_quantity': quantity,
            'materials_needed': needs,
            'total_cost': sum(item['total_cost'] for item in needs)
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def product_parts(request, component_id):
    parts = PartsBuilder.objects.filter(product_id=component_id)
    data = [
        {
            "id": part.id,
            "material_full_name": part.material.full_name,
            "material_catalog_index": part.material.catalog_index,
            "quantity_needed": float(part.quantity_needed),
            "material_unit": part.material.unit,
            "material_stock": float(part.material.stock),
        }
        for part in parts
    ]
    return Response(data)

@api_view(['GET'])
def components_towar(request):
    """Zwraca tylko komponenty typu 'Towar'."""
    queryset = Component.objects.filter(r='Towar')
    serializer = ComponentSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def check_materials_availability(request):
    component_id = request.data.get('component')
    quantity = request.data.get('quantity', 1)
    if not component_id:
        return Response({"error": "Brak component"}, status=400)
    try:
        quantity = float(quantity)
    except Exception:
        return Response({"error": "Nieprawidłowa ilość"}, status=400)
    try:
        component = Component.objects.get(id=component_id)
        parts = PartsBuilder.objects.filter(product=component)
        missing = []
        for part in parts:
            material = part.material
            qty_needed = float(part.quantity_needed) * quantity
            if float(material.stock) < qty_needed:
                missing.append({
                    "name": material.full_name,
                    "sku": material.catalog_index,
                    "needed": qty_needed,
                    "available": float(material.stock),
                    "missing_qty": qty_needed - float(material.stock),
                    "unit": material.unit,
                })
        if missing:
            return Response({"missing": missing, "error": "Brak wystarczającej ilości materiałów."}, status=400)
        return Response({"ok": True})
    except Component.DoesNotExist:
        return Response({"error": "Nie znaleziono komponentu."}, status=404)


class ProductToProductionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductToProduction.objects.all()
    serializer_class = ProductToProductionSerializer
    permission_classes = [IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        # Wyślij sygnał websocket po usunięciu
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "warehouse",
            {
                "type": "warehouse_update",
                "data": {"action": "refresh"}
            }
        )
        return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Custom view do zmiany hasła z poprawną walidacją starego hasła
    """
    old_password = request.data.get('old_password')
    new_password1 = request.data.get('new_password1')
    new_password2 = request.data.get('new_password2')
    
    # Walidacja danych
    if not all([old_password, new_password1, new_password2]):
        return Response({
            'error': 'Wszystkie pola są wymagane.'
        }, status=400)
    
    # Sprawdź czy nowe hasła są identyczne
    if new_password1 != new_password2:
        return Response({
            'new_password2': ['Nowe hasła nie są identyczne.']
        }, status=400)
    
    user = request.user
    
    # ✅ KLUCZOWE: Sprawdź stare hasło
    if not check_password(old_password, user.password):
        return Response({
            'old_password': ['Nieprawidłowe stare hasło.']
        }, status=400)
    
    # Sprawdź czy nowe hasło spełnia wymagania Django
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError
    
    try:
        validate_password(new_password1, user)
    except ValidationError as e:
        return Response({
            'new_password1': list(e.messages)
        }, status=400)
    
    # Zmień hasło
    user.set_password(new_password1)
    user.save()
    
    return Response({
        'detail': 'Hasło zostało zmienione pomyślnie.'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_missing_parts_ordered(request, order_id):
    """
    Ustawia flagę missing_parts_send_to_production na True dla zamówienia produkcyjnego.
    """
    print(f"Wywołano mark_missing_parts_ordered dla order_id={order_id}")
    try:
        order = ProductToProduction.objects.get(id=order_id)
        order.missing_parts_send_to_production = True
        order.missing_parts_ordered_at = timezone.now()
        order.save()
        print("Flaga ustawiona OK")
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        print("Nie znaleziono zamówienia!")
        return Response({"error": "Nie znaleziono zamówienia produkcyjnego."}, status=404)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list_for_modules_production_previewing_components_production(request):
    orders = ProductToProduction.objects.filter(component__r='Towar').exclude(component__catalog_index__contains='-24-')
    
    serializer = ProductToProductionSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def produce_order_partial(request, order_id):
    """
    Częściowa produkcja zamówienia
    """
    try:
        order = ProductToProduction.objects.get(id=order_id)
        partial_quantity = int(request.data.get('quantity', 0))
        
        if partial_quantity <= 0:
            return Response({"error": "Ilość musi być większa od 0"}, status=400)
            
        remaining = order.quantity - order.produced_quantity
        if partial_quantity > remaining:
            return Response({"error": f"Nie można wyprodukować więcej niż pozostało ({remaining})"}, status=400)
        
        # Sprawdź dostępność materiałów dla częściowej ilości
        component = order.component
        parts = PartsBuilder.objects.filter(product=component)
        missing = []
        
        # 1. Sprawdź materiały
        for part in parts:
            material = part.material
            qty_to_substract = part.quantity_needed * partial_quantity
            if material.stock - qty_to_substract < 0:
                missing.append({
                    "name": material.full_name,
                    "sku": material.catalog_index,
                    "needed": float(qty_to_substract),
                    "available": float(material.stock),
                    "missing_qty": float(qty_to_substract - material.stock),
                    "unit": material.unit,
                })
        
        if missing:
            return Response({
                "error": "Brak wystarczających materiałów",
                "missing": missing
            }, status=400)
        
        # 2. Wykonaj częściową produkcję
        order.produced_quantity += partial_quantity
        
        # Sprawdź czy zamówienie jest w pełni wyprodukowane
        if order.produced_quantity >= order.quantity:
            order.is_produced = True
            order.produced_at = timezone.now()
        
        order.save()
        
        # 3. Zaktualizuj stany magazynowe
        component.stock += partial_quantity
        component.save()
        
        # 4. Odejmij materiały
        for part in parts:
            material = part.material
            qty_to_substract = part.quantity_needed * partial_quantity
            material.stock -= qty_to_substract
            material.save()
        
        # 5. WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "warehouse",
            {
                "type": "warehouse_update",
                "data": {"action": "refresh"}
            }
        )
        
        return Response({
            "success": True,
            "produced_quantity": partial_quantity,
            "total_produced": order.produced_quantity,
            "remaining": order.quantity - order.produced_quantity,
            "is_completed": order.is_produced
        })
        
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Zamówienie nie znalezione"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_statistics(request):
    """
    Zwraca statystyki dla wykresów na stronie głównej
    """
    from django.db.models import Count, Q
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    now = timezone.now()
    
    # Ostatnie 7 dni - dla wykresu słupkowego
    daily_data = []
    for i in range(6, -1, -1):
        date = now - timedelta(days=i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        count = ProductToProduction.objects.filter(
            created_at__gte=day_start,
            created_at__lt=day_end
        ).count()
        
        daily_data.append({
            'day': date.strftime('%a'),  # Pon, Wt, Śr, etc.
            'date': date.strftime('%d.%m'),
            'count': count
        })
    
    # Ostatnie 6 miesięcy - dla wykresu liniowego
    monthly_data = []
    for i in range(5, -1, -1):
        month_date = now - timedelta(days=30*i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i == 0:
            month_end = now
        else:
            next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
            month_end = next_month
        
        count = ProductToProduction.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        
        monthly_data.append({
            'month': month_start.strftime('%B'),  # Styczeń, Luty, etc.
            'short_month': month_start.strftime('%b'),  # Sty, Lut, etc.
            'count': count
        })
    
    # Dodatkowe statystyki
    total_orders = ProductToProduction.objects.count()
    produced_orders = ProductToProduction.objects.filter(is_produced=True).count()
    pending_orders = total_orders - produced_orders
    
    return Response({
        'daily_orders': daily_data,
        'monthly_orders': monthly_data,
        'statistics': {
            'total_orders': total_orders,
            'produced_orders': produced_orders,
            'pending_orders': pending_orders,
            'production_rate': round((produced_orders / total_orders * 100) if total_orders > 0 else 0, 1)
        }
    })