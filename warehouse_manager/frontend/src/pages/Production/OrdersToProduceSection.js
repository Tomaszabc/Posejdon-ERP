import React from "react";
import { formatDateTime } from "./utils";

export default function OrdersToProduceSection({ orders, loading, onProduce }) {
  return (
    <section className="bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Zamówienia do produkcji</h1>
      {loading ? (
        <div>Ładowanie...</div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Nr</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Śr.</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Kszt.</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Rozm.</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Kolor</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ilość</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Data zam.</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Akcje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{order.id}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{order.diameter}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{order.shape}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.size}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.color}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.quantity_to_assemble}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => onProduce(order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Zatwierdź
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Brak zamówień do produkcji.</p>
      )}
    </section>
  );
}