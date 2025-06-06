import React from "react";
import { formatDateTime } from "./utils";

export default function ProducedOrdersSection({ producedOrders, onUndo }) {
  if (!producedOrders.length) return null;
  return (
    <section className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyprodukowane produkty</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Nr</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Śr.</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Kształt</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Rozm.</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Kolor</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Ilość</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Data prod.</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Cofnij</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {producedOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{order.id}</td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{order.diameter}</td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  {order.shape === 'Okrągły' ? 'Okr.' : 'Kw.'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.size}</td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.color}</td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.quantity_to_assemble}</td>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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