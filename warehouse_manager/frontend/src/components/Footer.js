import React from "react";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400">
          &copy; 2025 E-Posejdon ERP &middot;
          <a
            href={`${backendUrl}/admin`}
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