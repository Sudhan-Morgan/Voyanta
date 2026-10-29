import React, { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  Utensils,
  Car,
  Home,
  Compass,
  ShoppingBag,
  Tag,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';

const CATEGORY_META = {
  transport: { label: 'Transport', icon: Car, bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/20' },
  food: { label: 'Food & Dining', icon: Utensils, bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/20' },
  accommodation: { label: 'Stay', icon: Home, bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500/20' },
  activities: { label: 'Activities', icon: Compass, bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
  shopping: { label: 'Shopping', icon: ShoppingBag, bg: 'bg-pink-50', text: 'text-pink-600', ring: 'ring-pink-500/20' },
  other: { label: 'Other', icon: Tag, bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-500/20' },
};

export default function TripExpensesTab({ trip, members = [], onExpenseUpdated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    expenses: [],
    totalSpent: 0,
    remainingBudget: 0,
    categoryBreakdown: {},
    balances: {},
    settlements: []
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'food',
    amount: '',
    paidByUserId: '',
    selectedMemberIds: [],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getTripExpenses(trip._id);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?._id) {
      loadExpenses();
    }
  }, [trip?._id]);

  // Open modal with defaults
  const handleOpenModal = () => {
    const memberIds = members.map((m) => m.userId?._id || m.userId).filter(Boolean);
    setFormData({
      title: '',
      category: 'food',
      amount: '',
      paidByUserId: user?._id || memberIds[0] || '',
      selectedMemberIds: memberIds,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleToggleMemberSelect = (uid) => {
    setFormData((prev) => {
      const exists = prev.selectedMemberIds.includes(uid);
      const updated = exists
        ? prev.selectedMemberIds.filter((id) => id !== uid)
        : [...prev.selectedMemberIds, uid];
      return { ...prev, selectedMemberIds: updated };
    });
  };

  const handleSelectAllMembers = () => {
    const allIds = members.map((m) => m.userId?._id || m.userId).filter(Boolean);
    if (formData.selectedMemberIds.length === allIds.length) {
      setFormData((prev) => ({ ...prev, selectedMemberIds: [] }));
    } else {
      setFormData((prev) => ({ ...prev, selectedMemberIds: allIds }));
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter an expense title.');
      return;
    }
    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    if (formData.selectedMemberIds.length === 0) {
      setFormError('Please select at least one member to split this expense with.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const sharePerPerson = Math.round((numAmount / formData.selectedMemberIds.length) * 100) / 100;
      const splitBetween = formData.selectedMemberIds.map((uid) => ({
        userId: uid,
        shareAmount: sharePerPerson,
        hasPaid: uid.toString() === formData.paidByUserId.toString()
      }));

      const res = await expenseService.addExpense(trip._id, {
        title: formData.title.trim(),
        category: formData.category,
        amount: numAmount,
        currency: trip.currency || 'LKR',
        paidByUserId: formData.paidByUserId,
        splitBetween,
        date: formData.date,
        notes: formData.notes
      });

      if (res.success) {
        setModalOpen(false);
        loadExpenses();
        if (onExpenseUpdated) onExpenseUpdated();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await expenseService.deleteExpense(trip._id, expenseId);
      if (res.success) {
        loadExpenses();
        if (onExpenseUpdated) onExpenseUpdated();
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleToggleSettleShare = async (expenseId, targetUserId, newHasPaid) => {
    // Optimistic UI update so the user immediately sees the tick / paid status
    setData((prev) => {
      const updatedExpenses = (prev.expenses || []).map((exp) => {
        if (exp._id === expenseId) {
          const updatedSplit = (exp.splitBetween || []).map((s) => {
            const sUid = (s.userId?._id || s.userId)?.toString();
            if (sUid === targetUserId?.toString()) {
              return {
                ...s,
                hasPaid: typeof newHasPaid === 'boolean' ? newHasPaid : !s.hasPaid
              };
            }
            return s;
          });
          return { ...exp, splitBetween: updatedSplit };
        }
        return exp;
      });
      return { ...prev, expenses: updatedExpenses };
    });

    try {
      const res = await expenseService.settleShare(trip._id, expenseId, targetUserId, newHasPaid);
      if (res.success) {
        loadExpenses();
      }
    } catch (err) {
      console.error('Failed to toggle share payment status:', err);
      loadExpenses();
    }
  };

  const handleSettleUserDebt = async (fromUserId, toUserId) => {
    try {
      const res = await expenseService.settleUserDebt(trip._id, fromUserId, toUserId);
      if (res.success) {
        loadExpenses();
      }
    } catch (err) {
      console.error('Failed to settle debts:', err);
    }
  };

  // Filtered expenses
  const filteredExpenses = (data.expenses || []).filter((exp) => {
    const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const budgetProgress = trip.budget > 0 ? Math.min(100, Math.round((data.totalSpent / trip.budget) * 100)) : 0;
  const isOverBudget = trip.budget > 0 && data.totalSpent > trip.budget;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Stat Cards & Budget Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Budget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Total Budget
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {trip.currency} {(trip.budget || 0).toLocaleString()}
          </p>
          <span className="text-xs text-slate-400">Allocated for whole trip</span>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Total Spent
          </span>
          <p className="text-2xl font-black text-indigo-600 tracking-tight">
            {trip.currency} {data.totalSpent.toLocaleString()}
          </p>
          <span className="text-xs font-semibold text-slate-500">
            {budgetProgress}% of budget logged
          </span>
        </div>

        {/* Remaining Budget */}
        <div className={`p-6 rounded-3xl border shadow-xs space-y-2 ${
          isOverBudget ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200/80'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            {isOverBudget ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {isOverBudget ? 'Over Budget By' : 'Remaining Budget'}
          </span>
          <p className={`text-2xl font-black tracking-tight ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
            {trip.currency} {Math.abs(data.remainingBudget).toLocaleString()}
          </p>
          <span className="text-xs text-slate-400">
            {isOverBudget ? 'Exceeded initial budget' : 'Available for remaining days'}
          </span>
        </div>

        {/* Action Button Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-teal-500 p-6 rounded-3xl text-white shadow-md shadow-indigo-500/20 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base">Expense Log</h4>
            <p className="text-xs text-indigo-100 mt-1">
              Add meals, transit, stay, or tours and split with companions.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="mt-4 w-full py-2.5 px-4 bg-white text-indigo-900 rounded-xl font-bold text-xs shadow-sm hover:bg-indigo-50 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Budget Progress Bar */}
      {trip.budget > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Budget Consumption</span>
            <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-900'}>
              {trip.currency} {data.totalSpent.toLocaleString()} / {trip.currency} {trip.budget.toLocaleString()} ({budgetProgress}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : budgetProgress > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetProgress)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Grid: Category Breakdown + Debt Settlement Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
              const Icon = meta.icon;
              const catTotal = data.categoryBreakdown?.[catKey] || 0;
              const catPercent = data.totalSpent > 0 ? Math.round((catTotal / data.totalSpent) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className={`p-1 rounded-md ${meta.bg} ${meta.text}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      {meta.label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {catTotal.toLocaleString()} ({catPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-indigo-500 rounded-full transition-all`}
                      style={{ width: `${catPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simplified Debt Settlements & Balances (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Group Bill Splitter & Settlements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated balances to settle shared expenses with minimum transactions
              </p>
            </div>
          </div>

          {/* Settlement Suggestions / Waiting Payments */}
          {data.settlements && data.settlements.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Waiting Payments ({data.settlements.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Click 'Settle' once payment received
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.settlements.map((s, idx) => {
                  const debtor = members.find((m) => (m.userId?._id || m.userId)?.toString() === s.fromUserId?.toString());
                  const creditor = members.find((m) => (m.userId?._id || m.userId)?.toString() === s.toUserId?.toString());

                  const debtorName = debtor?.userId?.name || 'Traveler';
                  const creditorName = creditor?.userId?.name || 'Traveler';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">{debtorName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-indigo-700 truncate">{creditorName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Waiting for payment</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-white text-xs font-black text-slate-900 shadow-xs border border-amber-100">
                          {trip.currency} {s.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleSettleUserDebt(s.fromUserId, s.toUserId)}
                          title="Mark payment received & remove waiting payment"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all hover:scale-105 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Settle</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-emerald-900">
                🎉 All group expenses are currently balanced and settled!
              </p>
              <p className="text-[11px] text-emerald-700">
                No members are currently waiting for payment.
              </p>
            </div>
          )}

          {/* Member Net Balances */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Member Net Balances
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {members.map((member) => {
                const uid = (member.userId?._id || member.userId)?.toString();
                const net = data.balances?.[uid] || 0;
                const isPositive = net > 0.5;
                const isNegative = net < -0.5;

                return (
                  <div
                    key={member._id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={member.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={member.userId?.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {member.userId?.name || member.invitedEmail || 'Traveler'}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {isPositive ? `+${trip.currency} ${Math.round(net).toLocaleString()}` : isNegative ? `-${trip.currency} ${Math.round(Math.abs(net)).toLocaleString()}` : 'Settled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Log & Activity List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recorded Expenses</h3>
            <p className="text-xs text-slate-400">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} listed
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Box */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            />

            {/* Filter Pills */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_META).map(([k, meta]) => (
                <option key={k} value={k}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-12 text-center max-w-sm mx-auto space-y-3">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400">
              Start tracking transport tickets, hotel payments, or restaurant bills.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Record First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => {
              const meta = CATEGORY_META[exp.category] || CATEGORY_META.other;
              const Icon = meta.icon;
              const payerName = exp.paidByUserId?.name || 'Traveler';

              return (
                <div
                  key={exp._id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{exp.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Paid by <strong className="text-slate-800">{payerName}</strong></span>
                        <span>•</span>
                        <span>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {exp.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs">{exp.notes}</span>
                          </>
                        )}
                      </div>

                      {/* Split member pills */}
                      {exp.splitBetween && exp.splitBetween.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Split ({exp.splitBetween.length}):
                          </span>
                          {exp.splitBetween.map((share, idx) => {
                            const shareUser = share.userId?.name || 'Member';
                            const targetUid = (share.userId?._id || share.userId)?.toString();
                            const isPayer = targetUid === (exp.paidByUserId?._id || exp.paidByUserId)?.toString();

                            return (
                              <div
                                key={idx}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs transition-all ${
                                  share.hasPaid
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {share.hasPaid ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                )}

                                <span>
                                  {shareUser}: {trip.currency} {(share.shareAmount || 0).toLocaleString()}
                                </span>

                                {share.hasPaid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                    ✓ Paid
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleSettleShare(exp._id, targetUid, true)}
                                    title="Click to mark as paid & remove waiting payment"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer ml-1"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Mark Paid</span>
                                  </button>
                                )}

                                {share.hasPaid && !isPayer && (
                                  <button
                                    onClick={() => handleToggleSettleShare(exp._id, targetUid, false)}
                                    title="Undo paid status"
                                    className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-emerald-100/60 rounded-md transition-colors cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount and delete action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className="text-base font-black text-slate-900">
                      {trip.currency} {(exp.amount || 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      title="Delete expense"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Add Trip Expense
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ella Train Tickets, Seafood Dinner, Villa Booking..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Amount ({trip.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium cursor-pointer"
                  >
                    {Object.entries(CATEGORY_META).map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paid By & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Paid By
                  </label>
                  <select
                    value={formData.paidByUserId}
                    onChange={(e) => setFormData({ ...formData, paidByUserId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium cursor-pointer"
                  >
                    {members.map((m) => {
                      const uid = m.userId?._id || m.userId;
                      return (
                        <option key={m._id} value={uid}>
                          {m.userId?.name || m.invitedEmail || 'Traveler'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Split Between Members Checkboxes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Split With ({formData.selectedMemberIds.length} members)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllMembers}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    {formData.selectedMemberIds.length === members.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                  {members.map((m) => {
                    const uid = m.userId?._id || m.userId;
                    const isSelected = formData.selectedMemberIds.includes(uid);

                    return (
                      <label
                        key={m._id}
                        onClick={() => handleToggleMemberSelect(uid)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="truncate">{m.userId?.name || 'Traveler'}</span>
                      </label>
                    );
                  })}
                </div>

                {Number(formData.amount) > 0 && formData.selectedMemberIds.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Each person pays: <strong className="text-indigo-600">{trip.currency} {Math.round((Number(formData.amount) / formData.selectedMemberIds.length) * 100) / 100}</strong>
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Receipt saved with Alex, paid via credit card..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
