import React from "react";

export default function ConfirmProductionModal({ order, show, onCancel, onConfirm }) {
  if (!show || !order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Potwierdzenie produkcji
        </h3>
        <p className="text-gray-600 mb-4">
          Czy na pewno chcesz zatwierdzić produkcję tego zamówienia?
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Nr:</span> {order.id}</div>
            <div><span className="font-medium">SKU:</span> {order.component_catalog_index}</div>
            <div><span className="font-medium">Produkt:</span> {order.component_full_name}</div>
            <div><span className="font-medium">Ilość:</span> {order.quantity}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Zatwierdź produkcję
          </button>
        </div>
      </div>
    </div>
  );
}