import React from 'react';

export default function ProductsAndGoodsTable({
  filteredComponents,
  selectedComponents,
  selectAllComponents,
  toggleComponentSelection,
  openEditModal,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    filteredComponents.length > 0 &&
                    selectedComponents.size === filteredComponents.length
                  }
                  onChange={selectAllComponents}
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                />
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Akcje
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                R
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px]">
                Nazwa cała
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Stan
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Ilość dostępna
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                j.m.
              </th>
              <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                Cena zakupu netto
              </th>
              <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                Cena sprzedaży netto
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Kod kreskowy
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Indeks katalogowy
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Zarezerwowano
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Nazwa krótka
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Nazwa oryg.
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Dostawcy dostarczą
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Odbiorcy odbiorą
              </th>
              <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                C. zakupu netto wal.
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Vat sprz.
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Marża [%]
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                F
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Producent
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Nr artykułu
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                S
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Zał.
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Wyróżnik
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                A
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Indeks producenta
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Kod CN
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Kraj pochodzenia
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                JPK Klasyfikacja
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                Narzut [%]
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredComponents.length === 0 ? (
              <tr>
                <td colSpan={31} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-400">
                      Brak materiałów w magazynie
                    </p>
                    <p className="text-sm text-gray-400">
                      Dodaj pierwszy materiał, aby rozpocząć
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredComponents.map((comp, index) => (
                <tr
                  key={comp.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  } ${selectedComponents.has(comp.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <td className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedComponents.has(comp.id)}
                      onChange={() => toggleComponentSelection(comp.id)}
                      className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                    />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button
                      onClick={() => openEditModal(comp)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                      title="Edytuj materiał"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comp.r === 'Materiał'
                          ? 'bg-orange-100 text-orange-800'
                          : comp.r === 'Towar'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {comp.r || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">{comp.full_name}</div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(comp.stock) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {comp.stock}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.available_quantity}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700 font-medium">
                    {comp.unit}
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                    {parseFloat(comp.purchase_price_net).toFixed(2)} zł
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium text-green-600">
                    {parseFloat(comp.sale_price_net).toFixed(2)} zł
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700 font-mono">
                    {comp.barcode || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.catalog_index || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center">
                    {parseFloat(comp.reserved) > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {comp.reserved}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.short_name || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.original_name || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.suppliers_will_deliver}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.recipients_will_receive}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-gray-700">
                    {parseFloat(comp.purchase_price_net_currency).toFixed(2)}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.vat_sale}%
                  </td>
                  <td className="px-3 py-4 text-center text-sm font-medium text-blue-600">
                    {comp.margin_percent}%
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.f || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.producer || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.article_number || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.s || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.attachment || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.marker || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.a || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.producer_index || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.cn_code || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.country_of_origin || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {comp.jpk_classification || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center text-sm text-gray-700">
                    {comp.markup_percent}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}