const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const { simulateRobuxTransfer } = require('../utils/robloxService');
const OnboardingProgress = require('../models/OnboardingProgress');

const createWithdrawal = async (req, res) => {
  try {
    console.log('Withdrawal request received:', req.body);
    console.log('User from token:', req.user);

    const { gameId, amount } = req.body;

    // Validate request body
    if (!gameId || !amount) {
      console.log('Missing required fields:', { gameId, amount });
      return res.status(400).json({ error: 'Missing required fields: gameId and amount' });
    }

    // Validate amount is a number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      console.log('Invalid amount format:', amount);
      return res.status(400).json({ error: 'Amount must be a number' });
    }

    // Find user and validate
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Check onboarding progress
    const progress = await OnboardingProgress.findOne({ user: req.user.userId });
    if (!progress?.isOnboardingComplete) {
      console.log('Onboarding not complete for user:', req.user.userId);
      return res.status(403).json({ error: 'Complete onboarding first' });
    }
    
    // Validate minimum amount
    if (numericAmount < 5) {
      console.log('Amount below minimum:', numericAmount);
      return res.status(400).json({ error: 'Minimum withdrawal is 5 Robux' });
    }

    // Check balance
    if (user.robuxBalance < numericAmount) {
      console.log('Insufficient balance:', { balance: user.robuxBalance, requested: numericAmount });
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      user: user._id,
      gameId,
      amount: numericAmount,
      status: 'pending',
      createdAt: new Date()
    });

    // Deduct balance immediately
    user.robuxBalance -= numericAmount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      user: user._id,
      amount: -numericAmount,
      type: 'withdrawal',
      description: `Withdrawal request to game ${gameId} (Pending)`
    });

    console.log('Withdrawal created successfully:', withdrawal._id);

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawal._id,
      balance: user.robuxBalance
    });

  } catch (err) {
    console.error('Withdrawal error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Withdrawal request failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

const getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.userId })
      .sort('-createdAt')
      .populate('user', 'username avatar');

    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get withdrawal history' });
  }
};

// Admin functions
const getAllPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .sort('-createdAt')
      .populate('user', 'username avatar');
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get pending withdrawals' });
  }
};

const processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId, action, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal is not in pending state' });
    }

    const user = await User.findById(withdrawal.user);

    if (action === 'approve') {
      // Process the withdrawal
      const transferResult = await simulateRobuxTransfer(withdrawal.gameId, withdrawal.amount);
      
      withdrawal.status = transferResult.success ? 'completed' : 'failed';
      withdrawal.transactionId = transferResult.transactionId;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = req.adminId;
      withdrawal.adminNotes = adminNotes;
      
      await withdrawal.save();

      // Update transaction description
      await Transaction.findOneAndUpdate(
        { user: withdrawal.user, type: 'withdrawal', amount: -withdrawal.amount },
        { description: `Withdrawal to game ${withdrawal.gameId} (${withdrawal.status})` }
      );

      res.json({
        success: true,
        message: `Withdrawal ${withdrawal.status}`,
        withdrawal
      });
    } else if (action === 'reject') {
      // Return the balance to the user
      user.robuxBalance += withdrawal.amount;
      await user.save();

      withdrawal.status = 'failed';
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = req.adminId;
      withdrawal.adminNotes = adminNotes;
      await withdrawal.save();

      // Update transaction description
      await Transaction.findOneAndUpdate(
        { user: withdrawal.user, type: 'withdrawal', amount: -withdrawal.amount },
        { description: `Withdrawal rejected - ${adminNotes}` }
      );

      res.json({
        success: true,
        message: 'Withdrawal rejected',
        withdrawal
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
};

module.exports = {
  createWithdrawal,
  getWithdrawalHistory,
  getAllPendingWithdrawals,
  processWithdrawal
};