import React, { useEffect, useState } from "react";

export default function Production() {
  const [orders, setOrders] = useState([]);
  const [producedOrders, setProducedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleUndoProduce = (orderId) => {
  fetch("http://localhost:8000/api/production/undo/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ order_id: orderId })
  })
    .then(res => res.json())
    .then(() => {
      fetchOrders();
    });
};

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
    setLoading(true);
    fetch("http://localhost:8000/api/production/orders/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setProducedOrders(data.produced_orders || []);
        setLoading(false);
      });
  }

  const handleProduce = (orderId) => {
    fetch("http://localhost:8000/api/production/produce/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id: orderId })
    })
      .then(res => res.json())
      .then(() => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
        fetchOrders();
      });
  };

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEWA STRONA - ZAMÓWIENIA DO PRODUKCJI */}
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
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Średnica</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Kształt</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Rozmiar</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Kolor</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ilość</th>
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
                      <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => handleProduce(order.id)}
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

       {/* PRAWA STRONA - WYPRODUKOWANE */}
{producedOrders.length > 0 && (
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
                {order.produced_at
                  ? new Date(order.produced_at).toLocaleDateString('pl-PL', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: '2-digit'
                    }) + ' ' + new Date(order.produced_at).toLocaleTimeString('pl-PL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  : ""}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-center">
                <button
                  type="button"
                  onClick={() => handleUndoProduce(order.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors shadow-sm"
                  title="Cofnij produkcję"
                >
                  {/* Ikona odświeżenia/cofnięcia */}
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
)}
      </div>

      {/* MODAL POTWIERDZENIA PRODUKCJI */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Zatwierdzono produkcję!
          </div>
        </div>
      )}
    </div>
  );
}