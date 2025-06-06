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

class Component(models.Model):
    r = models.CharField(max_length=10, blank=True, null=True)  # R
    full_name = models.CharField(max_length=255)  # Nazwa cała
    stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Stan
    available_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Ilość dostępna
    unit = models.CharField(max_length=10)  # j.m.
    purchase_price_net = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Cena zakupu netto
    sale_price_net = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Cena sprzedaży netto
    barcode = models.CharField(max_length=64, blank=True, null=True)  # Kod kreskowy
    catalog_index = models.CharField(max_length=64, blank=True, null=True)  # Indeks katalogowy
    reserved = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Zarezerwowano
    short_name = models.CharField(max_length=128, blank=True, null=True)  # Nazwa krótka
    original_name = models.CharField(max_length=128, blank=True, null=True)  # Nazwa oryg.
    suppliers_will_deliver = models.DecimalField(max_digits=12, decimal_places=3, default=0)  # Dostawcy dostarczą
    recipients_will_receive = models.DecimalField(max_digits=12, decimal_places=3, default=0)  # Odbiorcy odbiorą
    purchase_price_net_currency = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # C. zakupu netto wal.
    vat_sale = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Vat sprz.
    margin_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)  # Marża [%]
    f = models.CharField(max_length=10, blank=True, null=True)  # F
    producer = models.CharField(max_length=128, blank=True, null=True)  # Producent
    article_number = models.CharField(max_length=64, blank=True, null=True)  # Nr artykułu
    s = models.CharField(max_length=10, blank=True, null=True)  # S
    attachment = models.CharField(max_length=10, blank=True, null=True)  # Zał.
    marker = models.CharField(max_length=10, blank=True, null=True)  # Wyróżnik
    a = models.CharField(max_length=10, blank=True, null=True)  # A
    producer_index = models.CharField(max_length=64, blank=True, null=True)  # Indeks producenta
    cn_code = models.CharField(max_length=32, blank=True, null=True)  # Kod CN
    country_of_origin = models.CharField(max_length=64, blank=True, null=True)  # Kraj pochodzenia
    jpk_classification = models.CharField(max_length=64, blank=True, null=True)  # JPK Klasyfikacja
    markup_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)  # Narzut [%]

    def __str__(self):
        return self.full_name