import React, { useEffect, useState, useRef  } from "react";
import OrdersToProduceSection from "./OrdersToProduceSection";
import ProducedOrdersSection from "./ProducedOrdersSection";
import UndoModal from "./UndoModal";
import SuccessModal from "./SuccessModal";
import ConfirmProductionModal from "./ConfirmProductionModal";
import UndoSuccessModal from "./UndoSuccessModal";
import ErrorModal from "../../components/modals/MissingErrorModal"; // dostosuj ścieżkę


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
    startDate: "",
    endDate: "",
    sku: "",
    quantity: ""
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket("ws://localhost:8000/ws/warehouse/");
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === "refresh") {
        fetchOrders();
      }
    };
    return () => ws.current && ws.current.close();
  }, []);
  
  // Effect do filtrowania
  const filteredOrders = orders
    .filter(order => {
      if (filters.startDate && new Date(order.created_at) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(order.created_at) > new Date(filters.endDate)) return false;
      if (filters.quantity && !String(order.quantity).startsWith(String(filters.quantity))) return false;
      if (filters.sku && !order.component_catalog_index?.toLowerCase().includes(filters.sku.toLowerCase())) return false;
      return true;
    })
    .slice(0, ORDERS_LIMIT);

  const producedOrders = filteredOrders.filter(order => order.is_produced);
  const ordersToProduce = filteredOrders.filter(order => !order.is_produced);

  // Handlery dla filtrów
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      sku: "",
      quantity: ""
    });
  };

  // Effects
  useEffect(() => {
    fetchOrders();
  }, []);

  // API calls
  const fetchOrders = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/product-to-production/")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
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

  fetch(`/api/production/produce/${orderToConfirm.id}/`, { method: "POST" })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
  if (!ok) {
    setErrorModal({
      show: true,
      message: data.error || "Błąd produkcji",
      missing: data.missing || []
    });
    return;
  }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
      setShowConfirmModal(false);
      setOrderToConfirm(null);
      fetchOrders();
    })
    .catch(error => {
      setErrorModal({ show: true, message: error.message });
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

    fetch(`http://127.0.0.1:8000/api/production/undo/${orderToUndo.id}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Błąd podczas cofania produkcji");
        return res.json();
      })
      .then(() => {
        setShowUndoModal(false);
        setOrderToUndo(null);
        setShowUndoSuccess(true);
        setTimeout(() => setShowUndoSuccess(false), 1000);
        fetchOrders();
      })
      .catch(error => {
        alert(error.message);
      });
  };

  const cancelUndoProduce = () => {
    setShowUndoModal(false);
    setOrderToUndo(null);
  };


  
  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <OrdersToProduceSection
          orders={ordersToProduce}
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
        onClose={() => setErrorModal({ show: false, message: "", missing: [] })}
      />
    </div>
  );
}