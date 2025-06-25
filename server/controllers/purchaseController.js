const User = require('../models/User');
const Inventory = require('../models/Inventory');

exports.purchaseItem = async (req, res) => {
  const { itemId } = req.body;
  const user = await User.findById(req.user.id);

  const item = await Inventory.findById(itemId);
  if (!item) return res.status(404).send('Item not found');

  if (user.coins < item.price) return res.status(400).send('Not enough coins');

  user.coins -= item.price;
  user.inventory_ids.push(item._id);
  await user.save();

  res.json({ success: true, user });
};
