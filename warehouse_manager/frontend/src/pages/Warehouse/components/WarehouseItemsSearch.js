import React, { useState } from 'react';
import Fuse from 'fuse.js';

export default function WarehouseItemsSearch({ components, setFilteredComponents, searchFields, baseFilter }) {
  const [query, setQuery] = useState('');

  // Konfiguracja Fuse.js
  const fuse = new Fuse(
    baseFilter ? components.filter(baseFilter) : components,
    {
      keys: searchFields,
      threshold: 0.4, // im niższy, tym bardziej "dokładne" dopasowanie
    }
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    const filtered = baseFilter ? components.filter(baseFilter) : components;

    if (!value) {
      setFilteredComponents(filtered);
      return;
    }

    // Fuse.js wyszukiwanie
    const results = fuse.search(value).map(result => result.item);
    setFilteredComponents(results);
  };

  return (
    <div className="mb-4" style={{ maxWidth: 300 }}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Wyszukiwarka</label>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Szukaj po nazwie, SKU, producencie..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
      />
    </div>
  );
}
