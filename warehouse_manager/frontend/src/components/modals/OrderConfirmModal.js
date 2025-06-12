import React from 'react';

export default function OrderConfirmModal({ order, onConfirm, onCancel, components }) {
  const selectedComponent = components?.find((c) => c.id === parseInt(order.component));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Potwierdź zamówienie</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              Czy chcesz zatwierdzić zamówienie o parametrach:
            </p>
            <div className="text-left space-y-2 text-sm">
              <p>
                <span className="font-semibold">SKU:</span> {selectedComponent?.catalog_index}
              </p>
              <p>
                <span className="font-semibold">Nazwa produktu:</span>{' '}
                {selectedComponent?.full_name}
              </p>
              <p>
                <span className="font-semibold">Ilość:</span> {order.quantity}
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-base font-medium rounded-md shadow-sm transition-colors"
            >
              Zatwierdź
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
