import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDeleteModal from '../../components/modals/OrderDeleteModal';
import MissingErrorModal from '../../components/modals/MissingErrorModal';
import UndoModal from '../../components/modals/UndoModal';
import UndoSuccessModal from '../../components/modals/UndoSuccessModal';
import ConfirmProductionModal from './ConfirmProductionModal';
import { API_URL, WS_URL } from '../../config';

export default function ComponentProduction() {
  const [form, setForm] = useState({ component: '', quantity: '', uwagi: '', pilne: false });
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [components, setComponents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingMaterials, setMissingMaterials] = useState([]);
  const [missingMessage, setMissingMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToProduce, setOrderToProduce] = useState(null);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [orderToUndo, setOrderToUndo] = useState(null);
  const [showUndoSuccess, setShowUndoSuccess] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [tempComment, setTempComment] = useState('');
  const navigate = useNavigate();
  const ws = useRef(null);
  const [componentSearch, setComponentSearch] = useState('');
  const [componentInputFocused, setComponentInputFocused] = useState(false);

  const openProduceModal = (order) => {
    setOrderToProduce(order);
    setShowProduceModal(true);
  };

  const openUndoModal = (order) => {
    setOrderToUndo(order);
    setShowUndoModal(true);
  };

  const closeUndoModal = () => {
    setShowUndoModal(false);
    setOrderToUndo(null);
  };

  useEffect(() => {
    // Pobierz tylko komponenty (r === 'Towar')
    fetch(`${API_URL}/api/components-for-order/`)
      .then((res) => res.json())
      .then((data) => setComponents(data.filter((c) => c.r === 'Towar')));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.action === 'refresh') {
          fetchOrders();
        }
      } catch (e) {
        // ignoruj błędy
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  function fetchOrders() {
    // Pobierz token z localStorage
    const token = localStorage.getItem('access');

    const headers = {};

    // Dodaj token jeśli istnieje
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/product-to-production/`, {
      headers: headers, // ✅ Dodaj headers
    })
      .then((res) => res.json())
      .then((data) => {
        // Pokaż tylko zamówienia na komponenty typu 'Towar' i posortuj po ID
        const filteredOrders = data
          .filter(
            (o) =>
              o.component_r === 'Towar' &&
              !(o.component_catalog_index && o.component_catalog_index.includes('-24-'))
          )
          .sort((a, b) => b.id - a.id);
        setOrders(filteredOrders);
      })
      .catch(() => {
        setOrders([]);
      });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  const handleProduceOrder = () => {
    // Najpierw sprawdź dostępność materiałów
    fetch(`${API_URL}/api/check-materials-availability/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component: orderToProduce.component || orderToProduce.id,
        quantity: orderToProduce.quantity,
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          // Materiały dostępne - kontynuuj produkcję
          proceedWithProduction();
        } else if (data.missing) {
          // Brak materiałów - pokaż modal błędu
          setMissingMaterials(data.missing);
          setMissingMessage(data.error || 'Brak wystarczającej ilości materiałów.');
          setShowMissingModal(true);
          setShowProduceModal(false);
          setOrderToProduce(null);
        } else {
          alert(data.error || 'Błąd sprawdzania dostępności materiałów.');
          setShowProduceModal(false);
          setOrderToProduce(null);
        }
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        setShowProduceModal(false);
        setOrderToProduce(null);
      });
  };

  const proceedWithProduction = () => {
    fetch(`${API_URL}/api/production/produce/${orderToProduce.id}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          fetchOrders();
        } else {
          alert(data.error || 'Błąd podczas produkcji.');
        }
        setShowProduceModal(false);
        setOrderToProduce(null);
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        setShowProduceModal(false);
        setOrderToProduce(null);
      });
  };

  function handleSubmit(e) {
    e.preventDefault();
    let newErrors = [];
    if (!form.component) newErrors.push('Wybierz komponent.');
    if (!form.quantity) newErrors.push('Podaj ilość.');
    setErrors(newErrors);
    if (newErrors.length === 0) {
      setShowConfirmModal(true);
    }
  }

  const handleUndoProduction = () => {
    if (!orderToUndo) return;

    fetch(`${API_URL}/api/production/undo/${orderToUndo.id}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          fetchOrders();
          closeUndoModal();
          setShowUndoSuccess(true);
          setTimeout(() => setShowUndoSuccess(false), 2000);
        } else {
          alert(data.error || 'Błąd podczas cofania produkcji.');
          closeUndoModal();
        }
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        closeUndoModal();
      });
  };

  function handleConfirmSubmit() {
    // Pobierz token z localStorage
    const token = localStorage.getItem('access');

    const headers = {
      'Content-Type': 'application/json',
    };

    // Dodaj token jeśli istnieje
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
        pilne: form.pilne,
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          setShowSuccess(true);
          setForm({ component: '', quantity: '', uwagi: '', pilne: false });
          fetchOrders();
          setTimeout(() => setShowSuccess(false), 1200);
        } else {
          setErrors([data.error || 'Błąd podczas dodawania zlecenia.']);
        }
        setShowConfirmModal(false);
      })
      .catch(() => {
        setErrors(['Błąd połączenia z serwerem.']);
        setShowConfirmModal(false);
      });
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
    fetch(`${API_URL}/api/product-to-production/${orderToDelete.id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderToDelete.id));
        closeDeleteModal();
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 1000);
      } else {
        alert('Błąd podczas usuwania zlecenia.');
      }
    });
  }

  const openCommentModal = (order) => {
    setEditingOrder(order);
    setTempComment(order.komentarz || '');
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setEditingOrder(null);
    setTempComment('');
  };

  const saveComment = () => {
    if (!editingOrder) return;
    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/product-to-production/${editingOrder.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ komentarz: tempComment }),
    }).then((res) => {
      if (res.ok) {
        // Zaktualizuj lokalny stan
        setOrders((prev) =>
          prev.map((o) => (o.id === editingOrder.id ? { ...o, komentarz: tempComment } : o))
        );
        closeCommentModal();
      }
    });
  };

  const clearComment = () => {
    setTempComment('');
  };

  function handleOrderMissing(missingList) {
    const token = localStorage.getItem('access');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Zleć produkcję dla każdego brakującego materiału
    Promise.all(
      missingList.map((item) =>
        fetch(`${API_URL}/api/product-to-production/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            component: item.material_id || item.id,
            quantity: item.missing_qty,
            uwagi: 'Automatyczne zlecenie braków',
            pilne: true,
          }),
        })
      )
    ).finally(() => {
      setShowMissingModal(false);
      setMissingMaterials([]);
      fetchOrders();
      setShowConfirmModal(false); // zawsze odśwież listę zleceń
    });
  }

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
        {/* LEWA STRONA - NOWY FORMULARZ */}
        <section className="xl:col-span-2 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Zleć produkcję komponentu (Ignacy)
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
                Wybierz komponent
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500 mb-2"
                  placeholder="Wpisz nazwę lub SKU komponentu..."
                  value={
                    form.component
                      ? components.find((c) => String(c.id) === String(form.component))
                          ?.full_name || componentSearch
                      : componentSearch
                  }
                  onChange={(e) => {
                    setComponentSearch(e.target.value);
                    setForm((prev) => ({ ...prev, component: '' }));
                  }}
                  onFocus={() => setComponentInputFocused(true)}
                  onBlur={() => setTimeout(() => setComponentInputFocused(false), 150)}
                  autoComplete="off"
                />
                {componentInputFocused && !form.component && (
                  <ul
                    className="absolute z-20 bg-white border shadow-lg max-h-60 overflow-y-auto"
                    style={{
                      minWidth: '420px', // szersza lista
                      borderRadius: '1.5rem', // bardziej okrągła ramka
                      right: 'unset', // przesunięcie w prawo względem inputa
                      left: '60',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                      padding: '6px 0',
                      marginTop: '4px',
                    }}
                  >
                    {components
                      .filter((c) => c.r === 'Towar')
                      .filter(
                        (c) =>
                          c.full_name.toLowerCase().includes(componentSearch.toLowerCase()) ||
                          c.catalog_index.toLowerCase().includes(componentSearch.toLowerCase())
                      )

                      .map((c) => (
                        <li
                          key={c.id}
                          className="px-4 py-2 cursor-pointer hover:bg-ocean-100 text-black transition rounded-xl"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, component: c.id }));
                            setComponentSearch(c.full_name);
                            setComponentInputFocused(false);
                          }}
                        >
                          <span className="font-semibold text-ocean-700">{c.catalog_index}</span>
                          <span className="mx-2 text-gray-400">–</span>
                          <span>{c.full_name}</span>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="pilne"
                id="pilne"
                checked={form.pilne}
                onChange={handleChange}
                className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="pilne" className="text-sm font-medium text-red-700 select-none">
                PILNE
              </label>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Zatwierdź zlecenie
              </button>
            </div>
          </form>
        </section>
        {/* PRAWA STRONA - LISTA ZLECEŃ */}
        <section className="xl:col-span-8 bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Lista zleceń produkcji komponentów
          </h2>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Nr
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Data zlecenia
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    SKU
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Komponent
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Ilość
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    PILNE
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Uwagi
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Koment.
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Status
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={
                      'hover:bg-gray-50 transition-colors cursor-pointer' +
                      (order.pilne ? ' bg-red-100' : '')
                    }
                    onClick={(e) => {
                      // Nie nawiguj jeśli kliknięto przycisk lub div z komentarzem
                      if (
                        e.target.closest('button') ||
                        e.target.closest('input') ||
                        e.target.closest('.comment-edit')
                      )
                        return;
                      navigate(`/order/${order.id}`);
                    }}
                    title="Kliknij, aby zobaczyć szczegóły zamówienia"
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      {new Date(order.created_at).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                      <div className="w-20 truncate" title={order.component_catalog_index}>
                        {order.component_catalog_index}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                      <div className="w-32 truncate" title={order.component_full_name}>
                        {order.component_full_name}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                      {order.quantity}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                      {order.pilne ? (
                        <span title="Pilne">
                          <svg
                            className="w-5 h-5 text-red-600 inline"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6l4 2"
                            />
                          </svg>
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                    <td
                      className="px-2 py-2 whitespace-nowrap text-xs text-gray-500"
                      title={order.uwagi || ''}
                    >
                      {order.uwagi && order.uwagi.length > 10
                        ? order.uwagi.slice(0, 10) + '...'
                        : order.uwagi || ''}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                      <div
                        className="comment-edit cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommentModal(order);
                        }}
                        title={
                          order.komentarz ? order.komentarz : 'Brak komentarza - kliknij aby dodać'
                        }
                      >
                        <div
                          className="w-16
                         truncate"
                        >
                          {order.komentarz ? (
                            order.komentarz
                          ) : (
                            <span className="text-gray-400 italic">Brak</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                      {order.is_produced ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold flex items-center justify-center gap-1">
                          {/* Kciuk w górę (Twój SVG) */}
                          <svg
                            fill="#16a34a"
                            viewBox="0 0 32 32"
                            width="20"
                            height="20"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="#16a34a"
                          >
                            <rect x="2" y="16" width="5" height="14"></rect>
                            <path d="M23,30H9V15.1973l3.0422-4.5635.8453-5.9165A2.0094,2.0094,0,0,1,14.8672,3H15a3.0033,3.0033,0,0,1,3,3v6h8a4.0045,4.0045,0,0,1,4,4v7A7.0078,7.0078,0,0,1,23,30Z"></path>
                          </svg>
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold flex items-center justify-center gap-1">
                          {/* Zegarek */}
                          <svg
                            className="w-5 h-5 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6l4 2"
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex justify-center gap-2">
                        {order.is_produced ? (
                          <button
                            type="button"
                            onClick={() => openUndoModal(order)}
                            className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded"
                            title="Cofnij produkcję"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openProduceModal(order)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
                            title="Zatwierdź produkcję"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                          title="Usuń zlecenie"
                        >
                          <svg
                            className="w-3 h-3"
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
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Dodano zlecenie!
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Zlecenie usunięte!
          </div>
        </div>
      )}
      <MissingErrorModal
        show={showMissingModal}
        message={missingMessage}
        missing={missingMaterials}
        onClose={() => setShowMissingModal(false)}
        // onOrderMissing={handleOrderMissing}
      />
      {/* Modal do potwierdzenia dodania nowego zlecenia */}
      <ConfirmProductionModal
        order={{
          id: null,
          component_catalog_index:
            components.find((c) => c.id == form.component)?.catalog_index || '',
          component_full_name: components.find((c) => c.id == form.component)?.full_name || '',
          quantity: form.quantity,
        }}
        show={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* Modal do potwierdzenia produkcji istniejącego zlecenia */}
      <ConfirmProductionModal
        order={orderToProduce}
        show={showProduceModal}
        onCancel={() => setShowProduceModal(false)}
        onConfirm={handleProduceOrder}
      />

      {/* Modal do potwierdzenia cofnięcia produkcji */}
      {showUndoModal && orderToUndo && (
        <UndoModal
          order={orderToUndo}
          onConfirm={handleUndoProduction}
          onCancel={closeUndoModal}
          show={showUndoModal}
        />
      )}

      {/* Modal sukcesu cofnięcia */}
      <UndoSuccessModal show={showUndoSuccess} />
      {/* Modal edycji komentarza */}
      {showCommentModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edytuj komentarz - Zlecenie #{editingOrder.id}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Komentarz:</label>
              <textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                maxLength={255}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Wpisz komentarz..."
              />
              <div className="text-xs text-gray-500 mt-1">{tempComment.length}/255 znaków</div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={clearComment}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Wyczyść
              </button>
              <button
                onClick={closeCommentModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zamknij
              </button>
              <button
                onClick={saveComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
