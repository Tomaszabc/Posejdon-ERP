import React, { useEffect, useState, useRef } from 'react';
import OrdersToProduceSection from './OrdersToProduceSection';
import ProducedOrdersSection from './ProducedOrdersSection';
import UndoModal from '../../components/modals/UndoModal';
import SuccessModal from './SuccessModal';
import ConfirmProductionModal from './ConfirmProductionModal';
import UndoSuccessModal from '../../components/modals/UndoSuccessModal';
import ErrorModal from '../../components/modals/MissingErrorModal'; // dostosuj ścieżkę
import { API_URL, WS_URL } from '../../config';

export default function Production() {
  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [orderToUndo, setOrderToUndo] = useState(null);
  const [showUndoSuccess, setShowUndoSuccess] = useState(false);
  const ORDERS_LIMIT = 100;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sku: '',
    quantity: '',
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const ws = useRef(null);
  const [components, setComponents] = useState([]);
  const [ignacyOrders, setIgnacyOrders] = useState([]);

  useEffect(() => {
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'refresh') {
        fetchOrders();
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  // Effect do filtrowania
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

  const producedOrders = filteredOrders.filter((order) => order.is_produced);
  const ordersToProduce = filteredOrders.filter((order) => !order.is_produced);

  // Handlery dla filtrów
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      sku: '',
      quantity: '',
    });
  };

  // Effects
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/components-for-order/`)
      .then((res) => res.json())
      .then((data) => setComponents(data));
  }, []);

  // API calls
  const fetchOrders = () => {
    setLoading(true);
    const token = localStorage.getItem('access'); // pobierz token JWT
    fetch(`${API_URL}/api/product-to-production/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 401) {
          setOrders([]);
          setLoading(false);
          // Możesz dodać info o wylogowaniu lub przekierować na login
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(
            data.filter(
              (order) =>
                order.component_r === 'Produkt' ||
                (order.component_r === 'Towar' &&
                  order.component_catalog_index &&
                  order.component_catalog_index.includes('-24-'))
            )
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  };

  // Production confirmation handlers
  const handleAskConfirmProduce = (order) => {
    setOrderToConfirm(order);
    setShowConfirmModal(true);
  };

  const confirmProduce = () => {
    if (!orderToConfirm) return;

    fetch(`/api/production/produce/${orderToConfirm.id}/`, { method: 'POST' })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setErrorModal({
            show: true,
            message: data.error || 'Błąd produkcji',
            missing: (data.missing || []).map((m) => ({
              ...m,
              missing_parts_ordered: orderToConfirm?.missing_parts_send_to_production,
              missing_parts_ordered_at: orderToConfirm?.missing_parts_ordered_at,
            })),
            orderId: orderToConfirm?.id,
            missingPartsAlreadyOrdered: orderToConfirm?.missing_parts_send_to_production,
          });
          return;
        }
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
        fetchOrders();
      })
      .catch((error) => {
        setErrorModal({ show: true, message: error.message });
      })
      .finally(() => {
        setShowConfirmModal(false);
        setOrderToConfirm(null);
      });
  };

  const cancelConfirmProduce = () => {
    setShowConfirmModal(false);
    setOrderToConfirm(null);
  };

  // Undo production handlers
  const handleUndoProduce = (order) => {
    setOrderToUndo(order);
    setShowUndoModal(true);
  };

  const confirmUndoProduce = () => {
    if (!orderToUndo) return;

    fetch(`${API_URL}/api/production/undo/${orderToUndo.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd podczas cofania produkcji');
        return res.json();
      })
      .then(() => {
        setShowUndoModal(false);
        setOrderToUndo(null);
        setShowUndoSuccess(true);
        setTimeout(() => setShowUndoSuccess(false), 1000);
        fetchOrders();
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const cancelUndoProduce = () => {
    setShowUndoModal(false);
    setOrderToUndo(null);
  };

  const orderMissingComponents = async (missingList) => {
    const token = localStorage.getItem('access');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let updatedMissing = [...errorModal.missing];

    for (const item of missingList) {
      const comp = components.find((c) => c.catalog_index === item.sku);
      if (!comp) continue;

      // Zawsze twórz nowe zamówienie
      await fetch(`${API_URL}/api/product-to-production/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          component: comp.id,
          quantity: item.missing_qty,
          uwagi: `Automatyczne zlecenie na braki do produkcji`,
          pilne: false,
        }),
      });

      updatedMissing = updatedMissing.map((m) =>
        m.sku === item.sku ? { ...m, missing_parts_ordered: true } : m
      );
    }

    setErrorModal((prev) => ({
      ...prev,
      missing: updatedMissing,
    }));

    if (errorModal.orderId) {
      await fetch(`${API_URL}/api/mark-missing-parts-ordered/${errorModal.orderId}/`, {
        method: 'POST',
        headers,
      });
    }

    fetchOrders();
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/order-list-for-modules-production-previewing-components-production/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
.then((data) => {
  console.log('Dane z endpointu Ignacego:', data);
  setIgnacyOrders(data); // <-- Usuń .filter((order) => order.id === 479)
})
      .catch((err) => {
        setIgnacyOrders([]);
      });
  }, []);

  console.log('Aktualny stan ignacyOrders:', ignacyOrders);

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <OrdersToProduceSection
          orders={orders}
          loading={loading}
          onProduce={handleAskConfirmProduce}
        />
        <ProducedOrdersSection
          producedOrders={producedOrders}
          onUndo={handleUndoProduce}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleClearFilters={handleClearFilters}
          ORDERS_LIMIT={ORDERS_LIMIT}
        />
        

<section className="xl:col-span-8 bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">
    Lista zleceń produkcji komponentów (podgląd Ignacego)
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
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {ignacyOrders.map((order) => (
          <tr
            key={order.id}
            className={
              'hover:bg-gray-50 transition-colors cursor-pointer' +
              (order.pilne ? ' bg-red-100' : '')
            }
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
                title={
                  order.komentarz ? order.komentarz : 'Brak komentarza'
                }
              >
                <div className="w-16 truncate">
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
                  {/* Kciuk w górę */}
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
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
      </div>

      <ConfirmProductionModal
        order={orderToConfirm}
        show={showConfirmModal}
        onCancel={cancelConfirmProduce}
        onConfirm={confirmProduce}
      />
      <UndoModal
        order={orderToUndo}
        show={showUndoModal}
        onCancel={cancelUndoProduce}
        onConfirm={confirmUndoProduce}
      />
      <SuccessModal show={showSuccess} />
      <UndoSuccessModal show={showUndoSuccess} />
      <ErrorModal
        show={errorModal.show}
        message={errorModal.message}
        missing={errorModal.missing}
        onClose={() => setErrorModal({ show: false, message: '', missing: [] })}
        onOrderMissing={orderMissingComponents}
        missingPartsAlreadyOrdered={errorModal.missingPartsAlreadyOrdered}
      />
    </div>
  );
}
