import { model, Schema } from 'mongoose';

export default model('Match', matchSchema);

const matchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  opponent: String,
  result: String, // Win / Lose
  kills: Number,
  accuracy: Number,
  xpEarned: Number,
  date: { type: Date, default: Date.now }
});
