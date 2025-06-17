import React from 'react';

export default function ProductsAndGoodsHeader({
  filteredComponents,
  selectedComponents,
  onImportCSV,
  onExportCSV,
  onShowDeleteConfirm,
  onShowAddModal,
  showMobileMenu,
  setShowMobileMenu,
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold text-ocean-900 mb-2">🧱 Surowce produkcyjne</h1>
          <p className="text-gray-600">Materiały magazynowe (typ R = "Materiał")</p>
        </div>
        {/* Przykładowo akcje desktop */}
        <div className="hidden sm:flex gap-3 flex-wrap">
          {/* Przycisk importu CSV */}
          <button onClick={onImportCSV} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg">
            Importuj CSV
          </button>
          {/* Przycisk eksportu CSV */}
          <button onClick={onExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            Eksportuj CSV
          </button>
          {selectedComponents.size > 0 && (
            <button onClick={onShowDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
              Usuń zaznaczone ({selectedComponents.size})
            </button>
          )}
          <button onClick={onShowAddModal} className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg">
            Dodaj materiał
          </button>
        </div>
        {/* Mobile Menu Button */}
        <div className="flex sm:hidden w-full">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-3 rounded-lg"
          >
            Menu akcji
          </button>
        </div>
      </div>
      {filteredComponents.length > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Liczba materiałów:</strong> {filteredComponents.length} 
            {selectedComponents.size > 0 && (
              <span className="ml-4">
                <strong>Zaznaczone:</strong> {selectedComponents.size} pozycji
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}