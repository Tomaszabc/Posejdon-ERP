import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, WS_URL } from '../../../config';
import ProductsAndGoodsTable from './ProductsAndGoodsTable';
import ProductsAndGoodsEditModal from './ProductsAndGoodsEditModal';
import ProductsAndGoodsAddModal from './ProductsAndGoodsAddModal';
import ProductsAndGoodsDeleteConfirmModal from './ProductsAndGoodsDeleteConfirmModal';

export default function ProductsAndGoods() {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]); // Filtrowane komponenty
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'refresh') {
        fetchComponents(); // <-- odśwież dane magazynowe
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

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

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = () => {
    fetch(`${API_URL}/api/components/`)
      .then((res) => res.json())
      .then((data) => {
        setComponents(data);
        // Filtruj tylko Materiały
        const materials = data.filter((comp) => comp.r === 'Materiał');
        setFilteredComponents(materials);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setLoading(false);
      });
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComponent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingComponent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEditModal = (component) => {
    setEditingComponent({ ...component });
    setShowEditModal(true);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-ocean-900 mb-2">🧱 Surowce produkcyjne</h1>
            <p className="text-gray-600">Materiały magazynowe (typ R = "Materiał")</p>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden w-full">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu akcji
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-3 flex-wrap">
            <input
              type="file"
              accept=".csv"
              id="import-csv"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);

                const token = localStorage.getItem('access');
                try {
                  const response = await fetch(`${API_URL}/api/components/import/`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });
                  if (response.ok) {
                    alert('Import zakończony sukcesem!');
                    fetchComponents();
                  } else {
                    alert('Błąd importu CSV.');
                  }
                } catch (err) {
                  alert('Błąd importu CSV.');
                }
                e.target.value = '';
              }}
            />
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              title="Importuj z CSV"
              onClick={() => document.getElementById('import-csv').click()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Importuj CSV
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              title="Eksportuj do CSV"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Eksportuj CSV
            </button>
            {selectedComponents.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Usuń zaznaczone ({selectedComponents.size})
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj materiał
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 mt-4">
            <input
              type="file"
              accept=".csv"
              id="import-csv-mobile"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);

                const token = localStorage.getItem('access');
                try {
                  const response = await fetch(`${API_URL}/api/components/import/`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });
                  if (response.ok) {
                    alert('Import zakończony sukcesem!');
                    fetchComponents();
                  } else {
                    alert('Błąd importu CSV.');
                  }
                } catch (err) {
                  alert('Błąd importu CSV.');
                }
                e.target.value = '';
                setShowMobileMenu(false);
              }}
            />
            <button
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              onClick={() => document.getElementById('import-csv-mobile').click()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Importuj CSV
            </button>
            <button
              onClick={() => {
                exportToCSV();
                setShowMobileMenu(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Eksportuj CSV
            </button>
            {selectedComponents.size > 0 && (
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMobileMenu(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Usuń zaznaczone ({selectedComponents.size})
              </button>
            )}
            <button
              onClick={() => {
                setShowAddModal(true);
                setShowMobileMenu(false);
              }}
              className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj materiał
            </button>
          </div>
        )}

        {filteredComponents.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Liczba materiałów:</strong> {filteredComponents.length} |
              {selectedComponents.size > 0 && (
                <span className="ml-4">
                  <strong>Zaznaczone:</strong> {selectedComponents.size} pozycji
                </span>
              )}
            </p>
          </div>
        )}
      </div>

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
          handleInputChange={handleInputChange}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddComponent}
        />
      )}

     
      {showEditModal && editingComponent && (
        <ProductsAndGoodsEditModal
          show={showEditModal}
          editingComponent={editingComponent}
          onChange={handleEditInputChange}
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
        openEditModal={openEditModal}
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
