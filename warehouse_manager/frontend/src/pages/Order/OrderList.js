import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderList({ orders, openDeleteModal, openUwagiModal }) {
  const navigate = useNavigate();

  const onlyProducts = orders.filter((order) => order.component_r === 'Produkt');

  // Sortuj zamówienia - najnowsze na górze (malejąco po ID)
  const sortedOrders = [...onlyProducts].sort((a, b) => b.id - a.id);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Nr
            </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Utworzył</th>

            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Data zamów.
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              SKU
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nazwa produktu
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Uwagi
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Ilość
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14">
              Status
            </th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Usuń
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOrders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={(e) => {
                if (e.target.closest('button')) return;
                navigate(`/order/${order.id}`);
              }}
              title="Kliknij, aby zobaczyć szczegóły zamówienia"
            >
              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                {order.id}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
              {order.created_by_username || <span className="text-gray-400 italic">Brak</span>}
            </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {new Date(order.created_at).toLocaleDateString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                {new Date(order.created_at).toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {order.component_catalog_index}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {order.component_full_name}
              </td>
              <td
                className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 cursor-pointer hover:bg-gray-100 rounded transition"
                title={order.uwagi || ''}
                onClick={(e) => {
                  e.stopPropagation();
                  openUwagiModal && openUwagiModal(order);
                }}
              >
                {order.uwagi && order.uwagi.length > 10
                  ? order.uwagi.slice(0, 10) + '...'
                  : order.uwagi || <span className="text-gray-400 italic">Brak</span>}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {order.quantity}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                {order.is_produced ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold flex items-center justify-center gap-1">
                    {/* Kciuk w górę */}
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
                    {/* Zegar */}
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
              <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                <button
                  type="button"
                  onClick={() => openDeleteModal(order)}
                  className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                  title="Usuń zamówienie"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
