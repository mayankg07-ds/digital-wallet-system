const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/user');

// Get flagged transactions
exports.getFlaggedTransactions = async (req, res) => {
  const flagged = await Transaction.find({ isFlagged: true }).sort('-createdAt');
  res.json(flagged);
};

// Get total balances by currency
exports.getTotalBalances = async (req, res) => {
  const totals = await Wallet.aggregate([
    { $group: { _id: '$currency', totalBalance: { $sum: '$balance' } } }
  ]);
  res.json(totals);
};

// Get top users by balance or transaction volume
exports.getTopUsers = async (req, res) => {
  const topByBalance = await Wallet.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $sort: { balance: -1 } },
    { $limit: 10 },
    { $project: { 'user.username': 1, balance: 1 } }
  ]);

  const topByVolume = await Transaction.aggregate([
    { $group: { _id: '$fromUserId', volume: { $sum: '$amount' } } },
    { $sort: { volume: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $project: { 'user.username': 1, volume: 1 } }
  ]);

  res.json({ topByBalance, topByVolume });
};
