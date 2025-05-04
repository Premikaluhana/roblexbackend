const { getRobloxProfile } = require('../utils/robloxApi');
const User = require('../models/User');
const UserProfile = require('../models/userProfile');
const jwt = require('jsonwebtoken');
const OnboardingProgress = require('../models/OnboardingProgress');

const login = async (req, res) => {
  try {
    const { username } = req.body;
    const robloxUser = await getRobloxProfile(username);
    
    if (!robloxUser) {
      return res.status(404).json({ error: 'User not found on Roblox' });
    }

    res.json({
      username: robloxUser.username,
      avatar: robloxUser.avatar
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const confirmLogin = async (req, res) => {
  try {
    const { username } = req.body;
    const robloxUser = await getRobloxProfile(username);
    
    let user = await User.findOne({ robloxId: robloxUser.id });
    let isNew = false;
    if (!user) {
      user = new User({
        robloxId: robloxUser.id,
        username: robloxUser.username,
        avatar: robloxUser.avatar
      });
      isNew = true;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    if (isNew) {
      const onboardingProgress = new OnboardingProgress({
        user: user._id
      });
      await onboardingProgress.save();
    }

    res.json({ token, user,isNew });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.userId;

    const profile = await UserProfile.findOneAndUpdate(
      { user: userId },
      { email, phone },
      { new: true, upsert: true }
    );
    if (email && phone) {
      await OnboardingProgress.findOneAndUpdate(
        { user: userId },
        { $set: { filledProfile: true } }
      );
    }
    res.json({
      id: profile._id,
      email: profile.email,
      phone: profile.phone,
      updatedAt: profile.updatedAt,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.userId })
      .select('-__v -createdAt -_id');
    const user = await User.findById(req.user.userId);

    if (!profile) {
      return res.json({ message: 'No profile found' });
    }

    res.json({
      email: profile.email,
      phone: profile.phone,
      lastUpdated: profile.updatedAt,
      username: user.username,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  login,
  confirmLogin,
  updateUserProfile,
  getUserProfile,
  getCurrentUser
};