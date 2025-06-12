import React from 'react';

export default function ErrorModal({ show, message, missing = [], onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-red-700">Błąd produkcji</h2>
        <div className="mb-4 whitespace-pre-line text-gray-800">{message}</div>
        {missing.length > 0 && (
          <ul className="mb-4 list-disc ml-6 text-gray-700 text-sm">
            {missing.map((item, idx) => (
              <li key={idx}>
                <b>{item.name}</b> (SKU: {item.sku})<br />
                Potrzeba:{' '}
                <b>
                  {item.needed} {item.unit}
                </b>
                , dostępne:{' '}
                <b>
                  {item.available} {item.unit}
                </b>
                , brakuje:{' '}
                <b>
                  {item.missing_qty} {item.unit}
                </b>
              </li>
            ))}
          </ul>
        )}
        <button
          className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
