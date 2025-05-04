// routes/authRoutes.js
const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Fixed path
const validateProfile = require('../middleware/validationMiddleware');

router.post('/login', authController.login);
router.post('/confirm-login', authController.confirmLogin);
router.get('/me', authMiddleware, authController.getCurrentUser); 
router.get('/profile', authMiddleware, authController.getUserProfile);
router.put('/profile', authMiddleware,validateProfile, authController.updateUserProfile);
module.exports = router;