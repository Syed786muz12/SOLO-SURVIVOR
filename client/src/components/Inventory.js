// components/Inventory.js
import React from "react";

const Inventory = ({ 
  items, 
  equippedWeapon, 
  onEquip, 
  onUnequip, 
  onClose 
}) => {
  return (
    <div className="absolute bottom-20 right-4 z-20 bg-gray-900 bg-opacity-90 p-4 rounded-lg text-white w-64 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Inventory</h3>
        <button onClick={onClose} className="text-red-400">✕</button>
      </div>
      
      {equippedWeapon && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <div className="font-medium">Equipped: {equippedWeapon.name}</div>
          <button 
            onClick={onUnequip}
            className="mt-1 px-2 py-1 bg-red-600 rounded text-sm"
          >
            Unequip
          </button>
        </div>
      )}
      
      {items.length === 0 ? (
        <p className="text-gray-400">No items found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="bg-gray-700 p-2 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-300">Qty: {item.quantity}</div>
                </div>
                {item.type === 'weapon' && (
                  <button
                    onClick={() => onEquip(item)}
                    disabled={equippedWeapon?.id === item.id}
                    className={`px-2 py-1 rounded text-sm ${
                      equippedWeapon?.id === item.id 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {equippedWeapon?.id === item.id ? 'Equipped' : 'Equip'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inventory;