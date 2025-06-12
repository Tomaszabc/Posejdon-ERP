export async function fetchProducts() {
  const res = await fetch('/api/components-for-order/');
  return res.json();
}

export async function fetchMaterials() {
  const res = await fetch('/api/materials-for-parts/');
  return res.json();
}

export async function fetchRecipe(productId) {
  const res = await fetch(`/api/product-recipe/${productId}/`);
  return res.json();
}

export async function deleteRecipeItem(id) {
  return fetch(`/api/parts-builder/${id}/`, { method: 'DELETE' });
}

export async function patchRecipeItem(id, quantity) {
  return fetch(`/api/parts-builder/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity_needed: quantity }),
  });
}

export async function postRecipeItem(product, material, quantity) {
  return fetch('/api/parts-builder/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, material, quantity_needed: quantity }),
  });
}
