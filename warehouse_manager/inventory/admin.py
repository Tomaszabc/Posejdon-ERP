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
    
    # Uczyń nazwę produktu linkiem do edycji
    list_display_links = ['full_name']
    
    # Kolumny do wyszukiwania
    search_fields = ['full_name', 'catalog_index', 'short_name', 'producer', 'barcode']
    
    # Filtry boczne
    list_filter = ['r', 'unit', 'producer', 'vat_sale']
    
    # Liczba elementów na stronę
    list_per_page = 25
    
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
    
    # POLSKIE NAZWY KOLUMN - nadpisanie nagłówków tabeli
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Wybierz komponent do edycji'
        return super().changelist_view(request, extra_context=extra_context)
    
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
    
    # Niestandardowe etykiety pól w formularzu edycji
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Polskie nazwy pól w formularzu
        field_labels = {
            'r': 'Typ',
            'full_name': 'Nazwa cała',
            'stock': 'Stan',
            'available_quantity': 'Ilość dostępna',
            'unit': 'j.m.',
            'purchase_price_net': 'Cena zakupu netto',
            'sale_price_net': 'Cena sprzedaży netto',
            'barcode': 'Kod kreskowy',
            'catalog_index': 'Indeks katalogowy',
            'reserved': 'Zarezerwowano',
            'short_name': 'Nazwa krótka',
            'original_name': 'Nazwa oryg.',
            'suppliers_will_deliver': 'Dostawcy dostarczą',
            'recipients_will_receive': 'Odbiorcy odbiorą',
            'purchase_price_net_currency': 'C. zakupu netto wal.',
            'vat_sale': 'Vat sprz.',
            'margin_percent': 'Marża [%]',
            'f': 'F',
            'producer': 'Producent',
            'article_number': 'Nr artykułu',
            's': 'S',
            'attachment': 'Zał.',
            'marker': 'Wyróżnik',
            'a': 'A',
            'producer_index': 'Indeks producenta',
            'cn_code': 'Kod CN',
            'country_of_origin': 'Kraj pochodzenia',
            'jpk_classification': 'JPK Klasyfikacja',
            'markup_percent': 'Narzut [%]'
        }
        
        for field_name, label in field_labels.items():
            if field_name in form.base_fields:
                form.base_fields[field_name].label = label
        
        return form

# Polskie nazwy kolumn w tabeli - ustawiane POZA klasą
Component._meta.get_field('r').verbose_name = "Typ"
Component._meta.get_field('full_name').verbose_name = "Nazwa cała"
Component._meta.get_field('catalog_index').verbose_name = "Indeks katalogowy"
Component._meta.get_field('stock').verbose_name = "Stan"
Component._meta.get_field('available_quantity').verbose_name = "Ilość dostępna"
Component._meta.get_field('unit').verbose_name = "j.m."
Component._meta.get_field('purchase_price_net').verbose_name = "Cena zakupu netto"
Component._meta.get_field('sale_price_net').verbose_name = "Cena sprzedaży netto"
Component._meta.get_field('barcode').verbose_name = "Kod kreskowy"
Component._meta.get_field('reserved').verbose_name = "Zarezerwowano"
Component._meta.get_field('short_name').verbose_name = "Nazwa krótka"
Component._meta.get_field('original_name').verbose_name = "Nazwa oryg."
Component._meta.get_field('suppliers_will_deliver').verbose_name = "Dostawcy dostarczą"
Component._meta.get_field('recipients_will_receive').verbose_name = "Odbiorcy odbiorą"
Component._meta.get_field('purchase_price_net_currency').verbose_name = "C. zakupu netto wal."
Component._meta.get_field('vat_sale').verbose_name = "Vat sprz."
Component._meta.get_field('margin_percent').verbose_name = "Marża [%]"
Component._meta.get_field('f').verbose_name = "F"
Component._meta.get_field('producer').verbose_name = "Producent"
Component._meta.get_field('article_number').verbose_name = "Nr artykułu"
Component._meta.get_field('s').verbose_name = "S"
Component._meta.get_field('attachment').verbose_name = "Zał."
Component._meta.get_field('marker').verbose_name = "Wyróżnik"
Component._meta.get_field('a').verbose_name = "A"
Component._meta.get_field('producer_index').verbose_name = "Indeks producenta"
Component._meta.get_field('cn_code').verbose_name = "Kod CN"
Component._meta.get_field('country_of_origin').verbose_name = "Kraj pochodzenia"
Component._meta.get_field('jpk_classification').verbose_name = "JPK Klasyfikacja"
Component._meta.get_field('markup_percent').verbose_name = "Narzut [%]"

# Rejestracja modelu Product
admin.site.register(Product)

# Customizacja nagłówków admin
admin.site.site_header = "E-Posejdon ERP – Panel Administracyjny"
admin.site.site_title = "E-Posejdon ERP"
admin.site.index_title = "Zarządzanie systemem"