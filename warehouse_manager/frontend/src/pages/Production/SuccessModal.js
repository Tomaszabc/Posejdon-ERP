import React from 'react';

export default function SuccessModal({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in-out">
        Zatwierdzono produkcję!
      </div>
    </div>
  );
}
