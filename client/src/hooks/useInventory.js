import { useState, useEffect, useCallback } from 'react';

const DEFAULT_INVENTORY = [
  { id: 1, name: "M24 Sniper", type: "weapon", modelName: "m24", quantity: 1 },
  { id: 2, name: "Assault Rifle", type: "weapon", modelName: "m24", quantity: 1 },
  { id: 3, name: "Shotgun", type: "weapon", modelName: "shotgun", quantity: 1 },
  { id: 4, name: "Health Pack", type: "consumable", quantity: 3 }
];

const WEAPON_MAP = {
  m24: "/assets/models/m24.glb",
  shotgun: "/assets/models/shotgun.glb"
};

const useInventory = () => {
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('inventory');
      return saved ? JSON.parse(saved) : DEFAULT_INVENTORY;
    } catch {
      return DEFAULT_INVENTORY;
    }
  });

  const [equippedWeapon, setEquippedWeapon] = useState(() => {
    try {
      const saved = localStorage.getItem('equippedWeapon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleEquip = useCallback((weapon) => {
    const weaponData = {
      ...weapon,
      path: WEAPON_MAP[weapon.modelName] || ''
    };
    setEquippedWeapon(weaponData);
    localStorage.setItem('equippedWeapon', JSON.stringify(weaponData));
  }, []);

  const handleUnequip = useCallback(() => {
    setEquippedWeapon(null);
    localStorage.removeItem('equippedWeapon');
  }, []);

  const addItem = useCallback((item) => {
    setInventory((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setInventory((prev) => prev.filter(i => i.id !== itemId));
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  return {
    inventory,
    equippedWeapon,
    handleEquip,
    handleUnequip,
    addItem,
    removeItem,
    setInventory
  };
};

export default useInventory;
