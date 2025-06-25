import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, WS_URL } from '../../../config';

export default function ProductsAndGoods() {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 25;
  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);
  const ws = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredComponents]);

  const paginatedComponents = showAll
    ? filteredComponents
    : filteredComponents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    link.setAttribute('download', 'materialy_produkcyjne.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [newComponent, setNewComponent] = useState({
    r: 'Materiał',
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
          r: 'Materiał',
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          <span className="ml-3 text-gray-600">Ładowanie materiałów produkcyjnych...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-ocean-900 mb-2 break-words">
              🧱 Surowce produkcyjne
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Materiały magazynowe (typ R = "Materiał")
            </p>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden w-full">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              <span className="hidden lg:inline">Importuj CSV</span>
              <span className="lg:hidden">Import</span>
            </button>

            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
              title="Eksportuj do CSV"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden lg:inline">Eksportuj CSV</span>
              <span className="lg:hidden">Export</span>
            </button>

            {selectedComponents.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden lg:inline">
                  Usuń zaznaczone ({selectedComponents.size})
                </span>
                <span className="lg:hidden">Usuń ({selectedComponents.size})</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm lg:text-base"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden lg:inline">Dodaj materiał</span>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Dodaj materiał
            </button>
          </div>
        )}

        {filteredComponents.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              💡 <strong>Liczba materiałów:</strong> {filteredComponents.length}
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
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Potwierdzenie usunięcia
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Czy na pewno chcesz usunąć {selectedComponents.size} zaznaczonych materiałów?
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  Ta operacja jest nieodwracalna. Wszystkie dane o zaznaczonych materiałach zostaną
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
                  Usuń materiały
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal dodawania */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Dodaj nowy materiał</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddComponent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Podstawowe informacje */}
                <div className="col-span-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Podstawowe informacje
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select
                    name="r"
                    value={newComponent.r}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value="Materiał">Materiał</option>
                    <option value="Towar">Towar</option>
                    <option value="Produkt">Produkt</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa pełna *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={newComponent.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    placeholder="Wprowadź pełną nazwę materiału"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa krótka
                  </label>
                  <input
                    type="text"
                    name="short_name"
                    value={newComponent.short_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jednostka miary
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={newComponent.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stan magazynowy
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="stock"
                    value={newComponent.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Ceny */}
                <div className="col-span-full mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ceny i marże</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cena zakupu netto (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price_net"
                    value={newComponent.purchase_price_net}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cena sprzedaży netto (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="sale_price_net"
                    value={newComponent.sale_price_net}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT sprzedaży (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="vat_sale"
                    value={newComponent.vat_sale}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Dodatkowe informacje */}
                <div className="col-span-full mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatkowe informacje</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod kreskowy
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={newComponent.barcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indeks katalogowy
                  </label>
                  <input
                    type="text"
                    name="catalog_index"
                    value={newComponent.catalog_index}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producent</label>
                  <input
                    type="text"
                    name="producer"
                    value={newComponent.producer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numer artykułu
                  </label>
                  <input
                    type="text"
                    name="article_number"
                    value={newComponent.article_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kraj pochodzenia
                  </label>
                  <input
                    type="text"
                    name="country_of_origin"
                    value={newComponent.country_of_origin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Dodaj materiał
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal edytowania */}
      {showEditModal && editingComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edytuj komponent</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditComponent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Podstawowe informacje */}
                <div className="col-span-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Podstawowe informacje
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select
                    name="r"
                    value={editingComponent.r}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value="Towar">Towar</option>
                    <option value="Produkt">Produkt</option>
                    <option value="Materiał">Materiał</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa pełna *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={editingComponent.full_name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa krótka
                  </label>
                  <input
                    type="text"
                    name="short_name"
                    value={editingComponent.short_name || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jednostka miary
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={editingComponent.unit}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stan magazynowy
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="stock"
                    value={editingComponent.stock}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Ceny */}
                <div className="col-span-full mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ceny i marże</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cena zakupu netto (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price_net"
                    value={editingComponent.purchase_price_net}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cena sprzedaży netto (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="sale_price_net"
                    value={editingComponent.sale_price_net}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT sprzedaży (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="vat_sale"
                    value={editingComponent.vat_sale}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Dodatkowe informacje */}
                <div className="col-span-full mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatkowe informacje</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod kreskowy
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={editingComponent.barcode || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indeks katalogowy
                  </label>
                  <input
                    type="text"
                    name="catalog_index"
                    value={editingComponent.catalog_index || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producent</label>
                  <input
                    type="text"
                    name="producer"
                    value={editingComponent.producer || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numer artykułu
                  </label>
                  <input
                    type="text"
                    name="article_number"
                    value={editingComponent.article_number || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kraj pochodzenia
                  </label>
                  <input
                    type="text"
                    name="country_of_origin"
                    value={editingComponent.country_of_origin || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Zapisz zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
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
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Akcje
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  R
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px]">
                  Nazwa cała
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Stan
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Ilość dostępna
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  j.m.
                </th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Cena zakupu netto
                </th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Cena sprzedaży netto
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Kod kreskowy
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Indeks katalogowy
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Zarezerwowano
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Nazwa krótka
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Nazwa oryg.
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Dostawcy dostarczą
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Odbiorcy odbiorą
                </th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  C. zakupu netto wal.
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Vat sprz.
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Marża [%]
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  F
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Producent
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Nr artykułu
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  S
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Zał.
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Wyróżnik
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  A
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Indeks producenta
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Kod CN
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Kraj pochodzenia
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  JPK Klasyfikacja
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Narzut [%]
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedComponents.length === 0 ? (
                <tr>
                  <td colSpan={31} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
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
                      <p className="text-lg font-medium text-gray-400">
                        Brak materiałów w magazynie
                      </p>
                      <p className="text-sm text-gray-400">
                        Dodaj pierwszy materiał, aby rozpocząć
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedComponents.map((comp, index) => (
                  <tr
                    key={comp.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    } ${selectedComponents.has(comp.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedComponents.has(comp.id)}
                        onChange={() => toggleComponentSelection(comp.id)}
                        className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        onClick={() => openEditModal(comp)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                        title="Edytuj materiał"
                      >
                        <svg
                          className="w-4 h-4"
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
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comp.r === 'Materiał'
                            ? 'bg-orange-100 text-orange-800'
                            : comp.r === 'Towar'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {comp.r || 'N/A'}
                      </span>
                    </td>
                    {/* Reszta komórek tabeli bez zmian */}
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-gray-900">{comp.full_name}</div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(comp.stock) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {comp.stock}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.available_quantity}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700 font-medium">
                      {comp.unit}
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                      {parseFloat(comp.purchase_price_net).toFixed(2)} zł
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium text-green-600">
                      {parseFloat(comp.sale_price_net).toFixed(2)} zł
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700 font-mono">
                      {comp.barcode || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.catalog_index || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {parseFloat(comp.reserved) > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {comp.reserved}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.short_name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.original_name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.suppliers_will_deliver}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.recipients_will_receive}
                    </td>
                    <td className="px-3 py-4 text-right text-sm text-gray-700">
                      {parseFloat(comp.purchase_price_net_currency).toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.vat_sale}%
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-medium text-blue-600">
                      {comp.margin_percent}%
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.f || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.producer || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.article_number || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.s || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.attachment || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.marker || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.a || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.producer_index || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.cn_code || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.country_of_origin || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.jpk_classification || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">
                      {comp.markup_percent}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACJA - dodaj POZA <table> i POZA <div className="overflow-x-auto">
      {(totalPages > 1 || showAll) && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
          {!showAll && totalPages > 1 && (
            <>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                &laquo;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                &raquo;
              </button>
            </>
          )}
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-medium"
          >
            {showAll ? 'Paginacja' : 'Wyświetl wszystkie'}
          </button>
        </div>
      )} */}

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
