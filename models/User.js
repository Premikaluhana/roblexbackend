const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  robloxId: { type: String, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  robuxBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);