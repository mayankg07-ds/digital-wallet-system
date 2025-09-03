const Transaction = require('../models/Transaction');

const checkFraudPatterns = async (userId, amount) => {
  try {
    const now = new Date();
    const oneHour = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check multiple transfers in short period
    const recentTransfers = await Transaction.countDocuments({
      fromUserId: userId,
      type: 'transfer',
      createdAt: { $gte: oneHour }
    });

    if (recentTransfers >= 5) {
      return {
        isSuspicious: true,
        reason: 'Multiple transfers in short period (rate limit exceeded)'
      };
    }

    // Check for large withdrawal pattern
    if (amount > 1000) {
      const recentLargeTransactions = await Transaction.countDocuments({
        fromUserId: userId,
        amount: { $gte: 500 },
        type: { $in: ['withdrawal', 'transfer'] },
        createdAt: { $gte: oneDay }
      });

      if (recentLargeTransactions >= 2) {
        return {
          isSuspicious: true,
          reason: 'Sudden large transaction pattern detected'
        };
      }
    }

    // Check velocity pattern
    const dailyTotal = await Transaction.aggregate([
      {
        $match: {
          fromUserId: userId,
          type: { $in: ['withdrawal', 'transfer'] },
          createdAt: { $gte: oneDay }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const todayTotal = dailyTotal[0]?.totalAmount || 0;
    if (todayTotal + amount > 5000) {
      return {
        isSuspicious: true,
        reason: 'Daily transaction limit exceeded'
      };
    }

    return { isSuspicious: false };
  } catch (error) {
    console.error('Fraud detection error:', error);
    return { isSuspicious: false };
  }
};

module.exports = { checkFraudPatterns };
