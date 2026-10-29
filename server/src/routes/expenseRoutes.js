const express = require('express');
const router = express.Router({ mergeParams: true });
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(expenseController.getTripExpenses)
  .post(expenseController.addExpense);

router.post('/settle-debt', expenseController.settleUserDebt);

router.route('/:expenseId')
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.patch('/:expenseId/settle', expenseController.settleExpenseShare);

module.exports = router;
