import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || '';
  // Funkcja formatowania daty
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Pobierz token z localStorage
        const token = localStorage.getItem('access');

        const headers = {};

        // Dodaj token jeśli istnieje
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Pobierz szczegóły zamówienia
        const orderResponse = await fetch(
          `${API_URL}/api/product-to-production/${orderId}/`,
          
            { headers }
          
        );

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          console.log('Order data:', orderData); // DEBUG - sprawdź co otrzymujesz
          console.log('created_by_username:', orderData.created_by_username); // DEBUG
          setOrder(orderData);

          // Pobierz części produktu
          const partsResponse = await fetch(
            `${API_URL}/api/product-parts/${orderData.component}/`,
            { headers }
          );

          if (partsResponse.ok) {
            const partsData = await partsResponse.json();
            setParts(partsData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center text-red-600">Nie znaleziono zamówienia.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header z przyciskiem powrotu */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Powrót
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Szczegóły zamówienia #{order.id}</h1>
        </div>

        {/* Główne informacje o zamówieniu */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Informacje o zamówieniu</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Produkt:</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {order.component_full_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">SKU:</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono">
                    {order.component_catalog_index}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Pilne:</span>
                  {order.pilne ? (
                    <span className="flex items-center text-red-700 font-semibold gap-1">
                      <svg
                        className="w-5 h-5 text-red-600"
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
                      TAK
                    </span>
                  ) : (
                    <span className="text-gray-500">Nie</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Uwagi:</span>
                  <span className="text-gray-800">
                    {order.uwagi ? order.uwagi : <span className="text-gray-400">Brak</span>}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Komentarz:</span>
                  <span className="text-gray-800">
                    {order.komentarz ? (
                      order.komentarz
                    ) : (
                      <span className="text-gray-400">Brak</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Ilość:</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                    {order.quantity}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Data:</span>
                  <span className="text-gray-700">{formatDateTime(order.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-20">Utworzył:</span>
                  <span className="text-gray-800 font-medium">
                    {order.created_by_username || 'Nieznany użytkownik'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela materiałów */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Materiały i towary ({parts.length})
            </h2>
          </div>

          {parts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nazwa materiału
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ilość potrzebna/Stan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jednostka
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parts.map((part, index) => (
                    <tr key={part.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {part.material_full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                          {part.material_catalog_index}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-semibold text-gray-800">
                          {part.quantity_needed * order.quantity}
                          <span className="text-gray-400">/</span>
                          <span className={part.material_stock < part.quantity_needed * order.quantity ? "text-red-600 font-bold" : "text-green-700"}>
                            {part.material_stock}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {part.material_unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>Brak materiałów przypisanych do tego produktu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
