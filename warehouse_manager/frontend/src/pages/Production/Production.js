import React, { useEffect, useState } from "react";
import OrdersToProduceSection from "./OrdersToProduceSection";
import ProducedOrdersSection from "./ProducedOrdersSection";
import UndoModal from "./UndoModal";
import SuccessModal from "./SuccessModal";

export default function Production() {
  const [orders, setOrders] = useState([]);
  const [producedOrders, setProducedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [orderToUndo, setOrderToUndo] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
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
  }

  const handleProduce = (orderId) => {
    fetch("http://localhost:8000/api/production/produce/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id: orderId })
    })
      .then(res => res.json())
      .then(() => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
        fetchOrders();
      });
  };

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
        <OrdersToProduceSection
          orders={orders}
          loading={loading}
          onProduce={handleProduce}
        />
        <ProducedOrdersSection
          producedOrders={producedOrders}
          onUndo={handleUndoProduce}
        />
      </div>
      <UndoModal
        order={orderToUndo}
        onCancel={cancelUndoProduce}
        onConfirm={confirmUndoProduce}
        show={showUndoModal}
      />
      <SuccessModal show={showSuccess} />
    </div>
  );
}