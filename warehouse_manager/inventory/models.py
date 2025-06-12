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
    def save(self, *args, **kwargs):
        if self.stock < 0:
            self.stock = 0
        super().save(*args, **kwargs)
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

class DiffusorType(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.sku} – {self.name}"

class ProductToProduction(models.Model):
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_produced = models.BooleanField(default=False)
    produced_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.component.full_name} ({self.component.catalog_index}) x {self.quantity}"

class ProductToProductionComponent(models.Model):
    product_to_production = models.ForeignKey(
        ProductToProduction, on_delete=models.CASCADE, related_name="components"
    )
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product_to_production} - {self.component} x {self.quantity}"


class PartsBuilder(models.Model):
    # Produkt główny (SKU) - r="Produkt"
    product = models.ForeignKey(
        Component, 
        on_delete=models.CASCADE, 
        related_name='parts_recipes',
        limit_choices_to={'r__in': ['Towar']},  # lub ['Towar', 'Produkt'] jeśli chcesz oba
        help_text="Produkt główny (SKU)"   
)
    # Materiał składowy - r="Materiał" 
    material = models.ForeignKey(
        Component,
        on_delete=models.CASCADE,
        related_name='used_in_products',
        limit_choices_to={'r__in': ['Materiał', 'Towar']},
        help_text="Materiał użyty w produkcie"
    )

    # Ilość materiału potrzebna na 1 sztukę produktu
    quantity_needed = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        default=1,
        help_text="Ilość materiału na 1 szt. produktu"
    )
    
    # Dodatkowe informacje
    notes = models.TextField(blank=True, help_text="Dodatkowe uwagi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'parts_builder'
        verbose_name = "Przepis produktu"
        verbose_name_plural = "Przepisy produktów"
        unique_together = ['product', 'material']  # Jeden materiał na produkt tylko raz
        
    def __str__(self):
        return f"{self.product.full_name} → {self.material.full_name} ({self.quantity_needed})"
        
    def total_cost(self):
        """Koszt materiału na 1 szt. produktu"""
        return self.material.purchase_price_net * self.quantity_needed