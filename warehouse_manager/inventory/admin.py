from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Component, Product

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    # Wyświetl WSZYSTKIE kolumny w tabeli
    list_display = [
        'r', 'full_name', 'catalog_index', 'stock', 'available_quantity', 
        'unit', 'purchase_price_net', 'sale_price_net', 'barcode', 
        'reserved', 'short_name', 'original_name', 'suppliers_will_deliver', 
        'recipients_will_receive', 'purchase_price_net_currency', 'vat_sale', 
        'margin_percent', 'f', 'producer', 'article_number', 's', 
        'attachment', 'marker', 'a', 'producer_index', 'cn_code', 
        'country_of_origin', 'jpk_classification', 'markup_percent'
    ]
    
    # USUŃ list_editable - wszystkie edycje tylko przez formularz szczegółowy
    # list_editable = []  # Puste - edycja tylko przez kliknięcie w nazwę
    
    # Uczyń nazwę produktu linkiem do edycji
    list_display_links = ['full_name']
    
    # Kolumny do wyszukiwania
    search_fields = ['full_name', 'catalog_index', 'short_name', 'producer', 'barcode']
    
    # Filtry boczne
    list_filter = ['r', 'unit', 'producer', 'vat_sale']
    
    # Liczba elementów na stronę
    list_per_page = 25  # Zmniejszone bo więcej kolumn
    
    # Sortowanie domyślne
    ordering = ['full_name']
    
    # Pola tylko do odczytu
    readonly_fields = ['id']
    
    # Organizacja pól w formularzu edycji
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': (
                'r', 'full_name', 'short_name', 'original_name', 
                'catalog_index', 'barcode', 'unit'
            ),
            'classes': ('wide',)
        }),
        ('Stan magazynowy', {
            'fields': (
                'stock', 'available_quantity', 'reserved', 
                'suppliers_will_deliver', 'recipients_will_receive'
            ),
            'classes': ('wide',)
        }),
        ('Ceny i marże', {
            'fields': (
                'purchase_price_net', 'purchase_price_net_currency',
                'sale_price_net', 'vat_sale', 'margin_percent', 'markup_percent'
            ),
            'classes': ('wide',)
        }),
        ('Informacje o producencie', {
            'fields': (
                'producer', 'producer_index', 'article_number', 
                'country_of_origin', 'cn_code'
            ),
            'classes': ('wide',)
        }),
        ('Dodatkowe pola', {
            'fields': (
                'f', 's', 'attachment', 'marker', 'a', 'jpk_classification'
            ),
            'classes': ('wide',)
        })
    )
    
    # Akcje masowe
    actions = ['make_materiał', 'make_towar', 'make_produkt', 'reset_stock']
    
    def make_materiał(self, request, queryset):
        updated = queryset.update(r='Materiał')
        self.message_user(request, f'{updated} komponentów zostało zmienionych na "Materiał".')
    make_materiał.short_description = "Zmień zaznaczone na Materiał"
    
    def make_towar(self, request, queryset):
        updated = queryset.update(r='Towar')
        self.message_user(request, f'{updated} komponentów zostało zmienionych na "Towar".')
    make_towar.short_description = "Zmień zaznaczone na Towar"
    
    def make_produkt(self, request, queryset):
        updated = queryset.update(r='Produkt')
        self.message_user(request, f'{updated} komponentów zostało zmienionych na "Produkt".')
    make_produkt.short_description = "Zmień zaznaczone na Produkt"
    
    def reset_stock(self, request, queryset):
        updated = queryset.update(stock=0, available_quantity=0)
        self.message_user(request, f'Stan magazynowy {updated} komponentów został wyzerowany.')
    reset_stock.short_description = "Wyzeruj stan magazynowy"
    
    # Niestandardowe etykiety pól - polskie tłumaczenia dla kolumn
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Polskie nazwy pól
        field_labels = {
            'r': 'Typ',
            'full_name': 'Nazwa pełna',
            'stock': 'Stan magazynowy',
            'available_quantity': 'Ilość dostępna',
            'unit': 'Jednostka miary',
            'purchase_price_net': 'Cena zakupu netto',
            'sale_price_net': 'Cena sprzedaży netto',
            'barcode': 'Kod kreskowy',
            'catalog_index': 'Indeks katalogowy',
            'reserved': 'Zarezerwowane',
            'short_name': 'Nazwa krótka',
            'original_name': 'Nazwa oryginalna',
            'suppliers_will_deliver': 'Dostawcy dostarczą',
            'recipients_will_receive': 'Odbiorcy odbiorą',
            'purchase_price_net_currency': 'Cena zakupu netto (waluta)',
            'vat_sale': 'VAT sprzedaży (%)',
            'margin_percent': 'Marża (%)',
            'f': 'Pole F',
            'producer': 'Producent',
            'article_number': 'Numer artykułu',
            's': 'Pole S',
            'attachment': 'Załącznik',
            'marker': 'Wyróżnik',
            'a': 'Pole A',
            'producer_index': 'Indeks producenta',
            'cn_code': 'Kod CN',
            'country_of_origin': 'Kraj pochodzenia',
            'jpk_classification': 'Klasyfikacja JPK',
            'markup_percent': 'Narzut (%)'
        }
        
        for field_name, label in field_labels.items():
            if field_name in form.base_fields:
                form.base_fields[field_name].label = label
        
        return form

# Rejestracja modelu Product (jeśli jest potrzebny)
admin.site.register(Product)

# Customizacja nagłówków admin
admin.site.site_header = "E-Posejdon ERP – Panel Administracyjny"
admin.site.site_title = "E-Posejdon ERP"
admin.site.index_title = "Zarządzanie systemem"