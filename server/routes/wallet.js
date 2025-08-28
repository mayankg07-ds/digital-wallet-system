const express = require('express');
const { deposit, withdraw, transfer } = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/controllers/walletController.js');
const auth = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/middleware/auth.js');
const { transactionLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.use(auth); // All wallet routes require authentication

router.post('/deposit', transactionLimiter, deposit);
router.post('/withdraw', transactionLimiter, withdraw);
router.post('/transfer', transactionLimiter, transfer);

module.exports = router;
