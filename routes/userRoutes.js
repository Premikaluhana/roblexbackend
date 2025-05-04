// routes/userRoutes.js
router.post('/progress', authMiddleware, userController.updateProgress);
router.post('/offerwall/complete', authMiddleware, offerwallController.completeOfferwallTask);