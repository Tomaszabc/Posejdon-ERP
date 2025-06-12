import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderList({ orders, openDeleteModal }) {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Nr
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Data zamów.
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              SKU
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nazwa produktu
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Ilość
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Status
            </th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Usuń
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
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
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {order.quantity}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                <span
                  className={
                    order.is_produced
                      ? 'bg-green-100 text-green-800 px-2 py-1 rounded font-semibold'
                      : 'bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold'
                  }
                >
                  {order.is_produced ? 'Wyprodukowano' : 'Do produkcji'}
                </span>
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
