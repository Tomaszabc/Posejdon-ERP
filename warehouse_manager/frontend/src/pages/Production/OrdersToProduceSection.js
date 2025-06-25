import React, { useEffect, useState } from 'react';
import { formatDateTime } from './utils';
import { useNavigate } from 'react-router-dom';

export default function OrdersToProduceSection({ orders, loading, onProduce }) {
  const navigate = useNavigate();
  const [missingMap, setMissingMap] = useState({}); // {orderId: true/false}

  useEffect(() => {
    // Sprawdź braki dla każdego zamówienia
    async function checkAll() {
      const map = {};
      for (const order of orders) {
        try {
          const res = await fetch('/api/check-materials-availability/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ component: order.component, quantity: order.quantity }),
          });
          map[order.id] = !res.ok; // true jeśli są braki
        } catch {
          map[order.id] = false;
        }
      }
      setMissingMap(map);
    }
    if (orders.length > 0) checkAll();
  }, [orders]);
  // Sortowanie zamówień po ID malejąco (najnowsze na górze)
  const filteredOrders = orders.filter((order) => !order.is_produced);
  const sortedOrders = [...filteredOrders].sort((a, b) => b.id - a.id);

  return (
    <section className="bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Produkty do produkcji (Zuza):</h1>
      {loading ? (
        <div>Ładowanie...</div>
      ) : sortedOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Nr
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  SKU
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkt
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Ilość
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Data zam.
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  Zatw.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-ocean-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    // Nie nawiguj jeśli kliknięto przycisk
                    if (e.target.closest('button')) return;
                    navigate(`/order/${order.id}`);
                  }}
                  title="Kliknij, aby zobaczyć szczegóły zamówienia"
                >
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 flex items-center gap-1">
                    {order.id}
                    {missingMap[order.id] && (
                      <span title="Brak materiałów">
                        <svg
                          className="w-4 h-4 text-red-600 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                          />
                        </svg>
                      </span>
                    )}
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
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    {formatDateTime(order.created_at)}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProduce(order);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg text-xs transition-colors"
                      title="Zatwierdź produkcję"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
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
