import React, { useState } from 'react';
import ProductsAndGoodsHeader from './ProductsAndGoodsHeader';
import ProductsAndGoodsTable from './ProductsAndGoodsTable';
import ProductsAndGoodsEditModal from './ProductsAndGoodsEditModal';
import ProductsAndGoodsAddModal from './ProductsAndGoodsAddModal';
import ProductsAndGoodsDeleteConfirmModal from './ProductsAndGoodsDeleteConfirmModal';
import useComponents from './useComponents';
import { API_URL } from '../../../config';

export default function ProductsAndGoods() {
  const { filteredComponents, loading, fetchComponents } = useComponents();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Funkcja do eksportu CSV
  const exportToCSV = () => {
    // Jeśli są zaznaczone, eksportuj tylko zaznaczone, w przeciwnym razie wszystkie
    const exportData =
      selectedComponents.size > 0
        ? filteredComponents.filter((comp) => selectedComponents.has(comp.id))
        : filteredComponents;

    if (exportData.length === 0) {
      alert('Brak danych do eksportu!');
      return;
    }

    // Ustal nagłówki
    const headers = [
      'R',
      'Nazwa cała',
      'Stan',
      'Ilość dostępna',
      'j.m.',
      'Cena zakupu netto',
      'Cena sprzedaży netto',
      'Kod kreskowy',
      'Indeks katalogowy',
      'Zarezerwowano',
      'Nazwa krótka',
      'Nazwa oryg.',
      'Dostawcy dostarczą',
      'Odbiorcy odbiorą',
      'C. zakupu netto wal.',
      'Vat sprz.',
      'Marża [%]',
      'F',
      'Producent',
      'Nr artykułu',
      'S',
      'Zał.',
      'Wyróżnik',
      'A',
      'Indeks producenta',
      'Kod CN',
      'Kraj pochodzenia',
      'JPK Klasyfikacja',
      'Narzut [%]',
    ];

    // Mapuj dane
    const rows = exportData.map((comp) => [
      comp.r,
      comp.full_name,
      comp.stock,
      comp.available_quantity,
      comp.unit,
      comp.purchase_price_net,
      comp.sale_price_net,
      comp.barcode,
      comp.catalog_index,
      comp.reserved,
      comp.short_name,
      comp.original_name,
      comp.suppliers_will_deliver,
      comp.recipients_will_receive,
      comp.purchase_price_net_currency,
      comp.vat_sale,
      comp.margin_percent,
      comp.f,
      comp.producer,
      comp.article_number,
      comp.s,
      comp.attachment,
      comp.marker,
      comp.a,
      comp.producer_index,
      comp.cn_code,
      comp.country_of_origin,
      comp.jpk_classification,
      comp.markup_percent,
    ]);

    // Tworzenie CSV
    let csvContent = '';
    csvContent += headers.join(';') + '\n';
    rows.forEach((row) => {
      csvContent +=
        row.map((val) => (val !== null && val !== undefined ? `"${val}"` : '')).join(';') + '\n';
    });

    // Pobieranie pliku
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'materialy_produkcyjne.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [newComponent, setNewComponent] = useState({
    r: 'Materiał', // Domyślnie Materiał
    full_name: '',
    stock: '0.00',
    available_quantity: '0.00',
    unit: 'szt.',
    purchase_price_net: '0.00',
    sale_price_net: '0.00',
    barcode: '',
    catalog_index: '',
    reserved: '0.00',
    short_name: '',
    original_name: '',
    suppliers_will_deliver: '0.000',
    recipients_will_receive: '0.000',
    purchase_price_net_currency: '0.00',
    vat_sale: '23.00',
    margin_percent: '0.00',
    f: '0',
    producer: '',
    article_number: '',
    s: '0',
    attachment: '0',
    marker: '',
    a: '0',
    producer_index: '',
    cn_code: '',
    country_of_origin: '',
    jpk_classification: '',
    markup_percent: '0.00',
  });


  const handleAddComponent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/components/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComponent),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewComponent({
          r: 'Materiał', // Reset do Materiał
          full_name: '',
          stock: '0.00',
          available_quantity: '0.00',
          unit: 'szt.',
          purchase_price_net: '0.00',
          sale_price_net: '0.00',
          barcode: '',
          catalog_index: '',
          reserved: '0.00',
          short_name: '',
          original_name: '',
          suppliers_will_deliver: '0.000',
          recipients_will_receive: '0.000',
          purchase_price_net_currency: '0.00',
          vat_sale: '23.00',
          margin_percent: '0.00',
          f: '0',
          producer: '',
          article_number: '',
          s: '0',
          attachment: '0',
          marker: '',
          a: '0',
          producer_index: '',
          cn_code: '',
          country_of_origin: '',
          jpk_classification: '',
          markup_percent: '0.00',
        });
        fetchComponents();
      } else {
        alert('Błąd podczas dodawania materiału');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Błąd podczas dodawania materiału');
    }
  };

  const handleEditComponent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/components/${editingComponent.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingComponent),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingComponent(null);
        fetchComponents();
      } else {
        alert('Błąd podczas aktualizacji materiału');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Błąd podczas aktualizacji materiału');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedComponents.size === 0) {
      alert('Nie zaznaczono żadnych materiałów do usunięcia');
      return;
    }

    try {
      const deletePromises = Array.from(selectedComponents).map((id) =>
        fetch(`${API_URL}/api/components/${id}/`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter((response) => !response.ok);

      if (failedDeletes.length === 0) {
        setSelectedComponents(new Set());
        setShowDeleteConfirm(false);
        fetchComponents();
        alert(`Pomyślnie usunięto ${selectedComponents.size} materiałów`);
      } else {
        alert(`Błąd podczas usuwania ${failedDeletes.length} materiałów`);
      }
    } catch (error) {
      console.error('Błąd podczas usuwania:', error);
      alert('Błąd podczas usuwania materiałów');
    }
  };

  const toggleComponentSelection = (componentId) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(componentId)) {
      newSelected.delete(componentId);
    } else {
      newSelected.add(componentId);
    }
    setSelectedComponents(newSelected);
  };

  const selectAllComponents = () => {
    if (selectedComponents.size === filteredComponents.length) {
      setSelectedComponents(new Set());
    } else {
      setSelectedComponents(new Set(filteredComponents.map((comp) => comp.id)));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          <span className="ml-3 text-gray-600">Ładowanie materiałów produkcyjnych...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <ProductsAndGoodsHeader
        filteredComponents={filteredComponents}
        selectedComponents={selectedComponents}
        onImportCSV={() => {/* implementacja importu CSV */}}
        onExportCSV={exportToCSV}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        onShowAddModal={() => setShowAddModal(true)}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      {showDeleteConfirm && (
        <ProductsAndGoodsDeleteConfirmModal
          show={showDeleteConfirm}
          selectedCount={selectedComponents.size}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleBatchDelete}
        />
      )}

      {showAddModal && (
        <ProductsAndGoodsAddModal
          show={showAddModal}
          newComponent={newComponent}
          handleInputChange={(e) => setNewComponent((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddComponent}
        />
      )}

      {showEditModal && editingComponent && (
        <ProductsAndGoodsEditModal
          show={showEditModal}
          editingComponent={editingComponent}
          onChange={(e) => setEditingComponent((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
          onClose={() => {
            setShowEditModal(false);
            setEditingComponent(null);
          }}
          onSubmit={handleEditComponent}
        />
      )}

      <ProductsAndGoodsTable
        filteredComponents={filteredComponents}
        selectedComponents={selectedComponents}
        selectAllComponents={selectAllComponents}
        toggleComponentSelection={toggleComponentSelection}
        openEditModal={(comp) => {
          setEditingComponent({ ...comp });
          setShowEditModal(true);
        }}
      />

      {/* Footer info */}
      {filteredComponents.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Wyświetlono {filteredComponents.length} materiałów • Przewiń w prawo, aby zobaczyć
          wszystkie kolumny
        </div>
      )}
    </div>
  );
}
