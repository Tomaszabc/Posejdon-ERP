import React, { useState, useEffect } from "react";
import OrderDeleteModal from "../components/modals/OrderDeleteModal";

export default function Orders() {
  const diameters = ["100", "125", "150"];
  const shapes = ["Okrągły", "Kwadratowy"];
  const sizes = ["M", "S", "D"];
  const colors = ["B", "C", "G"];
  const [form, setForm] = useState({
    diameter: "",
    shape: "",
    size: "",
    color: "",
    quantity_to_assemble: "",
  });
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Pobierz zamówienia z API po załadowaniu komponentu
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/orders/")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
      })
      .catch(() => setOrders([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

function handleSubmit(e) {
  e.preventDefault();
  let newErrors = [];
  if (!form.diameter) newErrors.push('Pole "Średnica" jest wymagane.');
  if (!form.shape) newErrors.push('Pole "Kształt" jest wymagane.');
  if (!form.size) newErrors.push('Pole "Rozmiar" jest wymagane.');
  if (!form.color) newErrors.push('Pole "Kolor" jest wymagane.');
  if (!form.quantity_to_assemble) newErrors.push('Pole "Ilość do złożenia" jest wymagane.');
  setErrors(newErrors);
  if (newErrors.length === 0) {
    fetch("http://127.0.0.1:8000/api/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        fetch("http://127.0.0.1:8000/api/orders/")
          .then((res) => res.json())
          .then((data) => setOrders(data));
        setForm({
          diameter: "",
          shape: "",
          size: "",
          color: "",
          quantity_to_assemble: "",
        });
      });
  }
}

  function openDeleteModal(order) {
    setOrderToDelete(order);
    setShowModal(true);
  }

  function closeDeleteModal() {
    setShowModal(false);
    setOrderToDelete(null);
  }

  function handleDelete() {
    if (!orderToDelete) return;
    fetch(`http://127.0.0.1:8000/api/orders/${orderToDelete.id}/`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderToDelete.id));
        closeDeleteModal();
      } else {
        alert("Błąd podczas usuwania zamówienia.");
      }
    });
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
      <section className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Formularz zamówienia produktu</h1>
        {errors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <ul className="list-disc pl-5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="hidden md:grid grid-cols-5 gap-6 mb-7">
            <div className="font-medium text-gray-700">Średnica montażowa anemostatu:</div>
            <div className="font-medium text-gray-700">Kształt anemostatu:</div>
            <div className="font-medium text-gray-700">Rozmiar anemostatu:</div>
            <div className="font-medium text-gray-700">Kolor anemostatu:</div>
            <div className="font-medium text-gray-700">Ilość do złożenia:</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                Średnica montażowa anemostatu
              </label>
              <select
                name="diameter"
                value={form.diameter}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">- Wybierz -</option>
                {diameters.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                Kształt anemostatu
              </label>
              <select
                name="shape"
                value={form.shape}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">- Wybierz -</option>
                {shapes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                Rozmiar anemostatu
              </label>
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">- Wybierz -</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                Kolor anemostatu
              </label>
              <select
                name="color"
                value={form.color}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">- Wybierz -</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                Ilość do złożenia
              </label>
              <input
                type="number"
                name="quantity_to_assemble"
                min="0"
                value={form.quantity_to_assemble}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Zatwierdź
            </button>
          </div>
        </form>
      </section>

      {orders.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-4">Ostatnie zamówienia:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Data utworzenia</th>
                  <th className="px-4 py-2">Średnica</th>
                  <th className="px-4 py-2">Kształt</th>
                  <th className="px-4 py-2">Rozmiar</th>
                  <th className="px-4 py-2">Kolor</th>
                  <th className="px-4 py-2">Ilość</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{order.diameter}</td>
                    <td className="px-4 py-2">{order.shape}</td>
                    <td className="px-4 py-2">{order.size}</td>
                    <td className="px-4 py-2">{order.color}</td>
                    <td className="px-4 py-2">{order.quantity_to_assemble}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        className="text-red-600 font-bold hover:text-red-800"
                        title="Usuń zamówienie"
                        onClick={() => openDeleteModal(order)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

            {/* MODAL USUWANIA */}
        {showModal && orderToDelete && (
        <OrderDeleteModal
          order={orderToDelete}
          onDelete={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </div>
  );
}
   