const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

router.get('/user', auth, inventoryController.getUserInventory);
router.get('/all', inventoryController.getAllItems);

module.exports = router;
