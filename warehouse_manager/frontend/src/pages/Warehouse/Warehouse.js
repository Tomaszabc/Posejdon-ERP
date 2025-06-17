import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, WS_URL } from '../../config';

export default function Warehouse() {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const ws = useRef(null);

  // Funkcja do eksportu CSV
  const exportToCSV = () => {
    const exportData =
      selectedComponents.size > 0
        ? filteredComponents.filter((comp) => selectedComponents.has(comp.id))
        : filteredComponents;

    if (exportData.length === 0) {
      alert('Brak danych do eksportu!');
      return;
    }

    const headers = [
      'R', 'Nazwa cała', 'Stan', 'Ilość dostępna', 'j.m.',
      'Cena zakupu netto', 'Cena sprzedaży netto', 'Kod kreskowy',
      'Indeks katalogowy', 'Zarezerwowano', 'Nazwa krótka', 'Nazwa oryg.',
      'Dostawcy dostarczą', 'Odbiorcy odbiorą', 'C. zakupu netto wal.',
      'Vat sprz.', 'Marża [%]', 'F', 'Producent', 'Nr artykułu',
      'S', 'Zał.', 'Wyróżnik', 'A', 'Indeks producenta',
      'Kod CN', 'Kraj pochodzenia', 'JPK Klasyfikacja', 'Narzut [%]',
    ];

    const rows = exportData.map((comp) => [
      comp.r, comp.full_name, comp.stock, comp.available_quantity, comp.unit,
      comp.purchase_price_net, comp.sale_price_net, comp.barcode,
      comp.catalog_index, comp.reserved, comp.short_name, comp.original_name,
      comp.suppliers_will_deliver, comp.recipients_will_receive,
      comp.purchase_price_net_currency, comp.vat_sale, comp.margin_percent,
      comp.f, comp.producer, comp.article_number, comp.s, comp.attachment,
      comp.marker, comp.a, comp.producer_index, comp.cn_code,
      comp.country_of_origin, comp.jpk_classification, comp.markup_percent,
    ]);

    let csvContent = '';
    csvContent += headers.join(';') + '\n';
    rows.forEach((row) => {
      csvContent +=
        row.map((val) => (val !== null && val !== undefined ? `"${val}"` : '')).join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'components_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [newComponent, setNewComponent] = useState({
    r: 'Towar',
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
        const nonMaterials = data.filter((comp) => comp.r !== 'Materiał');
        setFilteredComponents(nonMaterials);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'refresh') {
        fetchComponents();
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

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
          r: 'Towar',
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
        alert('Błąd podczas dodawania komponentu');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Błąd podczas dodawania komponentu');
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
        alert('Błąd podczas aktualizacji komponentu');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Błąd podczas aktualizacji komponentu');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedComponents.size === 0) {
      alert('Nie zaznaczono żadnych komponentów do usunięcia');
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
        alert(`Pomyślnie usunięto ${selectedComponents.size} komponentów`);
      } else {
        alert(`Błąd podczas usuwania ${failedDeletes.length} komponentów`);
      }
    } catch (error) {
      console.error('Błąd podczas usuwania:', error);
      alert('Błąd podczas usuwania komponentów');
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          <span className="ml-3 text-gray-600">Ładowanie magazynu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Link do Parts Buildera */}
      <Link
        to="/warehouse/parts-builder"
        className="inline-block mt-2 sm:mt-4 px-3 sm:px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition text-sm sm:text-base"
      >
        Przypisz komponenty do produktu (Parts Builder)
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-ocean-900 mb-2 break-words">
              📦 Magazyn – Komponenty
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Komponenty magazynowe (bez materiałów)
            </p>
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
          <div className="hidden sm:flex gap-2 lg:gap-3 flex-wrap">
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
              title="Importuj z CSV"
              onClick={() => document.getElementById('import-csv').click()}
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              <span className="hidden lg:inline">Importuj CSV</span>
              <span className="lg:hidden">Import</span>
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
              title="Eksportuj do CSV"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden lg:inline">Eksportuj CSV</span>
              <span className="lg:hidden">Export</span>
            </button>
            
            {selectedComponents.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden lg:inline">Usuń zaznaczone ({selectedComponents.size})</span>
                <span className="lg:hidden">Usuń ({selectedComponents.size})</span>
              </button>
            )}
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden lg:inline">Dodaj komponent</span>
              <span className="lg:hidden">Dodaj</span>
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
              Dodaj komponent
            </button>
          </div>
        )}

        {filteredComponents.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              💡 <strong>Liczba komponentów:</strong> {filteredComponents.length}
              {selectedComponents.size > 0 && (
                <span className="block sm:inline sm:ml-4 mt-1 sm:mt-0">
                  <strong>Zaznaczone:</strong> {selectedComponents.size} pozycji
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Modal potwierdzenia usunięcia */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.083 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Potwierdzenie usunięcia</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Czy na pewno chcesz usunąć {selectedComponents.size} zaznaczonych komponentów?
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  Ta operacja jest nieodwracalna. Wszystkie dane o zaznaczonych komponentach zostaną
                  trwale usunięte.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
                >
                  Usuń komponenty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal dodawania - responsywny */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Dodaj nowy komponent</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddComponent} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Podstawowe informacje */}
                <div className="col-span-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Podstawowe informacje
                  </h3>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select
                    name="r"
                    value={newComponent.r}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value="Towar">Towar</option>
                    <option value="Produkt">Produkt</option>
                    <option value="Materiał">Materiał</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nazwa pełna *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={newComponent.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    placeholder="Wprowadź pełną nazwę komponentu"
                  />
                </div>

                {/* Pozostałe pola podobnie z responsive klasami */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nazwa krótka
                  </label>
                  <input
                    type="text"
                    name="short_name"
                    value={newComponent.short_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Jednostka miary
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={newComponent.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Stan magazynowy
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="stock"
                    value={newComponent.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Pozostałe pola formularza... */}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors order-1 sm:order-2"
                >
                  Dodaj komponent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal edytowania - responsywny (podobnie jak modal dodawania) */}
      {showEditModal && editingComponent && (
        // Podobna struktura jak modal dodawania...
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          {/* Treść modala... */}
        </div>
      )}

      {/* Tabela - responsywna */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider sticky left-0 bg-ocean-600 z-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredComponents.length > 0 &&
                      selectedComponents.size === filteredComponents.length
                    }
                    onChange={selectAllComponents}
                    className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  />
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider sticky left-8 sm:left-12 bg-ocean-600 z-10">
                  Akcje
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  R
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">
                  Nazwa cała
                </th>
                {/* Pozostałe nagłówki tabeli... */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={31} className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="flex flex-col items-center px-4">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <p className="text-base sm:text-lg font-medium text-gray-400">
                        Brak komponentów w magazynie
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Dodaj pierwszy komponent, aby rozpocząć
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComponents.map((comp, index) => (
                  <tr
                    key={comp.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    } ${selectedComponents.has(comp.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <td className="px-2 sm:px-3 py-3 sm:py-4 text-center sticky left-0 bg-inherit z-10">
                      <input
                        type="checkbox"
                        checked={selectedComponents.has(comp.id)}
                        onChange={() => toggleComponentSelection(comp.id)}
                        className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-3 sm:py-4 text-center sticky left-8 sm:left-12 bg-inherit z-10">
                      <button
                        onClick={() => openEditModal(comp)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 sm:p-2 rounded-lg transition-colors"
                        title="Edytuj komponent"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </td>
                    {/* Pozostałe komórki tabeli z responsive klasami... */}
                    <td className="px-2 sm:px-3 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          comp.r === 'Towar'
                            ? 'bg-green-100 text-green-800'
                            : comp.r === 'Usługa'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {comp.r || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                        {comp.full_name}
                      </div>
                    </td>
                    {/* Pozostałe komórki... */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      {filteredComponents.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 px-2 sm:px-4">
          Wyświetlono {filteredComponents.length} komponentów • Przewiń w prawo, aby zobaczyć
          wszystkie kolumny
        </div>
      )}
    </div>
  );
}