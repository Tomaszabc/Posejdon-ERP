import React, { useEffect, useState } from "react";
import OrdersToProduceSection from "./OrdersToProduceSection";
import ProducedOrdersSection from "./ProducedOrdersSection";
import UndoModal from "./UndoModal";
import SuccessModal from "./SuccessModal";
import ConfirmProductionModal from "./ConfirmProductionModal";

export default function Production() {
  // States
  const [orders, setOrders] = useState([]);
  const [producedOrders, setProducedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [orderToUndo, setOrderToUndo] = useState(null);

  // Effects
  useEffect(() => {
    fetchOrders();
  }, []);

  // API calls
  const fetchOrders = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/production/orders/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setProducedOrders(data.produced_orders || []);
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
    
    fetch("http://localhost:8000/api/production/produce/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id: orderToConfirm.id })
    })
      .then(res => res.json())
      .then(() => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
        setShowConfirmModal(false);
        setOrderToConfirm(null);
        fetchOrders();
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
    
    fetch("http://localhost:8000/api/production/undo/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id: orderToUndo.id })
    })
      .then(res => res.json())
      .then(() => {
        setShowUndoModal(false);
        setOrderToUndo(null);
        fetchOrders();
      });
  };

  const cancelUndoProduce = () => {
    setShowUndoModal(false);
    setOrderToUndo(null);
  };

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Main sections */}
        <OrdersToProduceSection
          orders={orders}
          loading={loading}
          onProduce={handleAskConfirmProduce}
        />
        <ProducedOrdersSection
          producedOrders={producedOrders}
          onUndo={handleUndoProduce}
        />
      </div>

      {/* Modals */}
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
    </div>
  );
}