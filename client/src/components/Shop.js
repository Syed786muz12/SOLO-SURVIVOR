// components/Shop.js
import React from "react";

const Shop = ({ items, onPurchase, onClose }) => {
  return (
    <div className="absolute bottom-20 right-72 z-20 bg-gray-900 bg-opacity-90 p-4 rounded-lg text-white w-64 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Shop</h3>
        <button onClick={onClose} className="text-red-400">✕</button>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-400">No items available.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="bg-gray-700 p-2 rounded">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-300">Cost: {item.cost}</div>
              <button
                onClick={() => onPurchase(item)}
                className="mt-1 w-full bg-blue-600 rounded px-2 py-1 text-sm"
              >
                Buy
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Shop;
