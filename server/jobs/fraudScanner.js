const cron = require('node-cron');
const Transaction = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/models/Transaction');
const Wallet = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/models/Wallet');
const User = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/models/User');

// Scan for suspicious patterns every hour
const scanSuspiciousPatterns = cron.schedule('0 * * * *', async () => {
  console.log('Running fraud pattern scan...');
  
  try {
    const oneHour = new Date(Date.now() - 60 * 60 * 1000);
    const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find users with multiple large transactions in last hour
    const suspiciousUsers = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: oneHour },
          amount: { $gte: 500 },
          type: { $in: ['withdrawal', 'transfer'] }
        }
      },
      {
        $group: {
          _id: '$fromUserId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $match: {
          $or: [
            { count: { $gte: 3 } },
            { totalAmount: { $gte: 2000 } }
          ]
        }
      }
    ]);

    // Lock wallets and flag transactions
    for (const user of suspiciousUsers) {
      await Wallet.findOneAndUpdate(
        { userId: user._id },
        { isLocked: true }
      );

      await Transaction.updateMany(
        {
          fromUserId: user._id,
          createdAt: { $gte: oneHour },
          isFlagged: false
        },
        {
          isFlagged: true,
          flagReason: 'Automated fraud detection - suspicious pattern'
        }
      );

      console.log(`Locked wallet for user: ${user._id}`);
    }

  } catch (error) {
    console.error('Fraud scan error:', error);
  }
});

// Daily cleanup and analysis
const dailyAnalysis = cron.schedule('0 2 * * *', async () => {
  console.log('Running daily fraud analysis...');
  
  try {
    const oneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find accounts with consistently high transaction volumes
    const highVolumeUsers = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeek },
          type: { $in: ['withdrawal', 'transfer'] }
        }
      },
      {
        $group: {
          _id: '$fromUserId',
          avgDaily: { $avg: '$amount' },
          totalVolume: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $match: {
          $or: [
            { totalVolume: { $gte: 10000 } },
            { transactionCount: { $gte: 50 } }
          ]
        }
      }
    ]);

    // Flag for admin review (don't auto-lock)
    for (const user of highVolumeUsers) {
      await Transaction.updateMany(
        {
          fromUserId: user._id,
          createdAt: { $gte: oneWeek },
          isFlagged: false
        },
        {
          isFlagged: true,
          flagReason: 'High volume pattern detected - admin review required'
        }
      );

      console.log(`Flagged high volume user: ${user._id}`);
    }

  } catch (error) {
    console.error('Daily analysis error:', error);
  }
});

module.exports = {
  scanSuspiciousPatterns,
  dailyAnalysis
};
