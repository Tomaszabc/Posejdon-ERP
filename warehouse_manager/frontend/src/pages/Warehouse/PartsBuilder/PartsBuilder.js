import React, { useEffect, useState } from "react";
import {
  fetchProducts,
  fetchMaterials,
  fetchRecipe,
  deleteRecipeItem,
  patchRecipeItem,
  postRecipeItem,
} from "./api";

export default function PartsBuilder() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchProducts().then(setProducts);
  fetchMaterials().then(setMaterials);
}, []);

const handleDelete = async (id) => {
  if (!window.confirm("Czy na pewno chcesz usunąć ten materiał z przepisu?")) return;
  const res = await deleteRecipeItem(id);
  if (res.ok) {
    setRecipe(recipe.filter(r => r.id !== id));
  } else {
    alert("Błąd usuwania materiału.");
  }
};

useEffect(() => {
  if (selectedProduct) {
    setLoading(true);
    fetchRecipe(selectedProduct)
      .then(data => {
        setRecipe(data);
        setLoading(false);
      });
  } else {
    setRecipe([]);
  }
}, [selectedProduct]);

const handleAdd = async (e) => {
  e.preventDefault();
  if (!selectedProduct || !selectedMaterial || quantity <= 0) return;
  const found = recipe.find(r => String(r.material) === String(selectedMaterial));
  let res;
  if (found) {
    res = await patchRecipeItem(found.id, quantity);
    if (!res.ok) {
      alert("Błąd edycji ilości materiału.");
      return;
    }
  } else {
    res = await postRecipeItem(selectedProduct, selectedMaterial, quantity);
    if (!res.ok) {
      alert("Błąd dodawania materiału do produktu.");
      return;
    }
  }
  fetchRecipe(selectedProduct).then(setRecipe);
  setSelectedMaterial("");
  setQuantity(1);
};
  // Sprawdź czy wybrany materiał już jest w przepisie
  const isEdit = !!recipe.find(r => String(r.material) === String(selectedMaterial));

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Parts Builder</h1>
      <p className="text-gray-700 mb-4">
        Tutaj możesz przypisywać materiały do produktów produkcyjnych (BOM).
      </p>

      {/* Wybór produktu */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Wybierz produkt:</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedProduct}
          onChange={e => setSelectedProduct(e.target.value)}
        >
          <option value="">-- wybierz produkt --</option>
          {products.map(prod => (
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
            <label className="block mb-1 font-medium flex items-center gap-4">
              Materiał:
              <span className="text-sm font-normal flex items-center gap-2">
                <span title="Materiał" className="flex items-center"><span role="img" aria-label="materiał">🧱</span> Materiał</span>
                <span title="Towar" className="flex items-center"><span role="img" aria-label="towar">📦</span> Towar</span>
              </span>
            </label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={selectedMaterial}
              onChange={e => setSelectedMaterial(e.target.value)}
              required
            >
              <option value="">-- wybierz materiał lub towar --</option>
              {materials.map(mat => (
                <option key={mat.id} value={mat.id}>
                  {mat.r === "Materiał" ? "🧱" : mat.r === "Towar" ? "📦" : "🔧"} {mat.full_name}
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
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white ${isEdit ? "bg-yellow-600 hover:bg-yellow-700" : "bg-ocean-600 hover:bg-ocean-700"}`}
          >
            {isEdit ? "Edytuj ilość" : "Dodaj materiał"}
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
                {recipe.map(row => (
                    <tr key={row.id}>
                    <td className="px-3 py-2 flex items-center gap-2">
                        {row.material_r === "Materiał" ? (
                        <span role="img" aria-label="materiał" title="Materiał">🧱</span>
                        ) : row.material_r === "Towar" ? (
                        <span role="img" aria-label="towar" title="Towar">📦</span>
                        ) : (
                        <span role="img" aria-label="element" title="Inny">🔧</span>
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
  );
}