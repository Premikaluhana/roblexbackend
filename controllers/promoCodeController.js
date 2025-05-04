const PromoCode = require('../models/PromoCode');
const User = require('../models/User');

const createPromoCode = async (req, res) => {
  try {
    const { code, robloxCoins, expirationDate, usageLimit } = req.body;
    const existingCode = await PromoCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    const promoCode = new PromoCode({
      code,
      robloxCoins,
      expirationDate,
      usageLimit
    });
    await promoCode.save();
    res.status(201).json({ message: 'Promo code created successfully', promoCode });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.json(promoCodes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const redeemPromoCode = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    const promoCode = await PromoCode.findOne({ code });
    if (!promoCode) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    if (promoCode.expirationDate < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    if (promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.robuxBalance += promoCode.robloxCoins;
    await user.save();

    promoCode.usedCount += 1;
    await promoCode.save();

    res.json({ message: 'Promo code redeemed successfully', robuxBalance: user.robuxBalance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createPromoCode,
  getPromoCodes,
  redeemPromoCode
};
