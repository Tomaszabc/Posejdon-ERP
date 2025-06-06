import React, { useState, useEffect } from "react";
import OrderDeleteModal from "../components/modals/OrderDeleteModal";
import OrderConfirmModal from "../components/modals/OrderConfirmModal";

export default function Orders() {
  const diameters = ["100", "125", "150"];
  const shapes = ["Okrągły", "Kwadratowy"];
  const sizes = ["S", "M", "L"];
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
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const ORDERS_LIMIT = 100;

  // Pobieranie zamówień tylko raz na start
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/orders/")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
      })
      .catch(() => {
        setOrders([]);
      });
  }, []);

  // Filtrowanie zamówień po zmianie daty lub zamówień
  useEffect(() => {
    const { startDate, endDate } = dateFilter;
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate
        ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) // Ustawienie końca dnia
        : null;

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true;
    });

    if (!startDate && !endDate) {
      setFilteredOrders(
        filtered
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, ORDERS_LIMIT)
      );
    } else {
      setFilteredOrders(
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    }
  }, [dateFilter, orders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      setShowConfirmModal(true);
    }
  }

  function handleConfirmSubmit() {
    fetch("http://127.0.0.1:8000/api/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        fetch("http://127.0.0.1:8000/api/orders/")
          .then((res) => res.json())
          .then((data) => {
            setOrders(data);
          });
        setForm({
          diameter: "",
          shape: "",
          size: "",
          color: "",
          quantity_to_assemble: "",
        });
        setShowConfirmModal(false);
      });
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
        const updatedOrders = orders.filter((o) => o.id !== orderToDelete.id);
        setOrders(updatedOrders);
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
        <section className="mt-12 bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              Ostatnie zamówienia {!dateFilter.startDate && !dateFilter.endDate && `(${ORDERS_LIMIT} najnowszych)`}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Od daty</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateFilter.startDate}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do daty</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateFilter.endDate}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nr. zamówienia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data utworzenia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Średnica</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kształt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rozmiar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kolor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ilość</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.diameter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shape}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.color}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity_to_assemble}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(order)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Usuń zamówienie"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {showModal && orderToDelete && (
        <OrderDeleteModal
          order={orderToDelete}
          onDelete={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}

      {showConfirmModal && (
        <OrderConfirmModal
          order={form}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}