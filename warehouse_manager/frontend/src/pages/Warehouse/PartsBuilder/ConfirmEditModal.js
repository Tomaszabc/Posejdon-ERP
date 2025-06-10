import React from "react";

export default function ConfirmEditModal({ open, materialName, quantity, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
        <h2 className="text-lg font-bold mb-2">Potwierdź edycję</h2>
        <p className="mb-4">
          Czy na pewno chcesz <b>zmienić ilość</b> materiału: <b>{materialName}</b> na <b>{quantity}</b>?
        </p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onCancel}>Anuluj</button>
          <button className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700" onClick={onConfirm}>Potwierdź</button>
        </div>
      </div>
    </div>
  );
}