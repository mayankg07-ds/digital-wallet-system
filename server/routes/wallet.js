const express = require('express');
const { deposit, withdraw, transfer } = require('../controllers/walletController');
const auth = require('../middleware/auth');
const { transactionLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.use(auth); // All wallet routes require authentication

router.post('/deposit', transactionLimiter, deposit);
router.post('/withdraw', transactionLimiter, withdraw);
router.post('/transfer', transactionLimiter, transfer);

module.exports = router;
