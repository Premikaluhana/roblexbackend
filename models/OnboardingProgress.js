const mongoose = require('mongoose');

const OnboardingProgressSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  followedSocials: {
    type: Boolean,
    default: false
  },
  filledProfile: {
    type: Boolean,
    default: false
  },
  visitedBlogPosts: {
    type: Number,
    default: 0
  },
  completedOfferwall: {
    type: Boolean,
    default: false
  },
  isOnboardingComplete: {
    type: Boolean,
    default: false
  }
});

OnboardingProgressSchema.pre('save', function(next) {
  if (this.followedSocials && this.filledProfile && 
      this.visitedBlogPosts >= 3 && this.completedOfferwall) {
    this.isOnboardingComplete = true;
  }
  next();
});

module.exports = mongoose.model('OnboardingProgress', OnboardingProgressSchema);