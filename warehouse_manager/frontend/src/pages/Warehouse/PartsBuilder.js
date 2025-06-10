import React, { useEffect, useState } from "react";

export default function PartsBuilder() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pobierz produkty i materiały
  useEffect(() => {
    fetch("/api/components-for-order/")
      .then(res => res.json())
      .then(setProducts);
    fetch("/api/materials-for-parts/")
      .then(res => res.json())
      .then(setMaterials);
  }, []);

  // Pobierz przepis dla wybranego produktu
  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      fetch(`/api/product-recipe/${selectedProduct}/`)
        .then(res => res.json())
        .then(data => {
          setRecipe(data);
          setLoading(false);
        });
    } else {
      setRecipe([]);
    }
  }, [selectedProduct]);

  // Dodaj materiał do produktu
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedMaterial || quantity <= 0) return;
    const res = await fetch("/api/parts-builder/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: selectedProduct,
        material: selectedMaterial,
        quantity_needed: quantity,
      }),
    });
    if (res.ok) {
      // Odśwież przepis
      fetch(`/api/product-recipe/${selectedProduct}/`)
        .then(res => res.json())
        .then(setRecipe);
      setSelectedMaterial("");
      setQuantity(1);
    } else {
      alert("Błąd dodawania materiału do produktu.");
    }
  };

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

      {/* Formularz dodawania materiału */}
      {selectedProduct && (
        <form onSubmit={handleAdd} className="mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Materiał:</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={selectedMaterial}
              onChange={e => setSelectedMaterial(e.target.value)}
              required
            >
              <option value="">-- wybierz materiał --</option>
              {materials.map(mat => (
                <option key={mat.id} value={mat.id}>
                  {mat.full_name}
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
            className="bg-ocean-600 text-white px-6 py-2 rounded hover:bg-ocean-700"
          >
            Dodaj materiał
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
                    <td className="px-3 py-2">{row.material_name}</td>
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