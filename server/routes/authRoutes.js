const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

module.exports = router;

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password, level: 1, xp: 0 });
  await user.save();
  res.json(user);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json(user);
});

module.exports = router;
