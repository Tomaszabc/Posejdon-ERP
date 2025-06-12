import csv
from decimal import Decimal

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib import messages
from django.http import JsonResponse

from rest_framework import viewsets, generics
from rest_framework.decorators import (
    api_view, permission_classes, parser_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .models import (
    Product, Order, Component, DiffusorType, ProductToProduction,
    Merchandise, PartsBuilder
)
from .serializers import (
    OrderSerializer, ComponentSerializer, DiffusorTypeSerializer,
    ProductToProductionSerializer, MerchandiseSerializer, PartsBuilderSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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

def delete_order(request, order_id):
    if request.method == "POST":
        order = get_object_or_404(Order, id=order_id)
        order.delete()
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

    decoded_file = file.read().decode('utf-8').splitlines()
    first_line = decoded_file[0]
    delimiter = ';' if first_line.count(';') > first_line.count(',') else ','
    reader = csv.DictReader(decoded_file, delimiter=delimiter)
    count = 0

    for row in reader:
        def dec(val):
            val = (val or '').replace(',', '.').replace(' ', '')
            return Decimal(val) if val else Decimal('0')
        def val(val):
            return val.strip() if val else ''

        Component.objects.update_or_create(
            catalog_index=val(row.get('Indeks katalogowy')),
            defaults={
                'r': val(row.get('R')),
                'full_name': val(row.get('Nazwa cała')),
                'stock': dec(row.get('Stan')),
                'available_quantity': dec(row.get('Ilość dostępna')),
                'unit': val(row.get('j.m.')),
                'purchase_price_net': dec(row.get('Cena zakupu netto')),
                'sale_price_net': dec(row.get('Cena sprzedaży netto')),
                'barcode': val(row.get('Kod kreskowy')),
                'reserved': dec(row.get('Zarezerwowano')),
                'short_name': val(row.get('Nazwa krótka')),
                'original_name': val(row.get('Nazwa oryg.')),
                'suppliers_will_deliver': dec(row.get('Dostawcy dostarczą')),
                'recipients_will_receive': dec(row.get('Odbiorcy odbiorą')),
                'purchase_price_net_currency': dec(row.get('C. zakupu netto wal.')),
                'vat_sale': dec(row.get('Vat sprz.')),
                'margin_percent': dec(row.get('Marża [%]')),
                'f': val(row.get('F')),
                'producer': val(row.get('Producent')),
                'article_number': val(row.get('Nr artykułu')),
                's': val(row.get('S')),
                'attachment': val(row.get('Zał.')),
                'marker': val(row.get('Wyróżnik')),
                'a': val(row.get('A')),
                'producer_index': val(row.get('Indeks producenta')),
                'cn_code': val(row.get('Kod CN')),
                'country_of_origin': val(row.get('Kraj pochodzenia')),
                'jpk_classification': val(row.get('JPK Klasyfikacja')),
                'markup_percent': dec(row.get('Narzut [%]')),
            }
        )
        count += 1

    return Response({"success": True, "imported": count})

@api_view(['GET'])
def diffusor_types_list(request):
    types = DiffusorType.objects.all()
    serializer = DiffusorTypeSerializer(types, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def components_for_order(request):
    queryset = Component.objects.filter(r="Produkt")
    serializer = ComponentSerializer(queryset, many=True)
    return Response(serializer.data)

# ProductToProduction
class ProductToProductionListCreateView(generics.ListCreateAPIView):
    queryset = ProductToProduction.objects.all().order_by('-created_at')
    serializer_class = ProductToProductionSerializer



@api_view(['POST'])
def produce_product_to_production(request, order_id):
    try:
        order = ProductToProduction.objects.get(id=order_id)
        if not order.is_produced:
            component = order.component
            parts = PartsBuilder.objects.filter(product=component)
            missing = []
            # 1. Najpierw sprawdź wszystkie stany magazynowe
            for part in parts:
                material = part.material
                qty_to_substract = part.quantity_needed * order.quantity
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
                    "missing": missing,
                    "error": "Brak wystarczającej ilości materiałów."
                }, status=400)
            # 2. Jeśli wszystko OK, dopiero wtedy wykonaj produkcję
            order.is_produced = True
            order.produced_at = timezone.now()
            order.save()
            component.stock += order.quantity
            component.save()
            for part in parts:
                material = part.material
                qty_to_substract = part.quantity_needed * order.quantity
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
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

@api_view(['POST'])
def undo_product_to_production(request, order_id):
    try:
        order = ProductToProduction.objects.get(id=order_id)
        if order.is_produced:
            order.is_produced = False
            order.produced_at = None
            order.save()
            component = order.component
            component.stock -= order.quantity
            component.save()

            parts = PartsBuilder.objects.filter(product=component)
            for part in parts:
                material = part.material
                qty_to_restore = part.quantity_needed * order.quantity
                material.stock += qty_to_restore
                material.save()
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

# Merchandise
class MerchandiseViewSet(viewsets.ModelViewSet):
    queryset = Merchandise.objects.all()
    serializer_class = MerchandiseSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def import_merchandise_csv(request):
    """
    Importuje do Merchandise tylko te wiersze z CSV, gdzie R == 'Materiał'
    """
    file = request.FILES.get('file')
    if not file:
        return Response({"error": "Nie przesłano pliku."}, status=400)

    decoded_file = file.read().decode('utf-8').splitlines()
    first_line = decoded_file[0]
    delimiter = ';' if first_line.count(';') > first_line.count(',') else ','
    reader = csv.DictReader(decoded_file, delimiter=delimiter)
    count = 0

    for row in reader:
        def dec(val):
            val = (val or '').replace(',', '.').replace(' ', '')
            return Decimal(val) if val else Decimal('0')
        def val(val):
            return val.strip() if val else ''

        if val(row.get('R')) != 'Materiał':
            continue

        Merchandise.objects.update_or_create(
            catalog_index=val(row.get('Indeks katalogowy')),
            defaults={
                'r': val(row.get('R')),
                'full_name': val(row.get('Nazwa cała')),
                'stock': dec(row.get('Stan')),
                'available_quantity': dec(row.get('Ilość dostępna')),
                'unit': val(row.get('j.m.')),
                'purchase_price_net': dec(row.get('Cena zakupu netto')),
                'sale_price_net': dec(row.get('Cena sprzedaży netto')),
                'barcode': val(row.get('Kod kreskowy')),
                'reserved': dec(row.get('Zarezerwowano')),
                'short_name': val(row.get('Nazwa krótka')),
                'original_name': val(row.get('Nazwa oryg.')),
                'suppliers_will_deliver': dec(row.get('Dostawcy dostarczą')),
                'recipients_will_receive': dec(row.get('Odbiorcy odbiorą')),
                'purchase_price_net_currency': dec(row.get('C. zakupu netto wal.')),
                'vat_sale': dec(row.get('Vat sprz.')),
                'margin_percent': dec(row.get('Marża [%]')),
                'f': val(row.get('F')),
                'producer': val(row.get('Producent')),
                'article_number': val(row.get('Nr artykułu')),
                's': val(row.get('S')),
                'attachment': val(row.get('Zał.')),
                'marker': val(row.get('Wyróżnik')),
                'a': val(row.get('A')),
                'producer_index': val(row.get('Indeks producenta')),
                'cn_code': val(row.get('Kod CN')),
                'country_of_origin': val(row.get('Kraj pochodzenia')),
                'jpk_classification': val(row.get('JPK Klasyfikacja')),
                'markup_percent': dec(row.get('Narzut [%]')),
            }
        )
        count += 1

    return Response({"success": True, "imported": count})

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
        }
        for part in parts
    ]
    return Response(data)


@api_view(['GET', 'DELETE'])
def product_to_production_detail(request, order_id):
    try:
        order = ProductToProduction.objects.get(id=order_id)
        if request.method == 'GET':
            serializer = ProductToProductionSerializer(order)
            return Response(serializer.data)
        elif request.method == 'DELETE':
            order.delete()
            return Response({"message": "Order deleted successfully"}, status=204)
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)