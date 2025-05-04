const router = require('express').Router();
const promoCodeController = require('../controllers/promoCodeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Protect promo code creation route with admin auth middleware
router.post('/', adminAuthMiddleware, promoCodeController.createPromoCode);
router.get('/', authMiddleware, promoCodeController.getPromoCodes);
router.post('/redeem', authMiddleware, promoCodeController.redeemPromoCode);

module.exports = router;
