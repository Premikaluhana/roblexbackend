const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Update user's Robux balance
const updateBalance = async (userId, amount) => {
  return User.findByIdAndUpdate(
    userId,
    { $inc: { robuxBalance: amount } },
    { new: true }
  );
};

// Add points through activities
const addPoints = async (req, res) => {
  try {
    const { amount, description } = req.body;

    // Validate input
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Update user's balance
    const updatedUser = await updateBalance(req.user.userId, amount);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a transaction record
    await Transaction.create({
      user: req.user.userId,
      amount,
      type: 'earned',
      description: description || 'Completed activity',
    });

    // Respond with success and updated balance
    res.json({
      success: true,
      balance: updatedUser.robuxBalance,
    });
  } catch (err) {
    console.error('Error adding points:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add points' });
  }
};

// Deduct points (for withdrawals)
const deductPoints = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);

    if (user.robuxBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const updatedUser = await updateBalance(req.user.userId, -amount);
    
    await Transaction.create({
      user: req.user.userId,
      amount: -amount,
      type: 'withdrawal',
      description: 'Withdrawal request'
    });

    res.json({ 
      success: true,
      balance: updatedUser.robuxBalance
    });
    
  } catch (err) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
};

// Get transaction history
const getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .sort('-createdAt')
      .limit(50);

    res.json(transactions);
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
};

// Leaderboard (fake/real)
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort('-robuxBalance')
      .limit(10)
      .select('username robuxBalance avatar');

    res.json(users);
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

module.exports = {
  addPoints,
  deductPoints,
  getHistory,
  getLeaderboard
};