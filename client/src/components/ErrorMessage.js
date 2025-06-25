import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center">
    <div className="text-red-500 text-xl mb-4">{message}</div>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition"
    >
      Retry
    </button>
  </div>
);

export default ErrorMessage;