import React from 'react';

const Layout = ({ children, onBack, showBackButton = false }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {showBackButton && (
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button 
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Назад
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default Layout;