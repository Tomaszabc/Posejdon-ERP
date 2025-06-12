// filepath: c:\Users\Posejdon\Desktop\Cyfryzacja\Warehouse_manager\Warehouse_Management\warehouse_manager\frontend\src\pages\Production\ProducedOrdersSection.js
import React from 'react';
import { formatDateTime } from './utils';

export default function ProducedOrdersSection({
  producedOrders,
  onUndo,
  showFilters,
  setShowFilters,
  filters,
  handleFilterChange,
  handleClearFilters,
  ORDERS_LIMIT,
}) {
  return (
    <section className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-100">
      {/* Header z tytułem i przyciskami filtrów */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Wyprodukowane produkty
          {!filters.startDate && !filters.endDate && !filters.sku && !filters.quantity && (
            <span className="ml-1 relative group">
              <span className="inline-block align-middle cursor-pointer group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline w-7 h-7 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" fill="white" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {ORDERS_LIMIT} najnowszych
                </span>
              </span>
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            🔍 {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            🗑️ Wyczyść filtry
          </button>
        </div>
      </div>

      {/* Panel filtrów */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl mb-6 overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Od daty</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Do daty</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={filters.sku}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                  placeholder="Wpisz SKU"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ilość</label>
                <input
                  type="number"
                  name="quantity"
                  value={filters.quantity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                  placeholder="Dowolna"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela z zamówieniami */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Nr
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                SKU
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produkt
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Ilość
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Data prod.
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Cofnij
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {producedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  {order.component_catalog_index}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  {order.component_full_name}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {order.quantity}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  {formatDateTime(order.produced_at)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => onUndo(order)}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors shadow-sm"
                    title="Cofnij produkcję"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
