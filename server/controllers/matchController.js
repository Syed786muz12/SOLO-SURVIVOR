exports.recordMatch = async (req, res) => {
  const { result, kills, accuracy, xpEarned } = req.body;
  const match = new Match({
    userId: req.user.id,
    result,
    kills,
    accuracy,
    xpEarned,
  });

  await match.save();

  const user = await User.findById(req.user.id);
  user.xp += xpEarned;
  await user.save();

  res.json({ success: true });
};

exports.getMatchHistory = async (req, res) => {
  const matches = await Match.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(matches);
};
