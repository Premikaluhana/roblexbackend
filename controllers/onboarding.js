const OnboardingProgress = require('../models/OnboardingProgress');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getOnboardingStatus = async (req, res) => {
    try {
      let progress = await OnboardingProgress.findOne({ user: req.user.userId });
      
      if (!progress) {
        progress = new OnboardingProgress({ user: req.user.userId });
        await progress.save();
      }
      
      res.json(progress);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };

// controllers/onboarding.js
const followSocials = async (req, res) => {
  try {
    const { platform } = req.body;
    const userId = req.user.userId; // Assuming you're using auth middleware that sets req.user

    const progress = await OnboardingProgress.findOneAndUpdate(
      { user: userId },
      {$set:{followedSocials:platform}}, // Add platform to array
      { new: true, upsert: true }
    );

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const visitBlog = async (req, res) => {
  try {
    const progress = await OnboardingProgress.findOneAndUpdate(
      { user: req.user.userId },
      { $inc: { visitedBlogPosts: 1 } },
      { new: true, upsert: true }
    ); 
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const completeOfferwall = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // Retrieve the current onboarding progress
      const progress = await OnboardingProgress.findOne({ user: userId });
  
      if (!progress) {
        return res.status(404).json({ error: 'Onboarding progress not found' });
      }
  
      // Check if all onboarding steps are completed and blog posts visited
      const isOnboardingComplete = progress.followedSocials &&
                                   progress.filledProfile &&
                                   progress.visitedBlogPosts >= 3;
  
      // Update the user's Robux balance
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { robuxBalance: 10 } },
        { new: true }
      );
  
      // Update the onboarding progress
      const updatedProgress = await OnboardingProgress.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            completedOfferwall: true,
            isOnboardingComplete: isOnboardingComplete
          }
        },
        { new: true }
      );
  
      // Create a transaction record
      await Transaction.create({
        user: userId,
        amount: 10,
        type: 'earned',
        description: 'Completed offerwall task'
      });
  
      res.json({ user, progress: updatedProgress });
  
    } catch (err) {
      console.error('Error in completeOfferwall:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
  getOnboardingStatus,
  followSocials,
  visitBlog,
  completeOfferwall
};