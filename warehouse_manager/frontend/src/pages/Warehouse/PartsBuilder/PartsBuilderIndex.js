import React from 'react';
import { Link } from 'react-router-dom';

export default function PartsBuilderIndex() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-ocean-900">
        Wybierz moduł produkcji:
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kafelek 1: Parts Builder */}
        <Link
          to="/warehouse/parts-builder/parts"
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center hover:bg-ocean-50 transition group"
        >
          <svg
            className="w-12 h-12 text-ocean-600 mb-4 group-hover:scale-110 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-lg font-semibold text-ocean-900">Zbuduj moduł</span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            Przypisz półprodukty do modułów produkcyjnych
          </span>
        </Link>
        {/* Kafelek 2: Components Builder */}
        <Link
          to="/warehouse/parts-builder/components"
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center hover:bg-ocean-50 transition group"
        >
          <svg
            className="w-12 h-12 text-ocean-600 mb-4 group-hover:scale-110 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="text-lg font-semibold text-ocean-900">Zbuduj półprodukt</span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            Przypisz materiały do półproduktów
          </span>
        </Link>
      </div>
    </div>
  );
}
