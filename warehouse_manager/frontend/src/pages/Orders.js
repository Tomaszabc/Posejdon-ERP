import React, { useState } from "react";

export default function Orders() {
  // Przykładowe dane do selectów i zamówień (docelowo pobierzesz z API)
  const diameters = ["100", "125", "150"];
  const shapes = ["okrągły", "kwadratowy"];
  const sizes = ["mały", "średni", "duży"];
  const colors = ["biały", "czarny", "szary"];
  const [form, setForm] = useState({
    diameter: "",
    shape: "",
    size: "",
    color: "",
    quantity_to_assemble: "",
  });
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);

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
    setOrders([
      ...orders,
      { ...form, id: orders.length + 1, created_at: new Date().toLocaleString() },
    ]);
    setForm({
      diameter: "",
      shape: "",
      size: "",
      color: "",
      quantity_to_assemble: "",
    });
  }
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
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.created_at}</td>
                    <td className="px-4 py-2">{order.diameter}</td>
                    <td className="px-4 py-2">{order.shape}</td>
                    <td className="px-4 py-2">{order.size}</td>
                    <td className="px-4 py-2">{order.color}</td>
                    <td className="px-4 py-2">{order.quantity_to_assemble}</td>
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