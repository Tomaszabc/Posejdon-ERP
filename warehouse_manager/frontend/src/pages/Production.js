import React, { useEffect, useState } from "react";

function Production() {
  const [orders, setOrders] = useState([]);
  const [producedOrders, setProducedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pobierz zamówienia do produkcji i wyprodukowane
  useEffect(() => {
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
  }, []);

  // Obsługa zatwierdzania produkcji
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
        // Odśwież dane po zatwierdzeniu
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
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Zamówienia do produkcji</h1>
      {loading ? (
        <div>Ładowanie...</div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-white rounded-xl shadow border text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="px-2 py-2 sm:px-4">Średnica</th>
                <th className="px-2 py-2 sm:px-4">Kształt</th>
                <th className="px-2 py-2 sm:px-4">Rozmiar</th>
                <th className="px-2 py-2 sm:px-4">Kolor</th>
                <th className="px-2 py-2 sm:px-4">Ilość</th>
                <th className="px-2 py-2 sm:px-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr className="border-t" key={order.id}>
                  <td className="px-2 py-2 sm:px-4">{order.diameter}</td>
                  <td className="px-2 py-2 sm:px-4">{order.shape}</td>
                  <td className="px-2 py-2 sm:px-4">{order.size}</td>
                  <td className="px-2 py-2 sm:px-4">{order.color}</td>
                  <td className="px-2 py-2 sm:px-4">{order.quantity_to_assemble}</td>
                  <td className="px-2 py-2 sm:px-4 text-center">
                    <button
                      onClick={() => handleProduce(order.id)}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded font-bold text-xs sm:text-base mt-1 sm:mt-0"
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

      {producedOrders.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-4">Wyprodukowane produkty:</h2>
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full bg-white rounded-xl shadow border text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 sm:px-4">Średnica</th>
                  <th className="px-2 py-2 sm:px-4">Kształt</th>
                  <th className="px-2 py-2 sm:px-4">Rozmiar</th>
                  <th className="px-2 py-2 sm:px-4">Kolor</th>
                  <th className="px-2 py-2 sm:px-4">Ilość</th>
                  <th className="px-2 py-2 sm:px-4">Data produkcji</th>
                </tr>
              </thead>
              <tbody>
                {producedOrders.map(order => (
                  <tr className="border-t" key={order.id}>
                    <td className="px-2 py-2 sm:px-4">{order.diameter}</td>
                    <td className="px-2 py-2 sm:px-4">{order.shape}</td>
                    <td className="px-2 py-2 sm:px-4">{order.size}</td>
                    <td className="px-2 py-2 sm:px-4">{order.color}</td>
                    <td className="px-2 py-2 sm:px-4">{order.quantity_to_assemble}</td>
                    <td className="px-2 py-2 sm:px-4">
                      {order.produced_at
                        ? new Date(order.produced_at).toLocaleString("pl-PL", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Production;