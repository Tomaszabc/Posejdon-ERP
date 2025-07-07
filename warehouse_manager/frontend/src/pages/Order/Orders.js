import React, { useState, useEffect, useRef } from 'react';
import OrderDeleteModal from '../../components/modals/OrderDeleteModal';
import OrderConfirmModal from '../../components/modals/OrderConfirmModal';
import OrderList from './OrderList';
import { API_URL, WS_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [form, setForm] = useState({ component: '', quantity: '', uwagi: '' });
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [components, setComponents] = useState([]);
  const ORDERS_LIMIT = 100;
  const [showFilters, setShowFilters] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    quantity: '',
    sku: '',
  });
  const ws = useRef(null);
  const [productSearch, setProductSearch] = useState('');
  const [productInputFocused, setProductInputFocused] = useState(false);

  // Nowe stany do edycji uwag
  const [showUwagiModal, setShowUwagiModal] = useState(false);
  const [editingUwagiOrder, setEditingUwagiOrder] = useState(null);
  const [tempUwagi, setTempUwagi] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/components-for-order/`)
      .then((res) => res.json())
      .then(setComponents);
  }, []);

  useEffect(() => {
    fetchOrders();
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'refresh') {
        fetchOrders();
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  function fetchOrders() {
    const token = localStorage.getItem('access');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/product-to-production/`, {
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
      })
      .catch(() => {
        setOrders([]);
      });
  }

  // Filtrowanie zamówień (po dacie, ilości, SKU)
  const filteredOrders = orders
    .filter((order) => {
      if (filters.startDate && new Date(order.created_at) < new Date(filters.startDate))
        return false;
      if (filters.endDate && new Date(order.created_at) > new Date(filters.endDate)) return false;
      if (filters.quantity && !String(order.quantity).startsWith(String(filters.quantity)))
        return false;
      if (
        filters.sku &&
        !order.component_catalog_index?.toLowerCase().includes(filters.sku.toLowerCase())
      )
        return false;
      return true;
    })
    .slice(0, ORDERS_LIMIT);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () =>
    setFilters({
      startDate: '',
      endDate: '',
      quantity: '',
      sku: '',
    });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    let newErrors = [];
    if (!form.component) newErrors.push('Wybierz produkt.');
    if (!form.quantity) newErrors.push('Podaj ilość.');
    setErrors(newErrors);
    if (newErrors.length === 0) setShowConfirmModal(true);
  }

  function handleConfirmSubmit() {
    const token = localStorage.getItem('access');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/product-to-production/`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        component: form.component,
        quantity: form.quantity,
        uwagi: form.uwagi,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd zapisu zamówienia');
        return res.json();
      })
      .then(() => {
        fetchOrders();
        setForm({
          component: '',
          quantity: '',
          uwagi: '',
        });
        setProductSearch('');
        setShowConfirmModal(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
      })
      .catch((err) => setErrors([err.message]));
  }

  function openDeleteModal(order) {
    setOrderToDelete(order);
    setShowModal(true);
  }

  function closeDeleteModal() {
    setShowModal(false);
    setOrderToDelete(null);
  }

  function handleDelete() {
    if (!orderToDelete) return;

    const token = localStorage.getItem('access');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/product-to-production/${orderToDelete.id}/`, {
      method: 'DELETE',
      headers: headers,
    }).then((res) => {
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderToDelete.id));
        closeDeleteModal();
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 1000);
      } else {
        alert('Błąd podczas usuwania zamówienia.');
      }
    });
  }

  // Funkcje do edycji uwag
  function openUwagiModal(order) {
    setEditingUwagiOrder(order);
    setTempUwagi(order.uwagi || '');
    setShowUwagiModal(true);
  }

  function closeUwagiModal() {
    setShowUwagiModal(false);
    setEditingUwagiOrder(null);
    setTempUwagi('');
  }

  function saveUwagi() {
    if (!editingUwagiOrder) return;
    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/product-to-production/${editingUwagiOrder.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uwagi: tempUwagi }),
    }).then((res) => {
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === editingUwagiOrder.id ? { ...o, uwagi: tempUwagi } : o))
        );
        closeUwagiModal();
      }
    });
  }

  function clearUwagi() {
    setTempUwagi('');
  }

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
        {/* LEWA STRONA - NOWY FORMULARZ (30%) */}
        <section className="xl:col-span-3 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            Zamów gotowy produkt
            <img
              src="/diffuser_white_small.png"
              alt="Dyfuzor"
              className="inline-block w-16 h-16 ml-2 align-middle"
              style={{ borderRadius: '0.1rem' }}
            />
          </h1>
          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <ul className="list-disc pl-5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wybierz produkt
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500 mb-2"
                  placeholder="Wpisz nazwę lub SKU produktu..."
                  value={
                    form.component
                      ? components.find((c) => String(c.id) === String(form.component))
                          ?.full_name || productSearch
                      : productSearch
                  }
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setForm((prev) => ({ ...prev, component: '' }));
                  }}
                  onFocus={() => setProductInputFocused(true)}
                  onBlur={() => setTimeout(() => setProductInputFocused(false), 150)}
                  autoComplete="off"
                />
                {productInputFocused && !form.component && (
                  <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                    {components
                      .filter((c) => c.r === 'Produkt')
                      .filter(
                        (c) =>
                          c.full_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          c.catalog_index.toLowerCase().includes(productSearch.toLowerCase())
                      )

                      .map((c) => (
                        <li
                          key={c.id}
                          className="px-3 py-2 cursor-pointer hover:bg-ocean-100 text-black"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, component: c.id }));
                            setProductSearch(c.full_name);
                            setProductInputFocused(false);
                          }}
                        >
                          {c.catalog_index} – {c.full_name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ilość</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uwagi</label>
              <input
                type="text"
                name="uwagi"
                value={form.uwagi}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
                placeholder="Wpisz uwagi (opcjonalnie)"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Zatwierdź zamówienie
              </button>
            </div>
          </form>
        </section>

        {/* PRAWA STRONA - LISTA ZAMÓWIEŃ I FILTRY (70%) */}
        <section className="xl:col-span-7 bg-white shadow-2xl rounded-3xl p-4 sm:p-8 border border-gray-100">
          {/* Header z responsywnymi przyciskami */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              Lista zamówień
              {!filters.startDate && !filters.endDate && !filters.quantity && !filters.sku && (
                <span className="ml-1 relative group">
                  <span className="inline-block align-middle cursor-pointer group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline w-5 h-5 sm:w-7 sm:h-7 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" fill="white" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 16v-4m0-4h.01"
                      />
                    </svg>
                    <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      {ORDERS_LIMIT} najnowszych
                    </span>
                  </span>
                </span>
              )}
            </h2>

            {/* Przyciski - na mobile w kolumnie, na desktop w rzędzie */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm text-xs sm:text-sm"
              >
                🔍 {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm text-xs sm:text-sm"
              >
                🗑️ Wyczyść filtry
              </button>
            </div>
          </div>

          {/* Panel filtrów */}
          {showFilters && (
            <div
              className={`bg-gray-50 rounded-xl mb-6 overflow-hidden transition-all duration-500`}
              style={{
                maxHeight: showFilters ? 1000 : 0,
                opacity: showFilters ? 1 : 0,
                pointerEvents: showFilters ? 'auto' : 'none',
                transition: 'max-height 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
              }}
            >
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">Filtry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Od daty</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Do daty</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ilość</label>
                    <input
                      type="number"
                      name="quantity"
                      value={filters.quantity}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                      placeholder="Dowolna"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={filters.sku}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                      placeholder="Wpisz SKU"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista zamówień */}
          <OrderList
            orders={filteredOrders.map((order) => ({
              ...order,
              uwagi: order.uwagi || '',
            }))}
            openDeleteModal={openDeleteModal}
            openUwagiModal={openUwagiModal}
          />
        </section>
      </div>

      {/* MODALNE */}
      {showModal && orderToDelete && (
        <OrderDeleteModal
          order={orderToDelete}
          onDelete={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}

      {showConfirmModal && (
        <OrderConfirmModal
          order={form}
          components={components}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showUwagiModal && editingUwagiOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edytuj uwagi - Zamówienie #{editingUwagiOrder.id}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Uwagi:</label>
              <textarea
                value={tempUwagi}
                onChange={(e) => setTempUwagi(e.target.value)}
                maxLength={255}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Wpisz uwagi..."
              />
              <div className="text-xs text-gray-500 mt-1">{tempUwagi.length}/255 znaków</div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={clearUwagi}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Wyczyść
              </button>
              <button
                onClick={closeUwagiModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zamknij
              </button>
              <button
                onClick={saveUwagi}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Dodano zamówienie!
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Zamówienie usunięte!
          </div>
        </div>
      )}
    </div>
  );
}
