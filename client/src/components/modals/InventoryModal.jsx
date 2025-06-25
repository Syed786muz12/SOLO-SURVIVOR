import React from 'react';
import '../../styles/modals.css';

export default function InventoryModal({
  visible,
  items,
  equippedWeapon,
  onEquip,
  onUnequip,
  onClose
}) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content inventory-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Inventory</h2>

        <div className="inventory-grid">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`inventory-item ${equippedWeapon?.id === item.id ? 'equipped' : ''}`}
            >
              <img
                src={item.thumbnail || "/assets/weapon-placeholder.png"}
                alt={item.name}
                className="item-thumbnail"
              />
              <p>{item.name}</p>

              {equippedWeapon?.id === item.id ? (
                <button onClick={() => onUnequip(item)}>Unequip</button>
              ) : (
                <button onClick={() => onEquip(item)}>Equip</button>
              )}
            </div>
          ))}
        </div>

        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
