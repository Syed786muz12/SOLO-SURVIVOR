import React from "react";

const RightPanel = () => (
  <div className="absolute right-4 top-1/4 flex flex-col space-y-4">
    <button className="bg-blue-500 text-white px-4 py-2 rounded shadow">Events</button>
    <button className="bg-green-500 text-white px-4 py-2 rounded shadow">Offers</button>
  </div>
);

export default RightPanel;
