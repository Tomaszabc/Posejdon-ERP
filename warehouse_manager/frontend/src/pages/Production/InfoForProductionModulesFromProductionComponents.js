import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

export default function InfoForProductionModulesFromProductionComponents() {
  const [ignacyOrders, setIgnacyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    fetch(`${API_URL}/api/order-list-for-modules-production-previewing-components-production/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Dane z endpointu Ignacego:', data);
        setIgnacyOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setIgnacyOrders([]);
        setLoading(false);
      });
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Lista zleconych do produkcji komponentów (do Ignacego):
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Nr
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Status
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Ilość
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Komponent
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                SKU
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Koment.
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                PILNE
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ignacyOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className={
                  'hover:bg-gray-50 transition-colors cursor-pointer' +
                  (order.pilne ? ' bg-red-100' : '')
                }
                title="Kliknij, aby zobaczyć szczegóły zamówienia"
              >
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                  {order.is_produced ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold flex items-center justify-center gap-1">
                      <svg
                        fill="#16a34a"
                        viewBox="0 0 32 32"
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#16a34a"
                      >
                        <rect x="2" y="16" width="5" height="14"></rect>
                        <path d="M23,30H9V15.1973l3.0422-4.5635.8453-5.9165A2.0094,2.0094,0,0,1,14.8672,3H15a3.0033,3.0033,0,0,1,3,3v6h8a4.0045,4.0045,0,0,1,4,4v7A7.0078,7.0078,0,0,1,23,30Z"></path>
                      </svg>
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold flex items-center justify-center gap-1">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6l4 2"
                        />
                      </svg>
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {order.quantity}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  <div className="w-42 truncate" title={order.component_full_name}>
                    {order.component_full_name}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  <div className="w-20 truncate" title={order.component_catalog_index}>
                    {order.component_catalog_index}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                  <div
                    className="comment-edit cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                    title={order.komentarz ? order.komentarz : 'Brak komentarza'}
                  >
                    <div className="w-32 truncate">
                      {order.komentarz ? (
                        order.komentarz
                      ) : (
                        <span className="text-gray-400 italic">Brak</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                  {order.pilne ? (
                    <span title="Pilne">
                      <svg
                        className="w-5 h-5 text-red-600 inline"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6l4 2"
                        />
                      </svg>
                    </span>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
