const router = require('express').Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.post('/create', adminController.createAdmin);

module.exports = router;
