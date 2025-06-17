import React from 'react';

export default function ProductsAndGoodsAddModal({
  show,
  newComponent,
  handleInputChange,
  onClose,
  onSubmit,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dodaj nowy materiał</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Podstawowe informacje */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Podstawowe informacje
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select
                name="r"
                value={newComponent.r}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="Materiał">Materiał</option>
                <option value="Towar">Towar</option>
                <option value="Usługa">Usługa</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa pełna *
              </label>
              <input
                type="text"
                name="full_name"
                value={newComponent.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                placeholder="Wprowadź pełną nazwę materiału"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa krótka
              </label>
              <input
                type="text"
                name="short_name"
                value={newComponent.short_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jednostka miary
              </label>
              <input
                type="text"
                name="unit"
                value={newComponent.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stan magazynowy
              </label>
              <input
                type="number"
                step="0.01"
                name="stock"
                value={newComponent.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            {/* Ceny */}
            <div className="col-span-full mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ceny i marże</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cena zakupu netto (zł)
              </label>
              <input
                type="number"
                step="0.01"
                name="purchase_price_net"
                value={newComponent.purchase_price_net}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cena sprzedaży netto (zł)
              </label>
              <input
                type="number"
                step="0.01"
                name="sale_price_net"
                value={newComponent.sale_price_net}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VAT sprzedaży (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="vat_sale"
                value={newComponent.vat_sale}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            {/* Dodatkowe informacje */}
            <div className="col-span-full mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatkowe informacje</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod kreskowy
              </label>
              <input
                type="text"
                name="barcode"
                value={newComponent.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indeks katalogowy
              </label>
              <input
                type="text"
                name="catalog_index"
                value={newComponent.catalog_index}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producent
              </label>
              <input
                type="text"
                name="producer"
                value={newComponent.producer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numer artykułu
              </label>
              <input
                type="text"
                name="article_number"
                value={newComponent.article_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kraj pochodzenia
              </label>
              <input
                type="text"
                name="country_of_origin"
                value={newComponent.country_of_origin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
            >
              Dodaj materiał
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}