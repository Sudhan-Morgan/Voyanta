import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itineraryService } from '../../services/itineraryService';
import {
  Compass,
  Plus,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  X,
  Tag,
  AlertCircle
} from 'lucide-react';

const ACTIVITY_CATEGORIES = [
  'Sightseeing',
  'Food & Dining',
  'Hiking & Adventure',
  'Beach & Watersports',
  'Culture & Heritage',
  'Transport & Transit',
  'Relaxation & Leisure',
  'Shopping'
];

export default function TripItineraryTab({ trip, canEdit = true, onItineraryUpdated }) {
  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState({
    totalDays: 1,
    items: [],
    days: {}
  });
  const [activeDay, setActiveDay] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    dayNumber: 1,
    title: '',
    description: '',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    locationName: '',
    category: 'Sightseeing',
    estimatedCost: '',
    notes: ''
  });

  const loadItinerary = async () => {
    try {
      setLoading(true);
      const res = await itineraryService.getTripItinerary(trip._id);
      if (res.success && res.data) {
        setItineraryData(res.data);
      }
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?._id) {
      loadItinerary();
    }
  }, [trip?._id]);

  // Format date helper for days
  const getDayDateString = (dayIndex) => {
    if (!trip?.startDate) return null;
    const start = new Date(trip.startDate);
    const dayDate = new Date(start.getTime() + (dayIndex - 1) * 24 * 60 * 60 * 1000);
    return dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const handleOpenAddModal = (dayNum = activeDay) => {
    setEditingItem(null);
    setFormData({
      dayNumber: dayNum,
      title: '',
      description: '',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      locationName: trip.destination || '',
      category: 'Sightseeing',
      estimatedCost: '',
      notes: ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      dayNumber: item.dayNumber || 1,
      title: item.title || '',
      description: item.description || '',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      locationName: item.locationName || '',
      category: item.notes?.startsWith('Category: ') ? item.notes.replace('Category: ', '') : 'Sightseeing',
      estimatedCost: item.estimatedCost || '',
      notes: item.notes || ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter an activity title.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      dayNumber: Number(formData.dayNumber),
      title: formData.title.trim(),
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
      locationName: formData.locationName,
      estimatedCost: Number(formData.estimatedCost) || 0,
      notes: formData.category ? `Category: ${formData.category}` : formData.notes
    };

    try {
      if (editingItem) {
        await itineraryService.updateItineraryItem(trip._id, editingItem._id, payload);
      } else {
        await itineraryService.addItineraryItem(trip._id, payload);
      }

      setModalOpen(false);
      loadItinerary();
      if (onItineraryUpdated) onItineraryUpdated();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save itinerary activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this activity stop?')) return;
    try {
      await itineraryService.deleteItineraryItem(trip._id, itemId);
      loadItinerary();
      if (onItineraryUpdated) onItineraryUpdated();
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  const activeDayItems = itineraryData.days[activeDay] || [];
  const activeDayTotalCost = activeDayItems.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Day-by-Day Schedule
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {trip.title} Itinerary
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {itineraryData.items.length} planned activities across {itineraryData.totalDays} {itineraryData.totalDays === 1 ? 'day' : 'days'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/ai-planner?tripId=${trip._id}&destination=${encodeURIComponent(trip.destination || '')}&startDate=${trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : ''}&endDate=${trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : ''}&budget=${trip.budget || ''}&currency=${trip.currency || 'LKR'}&travelers=${trip.groupSize || 1}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Itinerary Assistant
          </Link>

          {canEdit && (
            <button
              onClick={() => handleOpenAddModal(activeDay)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          )}
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: itineraryData.totalDays || 1 }, (_, i) => i + 1).map((dayNum) => {
          const dateStr = getDayDateString(dayNum);
          const count = (itineraryData.days[dayNum] || []).length;
          const isActive = activeDay === dayNum;

          return (
            <button
              key={dayNum}
              onClick={() => setActiveDay(dayNum)}
              className={`p-3.5 rounded-2xl border text-left transition-all shrink-0 min-w-[130px] cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Day {dayNum}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count} stops
                </span>
              </div>
              {dateStr && (
                <p className={`text-xs font-semibold mt-1 truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {dateStr}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Day Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Day {activeDay} Overview
              </span>
              {getDayDateString(activeDay) && (
                <span className="text-xs text-slate-400">• {getDayDateString(activeDay)}</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Planned Stops & Sightseeing
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Estimated Day Budget:{' '}
              <strong className="text-slate-900">
                {trip.currency} {activeDayTotalCost.toLocaleString()}
              </strong>
            </span>
            {canEdit && (
              <button
                onClick={() => handleOpenAddModal(activeDay)}
                className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Stop
              </button>
            )}
          </div>
        </div>

        {/* Timeline Activities */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading day activities...
          </div>
        ) : activeDayItems.length === 0 ? (
          /* Empty Day State */
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No activities scheduled for Day {activeDay}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add iconic sightseeing landmarks, food spots, or scenic hikes to organize this day's schedule.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {canEdit && (
                <button
                  onClick={() => handleOpenAddModal(activeDay)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  + Add First Stop
                </button>
              )}
              <Link
                to="/ai-planner"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Use AI Generator
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-8">
            {activeDayItems.map((item, idx) => {
              const categoryMatch = item.notes?.startsWith('Category: ')
                ? item.notes.replace('Category: ', '')
                : null;

              return (
                <div key={item._id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm group-hover:scale-125 transition-transform"></div>

                  <div className="bg-slate-50/80 hover:bg-slate-100/70 p-5 rounded-2xl border border-slate-200/70 transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {(item.startTime || item.endTime) && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {item.startTime}
                              {item.endTime ? ` – ${item.endTime}` : ''}
                            </span>
                          </div>
                        )}
                        {categoryMatch && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                            {categoryMatch}
                          </span>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit activity"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete activity"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>

                    {item.locationName && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-medium">{item.locationName}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    )}

                    {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
                      <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Estimated Cost</span>
                        <span className="font-bold text-slate-800">
                          {trip.currency} {Number(item.estimatedCost).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT ACTIVITY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                {editingItem ? 'Edit Itinerary Stop' : 'Add Activity Stop'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Day Number Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Day of Trip *
                </label>
                <select
                  value={formData.dayNumber}
                  onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium cursor-pointer"
                >
                  {Array.from({ length: itineraryData.totalDays || 1 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Day {d} {getDayDateString(d) ? `(${getDayDateString(d)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Visit Sigiriya Rock Fortress, Sunrise Hike, Seafood Dinner..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Location / Attraction Name
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g. Galle Fort Lighthouse, Southern Province"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>

              {/* Times Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Category & Estimated Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium cursor-pointer"
                  >
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Estimated Cost ({trip.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description & Tips (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about what to explore, ticket counters, dress codes, or transport notes..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                ></textarea>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Actions */}
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
