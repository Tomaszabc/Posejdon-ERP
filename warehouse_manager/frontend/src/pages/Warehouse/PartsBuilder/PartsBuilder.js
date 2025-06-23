import React, { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import ConfirmAddModal from './ConfirmAddModal';
import ConfirmEditModal from './ConfirmEditModal';

import {
  fetchProducts,
  fetchMaterials,
  fetchRecipe,
  deleteRecipeItem,
  patchRecipeItem,
  postRecipeItem,
} from './api';

export default function PartsBuilder() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, action: null, payload: null });
  const [productSearch, setProductSearch] = useState(''); // Dodaj ten stan
  const [materialSearch, setMaterialSearch] = useState(''); // Dodaj ten stan

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchMaterials().then(setMaterials);
  }, []);

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
      alert('Błąd usuwania materiału.');
    }
    setModal({ open: false, action: null, payload: null });
  };

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

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedMaterial || quantity <= 0) return;
    const found = recipe.find((r) => String(r.material) === String(selectedMaterial));
    setModal({
      open: true,
      action: found ? 'edit' : 'add',
      payload: { materialId: selectedMaterial, quantity },
    });
  };
  // Sprawdź czy wybrany materiał już jest w przepisie
  const isEdit = !!recipe.find((r) => String(r.material) === String(selectedMaterial));

  const getMaterialNameById = (id) => {
    const row = recipe.find((r) => r.id === id);
    return row ? row.material_name : '';
  };

  const confirmAdd = async () => {
    const { materialId, quantity } = modal.payload;
    const res = await postRecipeItem(selectedProduct, materialId, quantity);
    if (!res.ok) {
      alert('Błąd dodawania materiału do produktu.');
      setModal({ open: false, action: null, payload: null });
      return;
    }
    fetchRecipe(selectedProduct).then(setRecipe);
    setSelectedMaterial('');
    setQuantity(1);
    setModal({ open: false, action: null, payload: null });
  };

  const confirmEdit = async () => {
    const { materialId, quantity } = modal.payload;
    const found = recipe.find((r) => String(r.material) === String(materialId));
    if (!found) return;
    const res = await patchRecipeItem(found.id, quantity);
    if (!res.ok) {
      alert('Błąd edycji ilości materiału.');
      setModal({ open: false, action: null, payload: null });
      return;
    }
    fetchRecipe(selectedProduct).then(setRecipe);
    setSelectedMaterial('');
    setQuantity(1);
    setModal({ open: false, action: null, payload: null });
  };

  // Filtrowanie produktów po nazwie
  const filteredProducts = products
    .filter(
      (prod) =>
        prod.r === 'Towar' &&
        prod.catalog_index &&
        prod.catalog_index.includes('-24-') &&
        prod.full_name.toLowerCase().includes(productSearch.toLowerCase())
    );

  return (
    <>
      <ConfirmAddModal
        open={modal.open && modal.action === 'add'}
        materialName={
          materials.find((m) => String(m.id) === String(modal.payload?.materialId))?.full_name || ''
        }
        quantity={modal.payload?.quantity}
        onConfirm={confirmAdd}
        onCancel={() => setModal({ open: false, action: null, payload: null })}
      />
      <ConfirmEditModal
        open={modal.open && modal.action === 'edit'}
        materialName={
          materials.find((m) => String(m.id) === String(modal.payload?.materialId))?.full_name || ''
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
            ? `Czy na pewno chcesz usunąć materiał: "${getMaterialNameById(modal.payload)}"?`
            : 'Czy na pewno chcesz usunąć ten materiał z przepisu?'
        }
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, action: null, payload: null })}
      />

      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Stwórz moduł:</h1>
        <p className="text-gray-700 mb-4">Tutaj możesz przypisywać towary do modułów.</p>

        {/* Wybór produktu */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Wybierz Moduł:</label>
          {/* Pole wyszukiwania */}
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mb-2"
            placeholder="Wpisz nazwę produktu..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">-- wybierz moduł --</option>
            {filteredProducts.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Formularz dodawania/edycji materiału */}
        {selectedProduct && (
          <form onSubmit={handleAdd} className="mb-8 flex gap-4 items-end">
            <div className="flex-1">
              {/* Pole wyszukiwania komponentów */}
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                placeholder="Wpisz nazwę komponentu..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
              <select
                className="w-full border px-3 py-2 rounded"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                required
              >
                <option value="">-- wybierz komponent --</option>
                {materials
                  .filter((mat) => mat.r === 'Towar')
                  .filter((mat) =>
                    mat.full_name.toLowerCase().includes(materialSearch.toLowerCase())
                  )
                  .map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      📦 {mat.full_name}
                    </option>
                  ))}
              </select>
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
              className={`px-6 py-2 rounded text-white ${isEdit ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-ocean-600 hover:bg-ocean-700'}`}
            >
              {isEdit ? 'Edytuj ilość' : 'Dodaj materiał'}
            </button>
          </form>
        )}

        {/* Lista materiałów przypisanych do produktu */}
        {selectedProduct && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Materiały przypisane do produktu:</h2>
            {loading ? (
              <div>Ładowanie...</div>
            ) : recipe.length === 0 ? (
              <div className="text-gray-500">Brak materiałów przypisanych do tego produktu.</div>
            ) : (
              <table className="min-w-full border mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">Materiał</th>
                    <th className="px-3 py-2 text-right">Ilość</th>
                    <th className="px-3 py-2 text-right">Jednostka</th>
                    <th className="px-3 py-2 text-right">Koszt/szt.</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 flex items-center gap-2">
                        {row.material_r === 'Materiał' ? (
                          <span role="img" aria-label="materiał" title="Materiał">
                            🧱
                          </span>
                        ) : row.material_r === 'Towar' ? (
                          <span role="img" aria-label="towar" title="Towar">
                            📦
                          </span>
                        ) : (
                          <span role="img" aria-label="element" title="Inny">
                            🔧
                          </span>
                        )}
                        {row.material_name}
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="ml-2 text-red-600 hover:text-red-800 font-bold"
                          title="Usuń materiał"
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
