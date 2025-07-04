import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import ConfirmProductionModal from './ConfirmProductionModal';

export default function MakeSelfOrder({ components: propsComponents = [], onSubmit }) {
  const [form, setForm] = useState({
    component: '',
    quantity: 1,
    uwagi: '',
    pilne: false,
  });
  const [componentSearch, setComponentSearch] = useState('');
  const [componentInputFocused, setComponentInputFocused] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [components, setComponents] = useState(propsComponents);

  // Pobierz komponenty jeśli nie przekazano przez props
  useEffect(() => {
    if (!propsComponents || propsComponents.length === 0) {
      fetch(`${API_URL}/api/components-for-order/`)
        .then((res) => res.json())
        .then((data) => setComponents(data.filter((c) => c.r === 'Towar' || c.r === 'Produkt')));
    } else {
      setComponents(propsComponents);
    }
  }, [propsComponents]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = [];
    if (!form.component) newErrors.push('Wybierz moduł.');
    if (!form.quantity || form.quantity < 1) newErrors.push('Podaj ilość większą od zera.');
    setErrors(newErrors);
    if (newErrors.length === 0) {
      setShowConfirmModal(true);
    }
  };

  // Wysyłka zamówienia do API
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setErrors([]);
    const token = localStorage.getItem('access');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`${API_URL}/api/product-to-production/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        component: form.component,
        quantity: form.quantity,
        uwagi: form.uwagi,
        pilne: form.pilne,
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          setShowSuccess(true);
          setForm({ component: '', quantity: 1, uwagi: '', pilne: false });
          setComponentSearch('');
          setTimeout(() => setShowSuccess(false), 1200);
          if (onSubmit) onSubmit(form); // callback do odświeżenia listy, jeśli przekazany
        } else {
          setErrors([data.error || 'Błąd podczas dodawania zlecenia.']);
        }
      })
      .catch(() => {
        setErrors(['Błąd połączenia z serwerem.']);
      });
  };

  return (
    <section className=" bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Zleć produkcję:</h1>
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
            Wybierz potrzebny element:
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500 mb-2"
              placeholder="Wpisz nazwę lub SKU modułu..."
              value={
                form.component
                  ? components.find((c) => String(c.id) === String(form.component))?.full_name ||
                    componentSearch
                  : componentSearch
              }
              onChange={(e) => {
                setComponentSearch(e.target.value);
                setForm((prev) => ({ ...prev, component: '' }));
              }}
              onFocus={() => setComponentInputFocused(true)}
              onBlur={() => setTimeout(() => setComponentInputFocused(false), 150)}
              autoComplete="off"
            />
            {componentInputFocused && !form.component && (
              <ul
                className="absolute z-20 bg-white border shadow-lg max-h-60 overflow-y-auto"
                style={{
                  minWidth: '420px',
                  borderRadius: '1.5rem',
                  right: 'unset',
                  left: '60',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  padding: '6px 0',
                  marginTop: '4px',
                }}
              >
                {components
                  .filter(
                    (c) =>
                      (c.r === 'Towar' || c.r === 'Produkt') &&
                      (c.full_name.toLowerCase().includes(componentSearch.toLowerCase()) ||
                        c.catalog_index.toLowerCase().includes(componentSearch.toLowerCase()))
                  )
                  .map((c) => (
                    <li
                      key={c.id}
                      className="px-4 py-2 cursor-pointer hover:bg-ocean-100 text-black transition rounded-xl"
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, component: c.id }));
                        setComponentSearch(c.full_name);
                        setComponentInputFocused(false);
                      }}
                    >
                      <span className="font-semibold text-ocean-700">{c.catalog_index}</span>
                      <span className="mx-2 text-gray-400">–</span>
                      <span>{c.full_name}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ilość</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uwagi</label>
          <input
            type="text"
            name="uwagi"
            value={form.uwagi}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder="Wpisz uwagi (opcjonalnie)"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="pilne"
            id="pilne"
            checked={form.pilne}
            onChange={handleChange}
            className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="pilne" className="text-sm font-medium text-red-700 select-none">
            PILNE
          </label>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Zatwierdź zlecenie
          </button>
        </div>
      </form>
      {/* Modal potwierdzenia */}
      <ConfirmProductionModal
        order={{
          id: null,
          component_catalog_index:
            components.find((c) => c.id == form.component)?.catalog_index || '',
          component_full_name: components.find((c) => c.id == form.component)?.full_name || '',
          quantity: form.quantity,
        }}
        show={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />
      {/* Sukces */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Dodano zlecenie!
          </div>
        </div>
      )}
    </section>
  );
}
