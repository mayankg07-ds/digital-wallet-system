const express = require('express');
const { getFlaggedTransactions, getTotalBalances, getTopUsers } = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/controllers/adminController.js');
const auth = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/middleware/auth.js');
const router = express.Router();

// Middleware to check admin
const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(auth, adminOnly);

router.get('/transactions/flagged', getFlaggedTransactions);
router.get('/balances/total', getTotalBalances);
router.get('/users/top', getTopUsers);

module.exports = router;
