// middleware/validateProfile.js
const { body } = require('express-validator');

const validateProfile = [
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number')
];

module.exports = validateProfile;