// src/components/common/LoadingScreen.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="loading-screen">
      <LoadingSpinner />
      <div className="loading-message">{message}</div>
    </div>
  );
}
