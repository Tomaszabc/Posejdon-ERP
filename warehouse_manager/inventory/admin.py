from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import (
    Component, ProductToProduction, PartsBuilder
)
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Count
from django.utils import timezone


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

@admin.register(ProductToProduction)
class ProductToProductionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'component', 'quantity', 'is_produced', 'pilne', 
        'created_at', 'produced_at', 'created_by', 'missing_parts_send_to_production'
    ]
    list_filter = [
        'is_produced', 'pilne', 'missing_parts_send_to_production', 
        'created_at', 'component__r'
    ]
    search_fields = [
        'component__full_name', 'component__catalog_index', 
        'komentarz', 'uwagi'
    ]
    readonly_fields = ['created_at', 'id']
    list_editable = ['is_produced', 'pilne']
    
    fieldsets = (
        ('Podstawowe dane', {
            'fields': ('component', 'quantity', 'created_by'),
            'classes': ('wide',)
        }),
        ('Status i priorytety', {
            'fields': (
                'is_produced', 'produced_at', 'pilne', 
                'missing_parts_send_to_production'
            ),
            'classes': ('wide',)
        }),
        ('Komentarze', {
            'fields': ('komentarz', 'uwagi'),
            'classes': ('wide',)
        }),
        ('Informacje systemowe', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_produced', 'mark_as_urgent', 'send_missing_to_production']
    
    def mark_as_produced(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_produced=True, produced_at=timezone.now())
        self.message_user(request, f'{updated} pozycji zostało oznaczonych jako wyprodukowane.')
    mark_as_produced.short_description = "Oznacz jako wyprodukowane"
    
    def mark_as_urgent(self, request, queryset):
        updated = queryset.update(pilne=True)
        self.message_user(request, f'{updated} pozycji zostało oznaczonych jako pilne.')
    mark_as_urgent.short_description = "Oznacz jako pilne"
    
    def send_missing_to_production(self, request, queryset):
        updated = queryset.update(missing_parts_send_to_production=True)
        self.message_user(request, f'{updated} pozycji - brakujące części wysłane do produkcji.')
    send_missing_to_production.short_description = "Wyślij brakujące części do produkcji"

@admin.register(PartsBuilder)
class PartsBuilderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product', 'material', 'quantity_needed', 
        'total_cost_display', 'created_at', 'updated_at'
    ]
    list_filter = [
        'product__r', 'material__r', 'created_at',
        'product__producer', 'material__producer'
    ]
    search_fields = [
        'product__full_name', 'product__catalog_index',
        'material__full_name', 'material__catalog_index',
        'notes'
    ]
    readonly_fields = ['created_at', 'updated_at', 'total_cost_display']
    
    fieldsets = (
        ('Przepis produktu', {
            'fields': ('product', 'material', 'quantity_needed'),
            'classes': ('wide',)
        }),
        ('Kalkulacja kosztów', {
            'fields': ('total_cost_display',),
            'classes': ('wide',)
        }),
        ('Dodatkowe informacje', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
        ('Informacje systemowe', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def total_cost_display(self, obj):
        """Wyświetl skalkulowany koszt materiału"""
        if obj.material and obj.material.purchase_price_net:
            total = obj.total_cost()
            return f"{total:.2f} PLN"
        return "Brak ceny materiału"
    total_cost_display.short_description = "Koszt materiału na 1 szt."

# Polskie nazwy kolumn w tabeli
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

# Customizacja nagłówków admin
admin.site.site_header = "E-Posejdon ERP – Panel Administracyjny"
admin.site.site_title = "E-Posejdon ERP"
admin.site.index_title = "Zarządzanie systemem"