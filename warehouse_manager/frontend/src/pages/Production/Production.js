import React, { useEffect, useState, useRef } from 'react';
import OrdersToProduceSection from './OrdersToProduceSection';
import ProducedOrdersSection from './ProducedOrdersSection';
import InfoForProductionModulesFromProductionComponents from './InfoForProductionModulesFromProductionComponents';
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
        fetchIgnacyOrders();
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  // Dodaj funkcję fetchIgnacyOrders:
  const fetchIgnacyOrders = () => {
    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/order-list-for-modules-production-previewing-components-production/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setIgnacyOrders(data))
      .catch(() => setIgnacyOrders([]));
  };

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
    fetchIgnacyOrders();
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

    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/production/produce/${orderToConfirm.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        'X-Requested-With': 'XMLHttpRequest',
      },
      // credentials: 'include', // jeśli używasz cookies/sesji
    })
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
    fetchIgnacyOrders();
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

        {/* Nowy komponent z tabelą */}
        <div className="mt-8">
          <InfoForProductionModulesFromProductionComponents ignacyOrders={ignacyOrders} />
        </div>
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
      </div>
      {/* Modalne okna */}
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
