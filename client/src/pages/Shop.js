// src/pages/Shop.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Shop = () => {
  const [items, setItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("weapons");
  const [previewItem, setPreviewItem] = useState(null);
  const equippedWeapon = localStorage.getItem("playerWeapon");

  useEffect(() => {
    axios.get("http://localhost:5000/api/inventory/all")
      .then(res => setItems(res.data));

    // Simulate fetching owned items (you could fetch this from backend)
    const owned = JSON.parse(localStorage.getItem("ownedItems") || "[]");
    setOwnedItems(owned);
  }, []);

  const purchase = async (item) => {
    try {
      await axios.post(
        "http://localhost:5000/api/purchase",
        { itemId: item._id },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );

      const updated = [...ownedItems, item._id];
      setOwnedItems(updated);
      localStorage.setItem("ownedItems", JSON.stringify(updated));
      alert("Item purchased!");
    } catch (err) {
      alert("Purchase failed.");
    }
  };

  const equipWeapon = (item) => {
    localStorage.setItem("playerWeapon", item.name);
    alert(`${item.name} equipped!`);
    window.location.reload(); // Optional: force reload to reflect new weapon in game
  };

  const filteredItems = items.filter(item =>
    activeTab === "weapons" ? item.type === "weapon" : item.type === "skin"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🛒 Game Shop</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("weapons")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "weapons"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          🔫 Weapons
        </button>
        <button
          onClick={() => setActiveTab("skins")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "skins"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          🧍 Character Skins
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredItems.map((item, i) => {
          const isOwned = ownedItems.includes(item._id);
          const isEquipped = equippedWeapon === item.name;

          return (
            <div
              key={i}
              className={`relative bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition p-4 flex flex-col items-center text-center border-2 ${
                isEquipped ? "border-green-500" : "border-transparent"
              }`}
            >
              <img
                src={`/assets/${item.icon}`}
                alt={item.name}
                className="h-24 object-contain mb-3 cursor-pointer"
                onClick={() => setPreviewItem(item)}
              />

              <h3 className="text-lg font-semibold mb-1">{item.name}</h3>

              {item.type === "weapon" && (
                <div className="text-sm text-gray-300 mb-2">
                  Damage: <span className="text-red-400">{item.damage}</span> <br />
                  Ammo: <span className="text-yellow-300">{item.ammo}</span>
                </div>
              )}

              <p className="text-yellow-400 font-bold mb-2">{item.price} coins</p>

              {!isOwned ? (
                <button
                  onClick={() => purchase(item)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
                >
                  Buy
                </button>
              ) : isEquipped ? (
                <div className="text-green-400 text-sm font-semibold mt-1">Equipped</div>
              ) : (
                <button
                  onClick={() => equipWeapon(item)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
                >
                  Equip
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">{previewItem.name}</h2>
            <img
              src={`/assets/${previewItem.icon}`}
              alt={previewItem.name}
              className="h-48 mx-auto mb-4"
            />
            {previewItem.type === "weapon" && (
              <div className="text-gray-300 mb-4">
                Damage: <strong>{previewItem.damage}</strong> <br />
                Ammo: <strong>{previewItem.ammo}</strong>
              </div>
            )}
            <button
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              onClick={() => setPreviewItem(null)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
