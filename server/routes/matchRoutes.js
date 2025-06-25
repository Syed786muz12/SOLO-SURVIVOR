const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

router.post('/create', async (req, res) => {
  const { player1, player2 } = req.body;
  const match = new Match({
    player1_id: player1,
    player2_id: player2,
    duration: 0,
    match_type: '1v1'
  });
  await match.save();
  res.json(match);
});

router.get('/:id', async (req, res) => {
  const match = await Match.findById(req.params.id);
  res.json(match);
});
router.post('/record', auth, matchController.recordMatch);

module.exports = router;
