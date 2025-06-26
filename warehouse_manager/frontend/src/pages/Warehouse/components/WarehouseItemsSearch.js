import React, { useState } from 'react';

export default function WarehouseItemsSearch({ components, setFilteredComponents, searchFields }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setFilteredComponents(components);
      return;
    }

    const lower = value.toLowerCase();
    setFilteredComponents(
      components.filter((comp) =>
        searchFields.some((field) => (comp[field] || '').toString().toLowerCase().includes(lower))
      )
    );
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