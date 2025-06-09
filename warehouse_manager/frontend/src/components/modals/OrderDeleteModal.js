import React from "react";

export default function OrderDeleteModal({ order, onDelete, onCancel }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full text-center">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Potwierdź usunięcie</h2>
        <p className="mb-4 text-gray-600">Czy na pewno chcesz usunąć to zamówienie?</p>
        <div className="mb-4 text-gray-700 font-semibold space-y-2">
          <p>ID: {order.id}</p>
          <p>SKU: {order.component_catalog_index}</p>
          <p>Nazwa: {order.component_full_name}</p>
          <p>Ilość: {order.quantity}</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            Usuń
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-bold"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}