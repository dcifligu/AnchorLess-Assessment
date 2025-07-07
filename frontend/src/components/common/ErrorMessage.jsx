import React from 'react';

export function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
      {message}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 right-0 px-2 py-1 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
}
