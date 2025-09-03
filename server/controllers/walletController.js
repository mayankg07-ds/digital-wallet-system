const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/user');
const { checkFraudPatterns } = require('../utils/fraudDetection');

// Deposit funds
exports.deposit = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const { amount } = req.body;
    const userId = req.user._id;
    if (amount <= 0) throw new Error('Amount must be positive');

    // Increment balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, session }
    );

    // Create transaction record
    const transaction = new Transaction({
      toUserId: userId,
      amount,
      type: 'deposit',
      description: 'Wallet deposit'
    });
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Deposit successful', balance: wallet.balance });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Withdraw funds
exports.withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const { amount } = req.body;
    const userId = req.user._id;
    if (amount <= 0) throw new Error('Amount must be positive');

    const wallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: amount }, isLocked: false },
      { $inc: { balance: -amount } },
      { new: true, session }
    );
    if (!wallet) throw new Error('Insufficient balance or wallet locked');

    const transaction = new Transaction({
      fromUserId: userId,
      amount,
      type: 'withdrawal',
      description: 'Wallet withdrawal'
    });
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Withdrawal successful', balance: wallet.balance });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Transfer funds
exports.transfer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const { recipientEmail, amount } = req.body;
    const senderId = req.user._id;
    if (amount <= 0) throw new Error('Amount must be positive');

    const recipient = await User.findOne({ email: recipientEmail }).session(session);
    if (!recipient) throw new Error('Recipient not found');

    // Fraud check
    const fraudCheck = await checkFraudPatterns(senderId, amount);
    if (fraudCheck.isSuspicious) {
      const flagged = new Transaction({
        fromUserId: senderId,
        toUserId: recipient._id,
        amount,
        type: 'transfer',
        status: 'flagged',
        isFlagged: true,
        flagReason: fraudCheck.reason
      });
      await flagged.save({ session });
      await session.commitTransaction();
      return res.status(400).json({ message: 'Transaction flagged', reason: fraudCheck.reason });
    }

    const senderWallet = await Wallet.findOneAndUpdate(
      { userId: senderId, balance: { $gte: amount }, isLocked: false },
      { $inc: { balance: -amount } },
      { new: true, session }
    );
    if (!senderWallet) throw new Error('Insufficient balance or wallet locked');

    await Wallet.findOneAndUpdate(
      { userId: recipient._id },
      { $inc: { balance: amount } },
      { session }
    );

    const transaction = new Transaction({
      fromUserId: senderId,
      toUserId: recipient._id,
      amount,
      type: 'transfer',
      description: `Transfer to ${recipientEmail}`
    });
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Transfer successful', balance: senderWallet.balance });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
