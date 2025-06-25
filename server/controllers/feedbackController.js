const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  const feedback = new Feedback({
    userId: req.user.id,
    message: req.body.message,
    type: req.body.type,
  });

  await feedback.save();
  res.json({ success: true });
};
