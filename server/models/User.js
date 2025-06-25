const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  level: Number,
  xp: Number,
  inventory: [String],
});

module.exports = mongoose.model('User', UserSchema);
