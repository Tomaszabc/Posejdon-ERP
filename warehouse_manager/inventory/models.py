from django.db import models
from django.core.exceptions import ValidationError


class Product(models.Model):
    SHAPE_CHOICES = [
        ("okrągły", "Okrągły"),
        ("kwadratowy", "Kwadratowy"),
        ("niestandardowy", "Niestandardowy"),
    ]
    SIZE_CHOICES = [
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
    ]
    COLOR_CHOICES = [
        ("W", "W"),
        ("B", "B"),
        ("G", "G"),
    ]

    DIAMETER_CHOICES = [
        ("100", "100"),
        ("125", "125"),
        ("160", "160"),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    diameter = models.DecimalField(max_digits=6, decimal_places=2)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES)
    size = models.CharField(max_length=2, choices=SIZE_CHOICES)
    color = models.CharField(max_length=50, choices=COLOR_CHOICES)

    def __str__(self):
        return f"{self.shape} {self.size} {self.color} ({self.diameter} mm)"


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name


class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    stock_level = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.stock_level}"


class Order(models.Model):
    diameter = models.CharField(max_length=10, blank=True)
    shape = models.CharField(max_length=20, blank=True)
    size = models.CharField(max_length=2, blank=True)
    color = models.CharField(max_length=50, blank=True)
    quantity_to_assemble = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_produced = models.BooleanField(default=False)
    produced_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        errors = {}
        if not self.diameter:
            errors["diameter"] = "Średnica jest wymagana."
        if not self.shape:
            errors["shape"] = "Kształt jest wymagany."
        if not self.size:
            errors["size"] = "Rozmiar jest wymagany."
        if not self.color:
            errors["color"] = "Kolor jest wymagany."
        if not self.quantity_to_assemble or self.quantity_to_assemble <= 0:
            errors["quantity_to_assemble"] = (
                "Ilość musi być liczbą dodatnią większą od zera."
            )
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"Zamówienie: {self.diameter}, {self.shape}, {self.size}, {self.color}, ilość: {self.quantity_to_assemble}"
