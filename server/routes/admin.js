const express = require('express');
const { getFlaggedTransactions, getTotalBalances, getTopUsers } = require('../controllers/adminController');
const auth = require('../middleware/auth');
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
