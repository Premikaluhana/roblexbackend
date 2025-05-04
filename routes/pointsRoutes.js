const router = require('express').Router();
const pointsController = require('../controllers/pointsController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all points routes
router.use(authMiddleware);

// Earning endpoints
router.post('/add', pointsController.addPoints);
router.post('/deduct', pointsController.deductPoints);
router.get('/history', pointsController.getHistory);
router.get('/leaderboard', pointsController.getLeaderboard);

module.exports = router;