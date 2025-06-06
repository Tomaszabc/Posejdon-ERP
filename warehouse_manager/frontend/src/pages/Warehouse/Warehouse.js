import React, { useEffect, useState } from "react";

export default function Warehouse() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/components/")
      .then(res => res.json())
      .then(data => {
        setComponents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Błąd pobierania danych:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          <span className="ml-3 text-gray-600">Ładowanie magazynu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ocean-900 mb-2">📦 Magazyn – Komponenty</h1>
        <p className="text-gray-600">Pełny widok wszystkich komponentów magazynowych</p>
        {components.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Liczba pozycji:</strong> {components.length} | 
              <strong> Stan wartości:</strong> {components.reduce((sum, comp) => sum + parseFloat(comp.purchase_price_net || 0) * parseFloat(comp.stock || 0), 0).toFixed(2)} zł
            </p>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">R</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px]">Nazwa cała</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Stan</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Ilość dostępna</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">j.m.</th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">Cena zakupu netto</th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">Cena sprzedaży netto</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Kod kreskowy</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Indeks katalogowy</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Zarezerwowano</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nazwa krótka</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nazwa oryg.</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Dostawcy dostarczą</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Odbiorcy odbiorą</th>
                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">C. zakupu netto wal.</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Vat sprz.</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Marża [%]</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">F</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Producent</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nr artykułu</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">S</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Zał.</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Wyróżnik</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">A</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Indeks producenta</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Kod CN</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">Kraj pochodzenia</th>
                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider">JPK Klasyfikacja</th>
                <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">Narzut [%]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {components.length === 0 ? (
                <tr>
                  <td colSpan={29} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-lg font-medium text-gray-400">Brak komponentów w magazynie</p>
                      <p className="text-sm text-gray-400">Dodaj pierwszy komponent, aby rozpocząć</p>
                    </div>
                  </td>
                </tr>
              ) : (
                components.map((comp, index) => (
                  <tr key={comp.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comp.r === 'Towar' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {comp.r || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-gray-900">{comp.full_name}</div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(comp.stock) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {comp.stock}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.available_quantity}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700 font-medium">{comp.unit}</td>
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
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.suppliers_will_deliver}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.recipients_will_receive}</td>
                    <td className="px-3 py-4 text-right text-sm text-gray-700">
                      {parseFloat(comp.purchase_price_net_currency).toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.vat_sale}%</td>
                    <td className="px-3 py-4 text-center text-sm font-medium text-blue-600">{comp.margin_percent}%</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.f || <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.producer || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.article_number || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.s || <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.attachment || <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      {comp.marker || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.a || <span className="text-gray-400">—</span>}</td>
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
                    <td className="px-3 py-4 text-center text-sm text-gray-700">{comp.markup_percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      {components.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Wyświetlono {components.length} pozycji magazynowych • Przewiń w prawo, aby zobaczyć wszystkie kolumny
        </div>
      )}
    </div>
  );
}