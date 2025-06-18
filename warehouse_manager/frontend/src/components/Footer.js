import React from 'react';
import { API_URL } from '../config';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400">
          &copy; 2025 E-Posejdon Produkcja &middot;
          <a
            href={`${API_URL}/admin`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ocean-300 hover:text-white underline ml-1"
          >
            Panel administratora
          </a>
        </p>
      </div>
    </footer>
  );
}
