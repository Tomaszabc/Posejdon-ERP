import React, { useState, useEffect } from "react";
import OrderDeleteModal from "../components/modals/OrderDeleteModal";
import OrderConfirmModal from "../components/modals/OrderConfirmModal";
import { filterOrders } from "../utils/orderFilters";

const initialFilters = {
  startDate: "",
  endDate: "",
  diameter: "",
  shape: "",
  size: "",
  color: "",
  quantity: ""
};

export default function Orders() {
  const diameters = ["100", "125", "160"];
  const shapes = ["Okrągły", "Kwadratowy"];
  const sizes = ["S", "M", "L"];
  const colors = ["B", "W", "G"];
  const [form, setForm] = useState({
    diameter: "",
    shape: "",
    size: "",
    color: "",
    quantity_to_assemble: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleClearFilters = () => setFilters(initialFilters);
  const ORDERS_LIMIT = 100;
  const [showFilters, setShowFilters] = useState(false);


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

  useEffect(() => {
    setFilteredOrders(filterOrders(orders, filters, ORDERS_LIMIT));
  }, [filters, orders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
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
  <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8  pb-8">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* LEWA STRONA - FORMULARZ ZAMÓWIENIA */}
      <section className="bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Formularz zamówienia produktu</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Zatwierdź zamówienie
            </button>
          </div>
        </form>
      </section>

      {/* PRAWA STRONA - LISTA ZAMÓWIEŃ I FILTRY */}
      {orders.length > 0 && (
        <section className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">

<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
  Lista zamówień
  {!filters.startDate && !filters.endDate && !filters.diameter && !filters.shape && !filters.size && !filters.color && !filters.quantity && (
    <span className="ml-1 relative group">
      <span
        className="inline-block align-middle cursor-pointer group"
        style={{ borderBottom: "0px dotted #888" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline w-7 h-7 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
        </svg>
        {/* TOOLTIP */}
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
          {ORDERS_LIMIT} najnowszych
        </span>
      </span>
    </span>
  )}
</h2>

            <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  🔍 {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  🗑️ Wyczyść filtry
                </button>
          </div>

   

{showFilters && (
  <div
  className={`bg-gray-50 rounded-xl mb-6 overflow-hidden transition-all duration-500`}
  style={{
    maxHeight: showFilters ? 1000 : 0,
    opacity: showFilters ? 1 : 0,
    pointerEvents: showFilters ? 'auto' : 'none',
    transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s"
  }}
>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtry</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Od daty</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Do daty</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Średnica</label>
          <select
            name="diameter"
            value={filters.diameter}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">Wszystkie</option>
            {diameters.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kształt</label>
          <select
            name="shape"
            value={filters.shape}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">Wszystkie</option>
            {shapes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rozmiar</label>
          <select
            name="size"
            value={filters.size}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">Wszystkie</option>
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kolor</label>
          <select
            name="color"
            value={filters.color}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">Wszystkie</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ilość</label>
          <input
            type="number"
            name="quantity"
            value={filters.quantity}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-ocean-500 focus:border-ocean-500"
            placeholder="Dowolna"
            min="0"
          />
        </div>
      </div>
    </div>
  </div>
)}


          {/* TABELA ZAMÓWIEŃ */}
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Nr</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Data</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Śr.</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Kształt</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Rozm.</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Kolor</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ilość</th>
        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Akcje</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredOrders.map((order) => (
        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{order.id}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
             {new Date(order.created_at).toLocaleDateString('pl-PL', { 
          day: '2-digit', 
          month: '2-digit',
          year: 'numeric'
        })} {new Date(order.created_at).toLocaleTimeString('pl-PL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
          </td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{order.diameter}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
            {order.shape === 'Okrągły' ? 'Okr.' : 'Kw.'}
          </td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.size}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.color}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-center">{order.quantity_to_assemble}</td>
          <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
            <button
              type="button"
              onClick={() => openDeleteModal(order)}
              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
              title="Usuń zamówienie"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>

    {/* MODALNE */}
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

{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
      Dodano zamówienie!
    </div>
  </div>
)}
  </div>
);
}