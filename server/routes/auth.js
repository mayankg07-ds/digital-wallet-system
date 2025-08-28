const express = require('express');
const { register, login } = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/controllers/authController.js');
const { authLimiter } = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/middleware/rateLimiter.js');
const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
