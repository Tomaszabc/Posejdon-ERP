import React, { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import ConfirmAddModal from './ConfirmAddModal';
import ConfirmEditModal from './ConfirmEditModal';

import {
  fetchProducts,
  fetchComponents,
  fetchRecipe,
  deleteRecipeItem,
  patchRecipeItem,
  postRecipeItem,
} from './api';

export default function ProductBuilder() {
  const [products, setProducts] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, action: null, payload: null });

  // Nowe stany do wyszukiwania i focusa
  const [productSearch, setProductSearch] = useState('');
  const [productInputFocused, setProductInputFocused] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleInputFocused, setModuleInputFocused] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data.filter((p) => p.r === 'Produkt')));
    fetchComponents().then((data) =>
      setModules(
        data.filter(
          (c) =>
            (c.r === 'Towar' || c.r === 'Moduł' || c.r === 'Produkt') &&
            c.catalog_index &&
            c.catalog_index.includes('-24-')
        )
      )
    );
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      fetchRecipe(selectedProduct).then((data) => {
        setRecipe(data);
        setLoading(false);
      });
    } else {
      setRecipe([]);
    }
  }, [selectedProduct]);

  const handleDelete = (id) => {
    setModal({
      open: true,
      action: 'delete',
      payload: id,
    });
  };

  const confirmDelete = async () => {
    const id = modal.payload;
    const res = await deleteRecipeItem(id);
    if (res.ok) {
      setRecipe(recipe.filter((r) => r.id !== id));
    } else {
      alert('Błąd usuwania modułu.');
    }
    setModal({ open: false, action: null, payload: null });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedModule || quantity <= 0) return;
    const found = recipe.find((r) => String(r.material) === String(selectedModule));
    setModal({
      open: true,
      action: found ? 'edit' : 'add',
      payload: { materialId: selectedModule, quantity },
    });
  };

  const isEdit = !!recipe.find((r) => String(r.material) === String(selectedModule));

  const getModuleNameById = (id) => {
    const row = recipe.find((r) => r.id === id);
    return row ? row.material_name : '';
  };

  const confirmAdd = async () => {
    const { materialId, quantity } = modal.payload;
    const res = await postRecipeItem(selectedProduct, materialId, quantity);
    if (!res.ok) {
      alert('Błąd dodawania modułu do produktu.');
      setModal({ open: false, action: null, payload: null });
      return;
    }
    fetchRecipe(selectedProduct).then(setRecipe);
    setSelectedModule('');
    setQuantity(1);
    setModal({ open: false, action: null, payload: null });
  };

  const confirmEdit = async () => {
    const { materialId, quantity } = modal.payload;
    const found = recipe.find((r) => String(r.material) === String(materialId));
    if (!found) return;
    const res = await patchRecipeItem(found.id, quantity);
    if (!res.ok) {
      alert('Błąd edycji ilości modułu.');
      setModal({ open: false, action: null, payload: null });
      return;
    }
    fetchRecipe(selectedProduct).then(setRecipe);
    setSelectedModule('');
    setQuantity(1);
    setModal({ open: false, action: null, payload: null });
  };

  // Filtrowanie produktów po nazwie
  const filteredProducts = products.filter((prod) =>
    prod.full_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <>
      <ConfirmAddModal
        open={modal.open && modal.action === 'add'}
        materialName={
          modules.find((m) => String(m.id) === String(modal.payload?.materialId))?.full_name || ''
        }
        quantity={modal.payload?.quantity}
        onConfirm={confirmAdd}
        onCancel={() => setModal({ open: false, action: null, payload: null })}
      />
      <ConfirmEditModal
        open={modal.open && modal.action === 'edit'}
        materialName={
          modules.find((m) => String(m.id) === String(modal.payload?.materialId))?.full_name || ''
        }
        quantity={modal.payload?.quantity}
        onConfirm={confirmEdit}
        onCancel={() => setModal({ open: false, action: null, payload: null })}
      />

      <ConfirmModal
        open={modal.open && modal.action === 'delete'}
        title="Potwierdź usunięcie"
        message={
          modal.payload
            ? `Czy na pewno chcesz usunąć moduł: "${getModuleNameById(modal.payload)}"?`
            : 'Czy na pewno chcesz usunąć ten moduł z przepisu?'
        }
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, action: null, payload: null })}
      />

      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Przypisz moduły do produktu:</h1>
        <p className="text-gray-700 mb-4">
          Tutaj możesz przypisywać moduły do produktów finalnych.
        </p>

        {/* Wybór produktu */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Wybierz produkt:</label>
          <div className="relative">
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-2"
              placeholder="Wpisz nazwę produktu..."
              value={
                selectedProduct
                  ? products.find((p) => String(p.id) === String(selectedProduct))?.full_name ||
                    productSearch
                  : productSearch
              }
              onChange={(e) => {
                setProductSearch(e.target.value);
                setSelectedProduct('');
              }}
              onFocus={() => setProductInputFocused(true)}
              onBlur={() => setTimeout(() => setProductInputFocused(false), 150)}
              autoComplete="off"
            />
            {productInputFocused && !selectedProduct && (
              <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                {filteredProducts.map((prod) => (
                  <li
                    key={prod.id}
                    className="px-3 py-2 cursor-pointer hover:bg-ocean-100 text-black"
                    onClick={() => {
                      setSelectedProduct(prod.id);
                      setProductSearch(prod.full_name);
                      setProductInputFocused(false);
                    }}
                  >
                    🏗️ {prod.full_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Formularz dodawania modułu */}
        {selectedProduct && (
          <form onSubmit={handleAdd} className="mb-8 flex gap-4 items-end">
            <div className="flex-1 relative">
              {/* Pole wyszukiwania modułów */}
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                placeholder="Wpisz nazwę modułu..."
                value={
                  selectedModule
                    ? modules.find((m) => String(m.id) === String(selectedModule))?.full_name ||
                      moduleSearch
                    : moduleSearch
                }
                onChange={(e) => {
                  setModuleSearch(e.target.value);
                  setSelectedModule('');
                }}
                onFocus={() => setModuleInputFocused(true)}
                onBlur={() => setTimeout(() => setModuleInputFocused(false), 150)}
                autoComplete="off"
              />
              {/* Lista podpowiedzi */}
              {moduleInputFocused && !selectedModule && (
                <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                  {(moduleSearch
                    ? modules.filter((mod) =>
                        mod.full_name.toLowerCase().includes(moduleSearch.toLowerCase())
                      )
                    : modules
                  )
                    
                    .map((mod) => (
                      <li
                        key={mod.id}
                        className="px-3 py-2 cursor-pointer hover:bg-ocean-100 text-black"
                        onClick={() => {
                          setSelectedModule(mod.id);
                          setModuleSearch(mod.full_name);
                          setModuleInputFocused(false);
                        }}
                      >
                        🧩 {mod.full_name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Ilość:</label>
              <input
                type="number"
                min={0.001}
                step={0.001}
                className="w-24 border px-3 py-2 rounded"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 rounded text-white bg-ocean-600 hover:bg-ocean-700"
              disabled={!selectedModule}
            >
              {isEdit ? 'Edytuj ilość' : 'Dodaj moduł'}
            </button>
          </form>
        )}

        {/* Lista modułów przypisanych do produktu */}
        {selectedProduct && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Moduły przypisane do produktu:</h2>
            {loading ? (
              <div>Ładowanie...</div>
            ) : recipe.length === 0 ? (
              <div className="text-gray-500">Brak modułów przypisanych do tego produktu.</div>
            ) : (
              <table className="min-w-full border mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">Moduł</th>
                    <th className="px-3 py-2 text-right">Ilość</th>
                    <th className="px-3 py-2 text-right">Jednostka</th>
                    <th className="px-3 py-2 text-right">Koszt/szt.</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 flex items-center gap-2">
                        <span role="img" aria-label="moduł" title="Moduł">
                          🧩
                        </span>
                        {row.material_name}
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="ml-2 text-red-600 hover:text-red-800 font-bold"
                          title="Usuń moduł"
                        >
                          ×
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right">{row.quantity_needed}</td>
                      <td className="px-3 py-2 text-right">{row.material_unit}</td>
                      <td className="px-3 py-2 text-right">{row.material_price} zł</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
