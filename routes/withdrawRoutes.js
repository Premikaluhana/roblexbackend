const router = require('express').Router();
const withdrawalController = require('../controllers/withdrawController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// User routes
router.use(authMiddleware);
router.post('/create', withdrawalController.createWithdrawal);
router.get('/history', withdrawalController.getWithdrawalHistory);

// Admin routes
router.use('/admin', adminAuthMiddleware);
router.get('/admin/pending', withdrawalController.getAllPendingWithdrawals);
router.post('/admin/process', withdrawalController.processWithdrawal);

module.exports = router;