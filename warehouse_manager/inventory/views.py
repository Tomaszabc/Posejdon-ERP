from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from .models import Product, Order
from django.utils import timezone
from django.contrib import messages
from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics
from .models import Component
from .serializers import ComponentSerializer
import csv
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import Component
from .models import DiffusorType
from .serializers import DiffusorTypeSerializer
from .models import ProductToProduction
from .serializers import ProductToProductionSerializer


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
            errors = e.message_dict  # <-- przekazujesz błędy

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
            "errors": errors,  # <-- zawsze przekazujesz errors
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
    produced_orders = Order.objects.filter(is_produced=True).order_by("-produced_at")[
        :10
    ]
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
    # Wykrywanie separatora
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
    # Tylko te z r="Produkt"
    queryset = Component.objects.filter(r="Produkt")
    serializer = ComponentSerializer(queryset, many=True)
    return Response(serializer.data)

class ProductToProductionListCreateView(generics.ListCreateAPIView):
    queryset = ProductToProduction.objects.all().order_by('-created_at')
    serializer_class = ProductToProductionSerializer

@api_view(['DELETE'])
def delete_product_to_production(request, pk):
    try:
        product = ProductToProduction.objects.get(pk=pk)
        product.delete()
        return Response(status=204)
    except ProductToProduction.DoesNotExist:
        return Response(status=404)


@api_view(['POST'])
def produce_product_to_production(request, order_id):
    try:
        order = ProductToProduction.objects.get(id=order_id)
        if not order.is_produced:
            order.is_produced = True
            order.produced_at = timezone.now()
            order.save()
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
        return Response({"success": True})
    except ProductToProduction.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)