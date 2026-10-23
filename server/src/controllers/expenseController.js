const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');

// Helper to check trip access
const checkTripAccess = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };

  const isOwner = trip.ownerId.toString() === userId.toString();
  const membership = await TripMember.findOne({
    tripId,
    userId,
    invitationStatus: 'accepted'
  });

  if (!isOwner && !membership && !trip.isPublic) {
    return { error: 'Not authorized to access this trip', status: 403 };
  }

  return { trip, isOwner, membership };
};

// Helper to calculate simplified debt settlements
const calculateSettlements = (expenses, members) => {
  // net balance per user: positive = owed money, negative = owes money
  const balances = {};

  members.forEach((m) => {
    const uid = m.userId?._id?.toString() || m._id?.toString();
    balances[uid] = 0;
  });

  expenses.forEach((exp) => {
    const payerId = exp.paidByUserId?._id?.toString() || exp.paidByUserId?.toString();
    const amount = Number(exp.amount) || 0;

    if (balances[payerId] === undefined) balances[payerId] = 0;
    balances[payerId] += amount;

    if (Array.isArray(exp.splitBetween) && exp.splitBetween.length > 0) {
      exp.splitBetween.forEach((share) => {
        const shareUid = share.userId?._id?.toString() || share.userId?.toString();
        if (shareUid) {
          if (balances[shareUid] === undefined) balances[shareUid] = 0;
          balances[shareUid] -= Number(share.shareAmount) || 0;
        }
      });
    }
  });

  // Calculate settlement transactions
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([uid, net]) => {
    // Round to 2 decimal places to avoid float issues
    const rounded = Math.round(net * 100) / 100;
    if (rounded > 1) {
      creditors.push({ userId: uid, amount: rounded });
    } else if (rounded < -1) {
      debtors.push({ userId: uid, amount: -rounded });
    }
  });

  const settlements = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);
    if (settledAmount > 0.5) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: Math.round(settledAmount)
      });
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount <= 0.5) cIdx++;
    if (debtor.amount <= 0.5) dIdx++;
  }

  return { balances, settlements };
};

// @desc    Get all expenses for a trip with full breakdown & settlements
// @route   GET /api/trips/:tripId/expenses
// @access  Private
exports.getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const members = await TripMember.find({ tripId }).populate(
      'userId',
      'name email profileImage'
    );

    const expenses = await Expense.find({ tripId })
      .populate('paidByUserId', 'name email profileImage')
      .populate('splitBetween.userId', 'name email profileImage')
      .sort({ date: -1, createdAt: -1 });

    const totalSpent = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Category breakdown
    const categoryTotals = {
      transport: 0,
      food: 0,
      accommodation: 0,
      activities: 0,
      shopping: 0,
      other: 0
    };

    expenses.forEach((exp) => {
      const cat = exp.category || 'other';
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(exp.amount) || 0;
      } else {
        categoryTotals.other += Number(exp.amount) || 0;
      }
    });

    const { balances, settlements } = calculateSettlements(expenses, members);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        totalSpent,
        tripBudget: access.trip.budget || 0,
        remainingBudget: access.trip.budget ? access.trip.budget - totalSpent : 0,
        currency: access.trip.currency || 'LKR',
        categoryBreakdown: categoryTotals,
        balances,
        settlements
      }
    });
  } catch (error) {
    console.error('Get Trip Expenses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip expenses',
      error: error.message
    });
  }
};

// @desc    Add a new expense to a trip
// @route   POST /api/trips/:tripId/expenses
// @access  Private
exports.addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const {
      title,
      category,
      amount,
      currency,
      paidByUserId,
      splitBetween,
      date,
      notes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an expense title' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than 0' });
    }

    const payer = paidByUserId || req.user._id;

    // Process split between members
    let finalSplit = [];
    if (Array.isArray(splitBetween) && splitBetween.length > 0) {
      finalSplit = splitBetween.map((s) => ({
        userId: s.userId || s,
        shareAmount: Number(s.shareAmount) || Math.round(numericAmount / splitBetween.length),
        hasPaid: s.hasPaid !== undefined ? s.hasPaid : s.userId?.toString() === payer.toString()
      }));
    } else {
      // Default: 100% assigned to payer
      finalSplit = [
        {
          userId: payer,
          shareAmount: numericAmount,
          hasPaid: true
        }
      ];
    }

    const newExpense = await Expense.create({
      tripId,
      paidByUserId: payer,
      title: title.trim(),
      category: category || 'other',
      amount: numericAmount,
      currency: currency || access.trip.currency || 'LKR',
      splitBetween: finalSplit,
      date: date ? new Date(date) : new Date(),
      notes: notes || ''
    });

    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('paidByUserId', 'name email profileImage')
      .populate('splitBetween.userId', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('Add Expense Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record expense',
      error: error.message
    });
  }
};

// @desc    Update an existing expense
// @route   PUT /api/trips/:tripId/expenses/:expenseId
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const expense = await Expense.findOne({ _id: expenseId, tripId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const {
      title,
      category,
      amount,
      currency,
      paidByUserId,
      splitBetween,
      date,
      notes
    } = req.body;

    if (title) expense.title = title.trim();
    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (currency) expense.currency = currency;
    if (paidByUserId) expense.paidByUserId = paidByUserId;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    if (Array.isArray(splitBetween) && splitBetween.length > 0) {
      expense.splitBetween = splitBetween;
    }

    await expense.save();

    const updated = await Expense.findById(expense._id)
      .populate('paidByUserId', 'name email profileImage')
      .populate('splitBetween.userId', 'name email profileImage');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update Expense Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/trips/:tripId/expenses/:expenseId
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const expense = await Expense.findOneAndDelete({ _id: expenseId, tripId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

// @desc    Toggle hasPaid status for a specific user share
// @route   PATCH /api/trips/:tripId/expenses/:expenseId/settle
// @access  Private
exports.settleExpenseShare = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const { userId } = req.body;

    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const expense = await Expense.findOne({ _id: expenseId, tripId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const targetUserId = userId || req.user._id.toString();
    const shareIndex = expense.splitBetween.findIndex(
      (s) => s.userId.toString() === targetUserId.toString()
    );

    if (shareIndex === -1) {
      return res.status(400).json({ success: false, message: 'User share not found in this expense' });
    }

    // Toggle hasPaid status
    expense.splitBetween[shareIndex].hasPaid = !expense.splitBetween[shareIndex].hasPaid;
    await expense.save();

    const updated = await Expense.findById(expense._id)
      .populate('paidByUserId', 'name email profileImage')
      .populate('splitBetween.userId', 'name email profileImage');

    res.status(200).json({
      success: true,
      message: `Share payment status updated to ${expense.splitBetween[shareIndex].hasPaid ? 'Paid' : 'Unpaid'}`,
      data: updated
    });
  } catch (error) {
    console.error('Settle Share Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to settle share',
      error: error.message
    });
  }
};
