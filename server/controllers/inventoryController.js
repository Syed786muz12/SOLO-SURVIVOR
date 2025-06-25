const User = require('../models/User');
const Inventory = require('../models/Inventory');

exports.getUserInventory = async (req, res) => {
  const user = await User.findById(req.user.id).populate('inventory_ids');
  res.json(user.inventory_ids);
};
exports.getAllItems = async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
};
exports.getMatchHistory = async (req, res) => {
  const matches = await Match.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(matches);
};
