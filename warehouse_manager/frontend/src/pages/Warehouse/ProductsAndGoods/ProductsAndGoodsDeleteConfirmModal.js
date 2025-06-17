import React from 'react';

export default function ProductsAndGoodsDeleteConfirmModal({
  show,
  selectedCount,
  onClose,
  onConfirm,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.083 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Potwierdzenie usunięcia</h3>
              <p className="text-sm text-gray-500 mt-1">
                Czy na pewno chcesz usunąć {selectedCount} zaznaczonych materiałów?
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600">
              Ta operacja jest nieodwracalna. Wszystkie dane o zaznaczonych materiałach zostaną trwale usunięte.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Usuń materiały
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}