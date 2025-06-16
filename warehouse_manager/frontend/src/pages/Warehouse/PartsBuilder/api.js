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
  const token = localStorage.getItem('access');
  return fetch(`/api/parts-builder/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function patchRecipeItem(id, quantity) {
  const token = localStorage.getItem('access');
  return fetch(`/api/parts-builder/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity_needed: quantity }),
  });
}

export async function postRecipeItem(product, material, quantity) {
  const token = localStorage.getItem('access');
  return fetch('/api/parts-builder/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product, material, quantity_needed: quantity }),
  });
}

export async function fetchComponents() {
  const res = await fetch('/api/components/?r=Komponent');
  if (!res.ok) return [];
  return await res.json();
}
