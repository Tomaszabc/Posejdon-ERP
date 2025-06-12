import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductionIndex() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Produkcja</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="cursor-pointer rounded-lg shadow-lg p-8 bg-white hover:bg-ocean-50 transition"
          onClick={() => navigate('/production/production')}
        >
          <h2 className="text-xl font-semibold mb-2">Produkcja wyrobów</h2>
          <p className="text-gray-600">Przejdź do produkcji gotowych wyrobów.</p>
        </div>
        <div
          className="cursor-pointer rounded-lg shadow-lg p-8 bg-white hover:bg-ocean-50 transition"
          onClick={() => navigate('/production/component-production')}
        >
          <h2 className="text-xl font-semibold mb-2">Produkcja komponentów</h2>
          <p className="text-gray-600">Przejdź do produkcji komponentów.</p>
        </div>
      </div>
    </div>
  );
}