import React, { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import ConfirmAddModal from './ConfirmAddModal';
import ConfirmEditModal from './ConfirmEditModal';

import {
  fetchMaterials,
  fetchComponents, // Dodaj funkcję pobierającą tylko komponenty
  fetchRecipe,
  deleteRecipeItem,
  patchRecipeItem,
  postRecipeItem,
} from './api';

export default function ComponentsBuilder() {
  const [components, setComponents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, action: null, payload: null });
  const [componentSearch, setComponentSearch] = useState('');
  const [componentInputFocused, setComponentInputFocused] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialInputFocused, setMaterialInputFocused] = useState(false);

  useEffect(() => {
    fetchComponents().then(setComponents); // pobierz tylko komponenty (r === 'Komponent')
    fetchMaterials().then(setMaterials); // pobierz tylko towary (r === 'Towar')
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      setLoading(true);
      fetchRecipe(selectedComponent).then((data) => {
        setRecipe(data);
        setLoading(false);
      });
    } else {
      setRecipe([]);
    }
  }, [selectedComponent]);

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

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedComponent || !selectedMaterial || quantity <= 0) return;
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
    const res = await postRecipeItem(selectedComponent, materialId, quantity);
    if (!res.ok) {
      alert('Błąd dodawania materiału do produktu.');
      setModal({ open: false, action: null, payload: null });
      return;
    }
    fetchRecipe(selectedComponent).then(setRecipe);
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
    fetchRecipe(selectedComponent).then(setRecipe);
    setSelectedMaterial('');
    setQuantity(1);
    setModal({ open: false, action: null, payload: null });
  };

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
        <h1 className="text-3xl font-bold mb-6">Przypisz materiały do towarów</h1>
        <p className="text-gray-700 mb-4">Tutaj możesz przypisywać materiały do towarów.</p>

        {/* Wybór komponentu */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Wybierz towar:</label>
          <div className="relative">
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-2"
              placeholder="Wpisz nazwę towaru..."
              value={
                selectedComponent
                  ? components.find((c) => String(c.id) === String(selectedComponent))?.full_name || componentSearch
                  : componentSearch
              }
              onChange={(e) => {
                setComponentSearch(e.target.value);
                setSelectedComponent('');
              }}
              onFocus={() => setComponentInputFocused(true)}
              onBlur={() => setTimeout(() => setComponentInputFocused(false), 150)}
              autoComplete="off"
            />
            {componentInputFocused && !selectedComponent && (
              <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                {(componentSearch
                  ? components
                      .filter((comp) => comp.r === 'Towar')
                      .filter((comp) =>
                        comp.full_name.toLowerCase().includes(componentSearch.toLowerCase())
                      )
                  : components.filter((comp) => comp.r === 'Towar')
                )
                  .slice(0, 20)
                  .map((comp) => (
                    <li
                      key={comp.id}
                      className="px-3 py-2 cursor-pointer hover:bg-ocean-100 text-black"
                      onClick={() => {
                        setSelectedComponent(comp.id);
                        setComponentSearch(comp.full_name);
                        setComponentInputFocused(false);
                      }}
                    >
                      📦 {comp.full_name}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Formularz dodawania materiału */}
        {selectedComponent && (
          <form onSubmit={handleAdd} className="mb-8 flex gap-4 items-end">
            <div className="flex-1 relative">
              {/* Pole wyszukiwania materiałów */}
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                placeholder="Wpisz nazwę materiału..."
                value={
                  selectedMaterial
                    ? materials.find((m) => String(m.id) === String(selectedMaterial))?.full_name || materialSearch
                    : materialSearch
                }
                onChange={(e) => {
                  setMaterialSearch(e.target.value);
                  setSelectedMaterial('');
                }}
                onFocus={() => setMaterialInputFocused(true)}
                onBlur={() => setTimeout(() => setMaterialInputFocused(false), 150)}
                autoComplete="off"
              />
              {/* Lista podpowiedzi */}
              {materialInputFocused && !selectedMaterial && (
                <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                  {(materialSearch
                    ? materials
                        .filter((mat) => mat.r === 'Materiał')
                        .filter((mat) =>
                          mat.full_name.toLowerCase().includes(materialSearch.toLowerCase())
                        )
                    : materials.filter((mat) => mat.r === 'Materiał')
                  )
                    .slice(0, 20)
                    .map((mat) => (
                      <li
                        key={mat.id}
                        className="px-3 py-2 cursor-pointer hover:bg-ocean-100 text-black"
                        onClick={() => {
                          setSelectedMaterial(mat.id);
                          setMaterialSearch(mat.full_name);
                          setMaterialInputFocused(false);
                        }}
                      >
                        🧱 {mat.full_name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Ilość materiału: [kg/m2]</label>
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
              disabled={!selectedMaterial}
            >
              Dodaj towar
            </button>
          </form>
        )}

        {/* Lista materiałów przypisanych do produktu */}
        {selectedComponent && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Materiały przypisane do komponentu:</h2>
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
