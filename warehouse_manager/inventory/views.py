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