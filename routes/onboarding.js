const express = require('express');
const router = express.Router();
const { 
  getOnboardingStatus,
  followSocials,
  visitBlog,
  completeOfferwall
} = require('../controllers/onboarding');
const auth = require('../middleware/authMiddleware');

router.get('/status', auth, getOnboardingStatus);
router.put('/follow-socials', auth, followSocials);
router.post('/visit-blog', auth, visitBlog);
router.post('/complete-offerwall', auth, completeOfferwall);

module.exports = router;