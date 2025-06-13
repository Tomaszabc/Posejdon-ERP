import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDeleteModal from '../../components/modals/OrderDeleteModal';
import MissingErrorModal from '../../components/modals/MissingErrorModal';
import UndoModal from '../../components/modals/UndoModal';
import UndoSuccessModal from '../../components/modals/UndoSuccessModal';
import ConfirmProductionModal from './ConfirmProductionModal';

export default function ComponentProduction() {
  const [form, setForm] = useState({ component: '', quantity: '' });
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [components, setComponents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingMaterials, setMissingMaterials] = useState([]);
  const [missingMessage, setMissingMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToProduce, setOrderToProduce] = useState(null);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [orderToUndo, setOrderToUndo] = useState(null);
  const [showUndoSuccess, setShowUndoSuccess] = useState(false);
  const navigate = useNavigate();

  const openProduceModal = (order) => {
    setOrderToProduce(order);
    setShowProduceModal(true);
  };

  const openUndoModal = (order) => {
    setOrderToUndo(order);
    setShowUndoModal(true);
  };

  const closeUndoModal = () => {
    setShowUndoModal(false);
    setOrderToUndo(null);
  };

  useEffect(() => {
    // Pobierz tylko komponenty (r === 'Towar')
    fetch('http://127.0.0.1:8000/api/components-for-order/')
      .then((res) => res.json())
      .then((data) => setComponents(data.filter((c) => c.r === 'Towar')));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
    fetch('http://127.0.0.1:8000/api/product-to-production/')
      .then((res) => res.json())
      .then((data) => {
        // Pokaż tylko zamówienia na komponenty typu 'Towar' i posortuj po ID
        const filteredOrders = data
          .filter((o) => o.component_r === 'Towar')
          .sort((a, b) => b.id - a.id); // Sortowanie malejące (najnowsze na górze)

        setOrders(filteredOrders);
      })
      .catch(() => {
        setOrders([]);
      });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleProduceOrder = () => {
    // Najpierw sprawdź dostępność materiałów
    fetch('http://127.0.0.1:8000/api/check-materials-availability/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component: orderToProduce.component || orderToProduce.id,
        quantity: orderToProduce.quantity,
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          // Materiały dostępne - kontynuuj produkcję
          proceedWithProduction();
        } else if (data.missing) {
          // Brak materiałów - pokaż modal błędu
          setMissingMaterials(data.missing);
          setMissingMessage(data.error || 'Brak wystarczającej ilości materiałów.');
          setShowMissingModal(true);
          setShowProduceModal(false);
          setOrderToProduce(null);
        } else {
          alert(data.error || 'Błąd sprawdzania dostępności materiałów.');
          setShowProduceModal(false);
          setOrderToProduce(null);
        }
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        setShowProduceModal(false);
        setOrderToProduce(null);
      });
  };

  const proceedWithProduction = () => {
    fetch(`http://127.0.0.1:8000/api/production/produce/${orderToProduce.id}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          fetchOrders();
        } else {
          alert(data.error || 'Błąd podczas produkcji.');
        }
        setShowProduceModal(false);
        setOrderToProduce(null);
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        setShowProduceModal(false);
        setOrderToProduce(null);
      });
  };

  function handleSubmit(e) {
    e.preventDefault();
    let newErrors = [];
    if (!form.component) newErrors.push('Wybierz komponent.');
    if (!form.quantity) newErrors.push('Podaj ilość.');
    setErrors(newErrors);
    if (newErrors.length === 0) {
      setShowConfirmModal(true);
    }
  }

  const handleUndoProduction = () => {
    if (!orderToUndo) return;

    fetch(`http://127.0.0.1:8000/api/production/undo/${orderToUndo.id}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          fetchOrders();
          closeUndoModal();
          setShowUndoSuccess(true);
          setTimeout(() => setShowUndoSuccess(false), 2000);
        } else {
          alert(data.error || 'Błąd podczas cofania produkcji.');
          closeUndoModal();
        }
      })
      .catch(() => {
        alert('Błąd połączenia z serwerem.');
        closeUndoModal();
      });
  };

  function handleConfirmSubmit() {
    fetch('http://127.0.0.1:8000/api/product-to-production/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component: form.component,
        quantity: form.quantity,
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          setShowSuccess(true);
          setForm({ component: '', quantity: '' });
          fetchOrders();
          setTimeout(() => setShowSuccess(false), 1200);
        } else {
          setErrors([data.error || 'Błąd podczas dodawania zlecenia.']);
        }
        setShowConfirmModal(false); // zamknij modal po próbie
      })
      .catch(() => {
        setErrors(['Błąd połączenia z serwerem.']);
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
    fetch(`http://127.0.0.1:8000/api/product-to-production/${orderToDelete.id}/`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderToDelete.id));
        closeDeleteModal();
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 1000);
      } else {
        alert('Błąd podczas usuwania zlecenia.');
      }
    });
  }

  return (
    <div className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
        {/* LEWA STRONA - NOWY FORMULARZ */}
        <section className="xl:col-span-3 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 h-fit">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Zleć produkcję komponentu</h1>
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
                Wybierz komponent
              </label>
              <select
                name="component"
                value={form.component}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">- Wybierz komponent -</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.catalog_index} – {c.full_name}
                  </option>
                ))}
              </select>
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
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Zatwierdź zlecenie
              </button>
            </div>
          </form>
        </section>
        {/* PRAWA STRONA - LISTA ZLECEŃ */}
        <section className="xl:col-span-7 bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Lista zleceń produkcji komponentów
          </h2>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Nr
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Data zlecenia
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    SKU
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa komponentu
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Ilość
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Nie nawiguj jeśli kliknięto przycisk
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
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex justify-center gap-2">
                        {order.is_produced ? (
                          <button
                            type="button"
                            onClick={() => openUndoModal(order)}
                            className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded"
                            title="Cofnij produkcję"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openProduceModal(order)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
                            title="Zatwierdź produkcję"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                          title="Usuń zlecenie"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODALNE */}
      {showModal && orderToDelete && (
        <OrderDeleteModal
          order={orderToDelete}
          onDelete={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Dodano zlecenie!
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
            Zlecenie usunięte!
          </div>
        </div>
      )}
      <MissingErrorModal
        show={showMissingModal}
        message={missingMessage}
        missing={missingMaterials}
        onClose={() => setShowMissingModal(false)}
      />
      {/* Modal do potwierdzenia dodania nowego zlecenia */}
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

      {/* Modal do potwierdzenia produkcji istniejącego zlecenia */}
      <ConfirmProductionModal
        order={orderToProduce}
        show={showProduceModal}
        onCancel={() => setShowProduceModal(false)}
        onConfirm={handleProduceOrder}
      />

      {/* Modal do potwierdzenia cofnięcia produkcji */}
      {showUndoModal && orderToUndo && (
        <UndoModal
          order={orderToUndo}
          onConfirm={handleUndoProduction}
          onCancel={closeUndoModal}
          show={showUndoModal}
        />
      )}

      {/* Modal sukcesu cofnięcia */}
      <UndoSuccessModal show={showUndoSuccess} />
    </div>
  );
}
