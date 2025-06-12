import React from 'react';
import { Link } from 'react-router-dom';

export default function WarehouseIndex() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-ocean-900">Magazyn</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kafelek 1 */}
        <Link
          to="/warehouse/components"
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center hover:bg-ocean-50 transition group"
        >
          <svg
            className="w-12 h-12 text-ocean-600 mb-4 group-hover:scale-110 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect
              x="3"
              y="7"
              width="18"
              height="13"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M16 3v4M8 3v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold text-ocean-900 text-center">
            Komponenty magazynowe
          </span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            Przeglądaj i zarządzaj komponentami
          </span>
        </Link>
        {/* Kafelek 2 */}
        <Link
          to="/warehouse/parts-builder"
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center hover:bg-ocean-50 transition group"
        >
          <svg
            className="w-12 h-12 text-ocean-600 mb-4 group-hover:scale-110 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold text-ocean-900">Parts Builder</span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            Przypisz komponenty do produktów
          </span>
        </Link>
        {/* Kafelek 3 */}
        <Link
          to="/warehouse/products"
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center hover:bg-ocean-50 transition group"
        >
          <svg
            className="w-12 h-12 text-ocean-600 mb-4 group-hover:scale-110 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 2v4M16 2v4M4 10h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold text-ocean-900">Surowce</span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            Lista surowców do budowy komponentów
          </span>
        </Link>
      </div>
    </div>
  );
}
