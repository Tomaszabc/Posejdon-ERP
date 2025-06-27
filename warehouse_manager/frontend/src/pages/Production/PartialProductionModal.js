import React, { useState } from 'react';

export default function PartialProductionModal({ order, show, onCancel, onConfirm }) {
  const [partialQuantity, setPartialQuantity] = useState('');

  if (!show || !order) return null;

  const remainingQty = order.quantity - (order.produced_quantity || 0);

  const handleConfirm = () => {
    const qty = parseInt(partialQuantity);
    if (qty > 0 && qty <= remainingQty) {
      onConfirm(qty);
      setPartialQuantity('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Częściowa produkcja - #{order.id}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{order.component_full_name}</strong>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Zamówiono: <span className="font-semibold">{order.quantity}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Wyprodukowano: <span className="font-semibold">{order.produced_quantity || 0}</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Pozostało: <span className="font-semibold text-orange-600">{remainingQty}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ile chcesz wyprodukować?
          </label>
          <input
            type="number"
            min="1"
            max={remainingQty}
            value={partialQuantity}
            onChange={(e) => setPartialQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
            placeholder={`Max: ${remainingQty}`}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleConfirm}
            disabled={!partialQuantity || parseInt(partialQuantity) <= 0 || parseInt(partialQuantity) > remainingQty}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            Zatwierdź produkcję
          </button>
        </div>
      </div>
    </div>
  );
}