// middleware/validateWithdrawal.js
const validateWithdrawal = (req, res, next) => {
    const { amount } = req.body;
    
    if (amount < 5) {
      return res.status(400).json({ error: 'Minimum withdrawal is 5 Robux' });
    }
    
    if (!req.user.progress.offerwallCompleted) {
      return res.status(403).json({ error: 'Complete onboarding first' });
    }
  
    next();
  };