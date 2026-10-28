import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import TripRouteMap from '../../components/trips/TripRouteMap';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookmarkPlus,
  Share2,
  AlertCircle,
  Lightbulb,
  Backpack,
  Check,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { name: 'Ella', tag: 'Hill Country & Waterfalls' },
  { name: 'Galle Fort', tag: 'Colonial Heritage & Beach' },
  { name: 'Kandy', tag: 'Sacred Temples & Culture' },
  { name: 'Sigiriya', tag: 'Ancient Rock Fortress' },
  { name: 'Mirissa', tag: 'Whale Watching & Coast' },
  { name: 'Nuwara Eliya', tag: 'Tea Estates & Little England' },
  { name: 'Trincomalee', tag: 'Pristine East Coast' },
  { name: 'Colombo', tag: 'Urban Flavors & Nightlife' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', desc: 'Hostels, local eateries, public buses & scenic trains' },
  { id: 'moderate', label: 'Moderate', desc: 'Boutique hotels, mid-tier restaurants, private tuk-tuks' },
  { id: 'luxury', label: 'Luxury', desc: '5-star resorts, private AC chauffeur, curated dining' },
];

const TRAVEL_STYLES = [
  'Solo Explorer',
  'Romantic Couple',
  'Family Holiday',
  'Friends Getaway',
  'Adventure & Hiking',
  'Culture & History',
  'Beach & Relaxation',
  'Wildlife & Safari'
];

export default function AIPlannerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL query parameters (prefilled if coming from an existing trip or link)
  const tripIdParam = searchParams.get('tripId') || '';
  const destParam = searchParams.get('destination') || '';
  const startDateParam = searchParams.get('startDate') || '';
  const endDateParam = searchParams.get('endDate') || '';
  const budgetParam = searchParams.get('budget') || '';
  const currencyParam = searchParams.get('currency') || 'LKR';
  const travelersParam = searchParams.get('travelers') || '2';

  // Helper date generators
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getFutureStr = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // Form states
  const [destination, setDestination] = useState(destParam || 'Ella');
  const [startDate, setStartDate] = useState(startDateParam || getTomorrowStr());
  const [endDate, setEndDate] = useState(endDateParam || getFutureStr(4));
  const [duration, setDuration] = useState(3);
  const [customBudget, setCustomBudget] = useState(budgetParam || '');
  const [currency, setCurrency] = useState(currencyParam || 'LKR');
  const [budget, setBudget] = useState('moderate');
  const [travelStyle, setTravelStyle] = useState('Romantic Couple');
  const [travelersCount, setTravelersCount] = useState(Number(travelersParam) || 2);
  const [specialInterests, setSpecialInterests] = useState('');

  // Synchronize duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setDuration(Math.min(diffDays, 14));
      }
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (newStart && endDate) {
      const s = new Date(newStart);
      const end = new Date(endDate);
      if (end < s) {
        // Automatically adjust end date
        const autoEnd = new Date(s.getTime() + (duration - 1) * 24 * 60 * 60 * 1000);
        setEndDate(autoEnd.toISOString().split('T')[0]);
      }
    }
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    setEndDate(newEnd);
  };

  const handleDurationChange = (e) => {
    const newDur = Number(e.target.value);
    setDuration(newDur);
    if (startDate) {
      const s = new Date(startDate);
      const autoEnd = new Date(s.getTime() + (newDur - 1) * 24 * 60 * 60 * 1000);
      setEndDate(autoEnd.toISOString().split('T')[0]);
    }
  };

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [savingTrip, setSavingTrip] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // Interactive packing checklist items
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheckItem = (item) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError('Please specify a destination.');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccessMessage(null);

    try {
      const interestsArray = specialInterests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await aiService.generateItinerary({
        destination: destination.trim(),
        duration: Number(duration),
        startDate: startDate || null,
        endDate: endDate || null,
        budget,
        customBudget: customBudget ? Number(customBudget) : null,
        currency,
        travelStyle,
        travelersCount: Number(travelersCount),
        interests: interestsArray
      });

      if (res.success && res.data) {
        setItinerary(res.data);
        setActiveDayTab(1);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('itinerary-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setError(res.message || 'Could not generate itinerary. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to AI engine. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!itinerary) return;

    setSavingTrip(true);
    setSaveSuccessMessage(null);

    try {
      const res = await aiService.saveItineraryAsTrip({
        itinerary: itinerary,
        startDate: startDate || itinerary.startDate,
        endDate: endDate || itinerary.endDate,
        customBudget: customBudget ? Number(customBudget) : itinerary.customBudget,
        currency: currency || itinerary.currency,
        tripId: tripIdParam || null
      });

      if (res.success && res.trip) {
        setSaveSuccessMessage(
          tripIdParam
            ? 'Itinerary updated for your existing trip! Redirecting...'
            : 'Trip saved with your exact dates & budget! Redirecting...'
        );
        setTimeout(() => {
          navigate(`/trips/${res.trip._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setError('Could not save this itinerary to your account.');
    } finally {
      setSavingTrip(false);
    }
  };

  const handleCopyItinerary = () => {
    if (!itinerary) return;
    let markdown = `# ${itinerary.tripTitle}\n\n`;
    markdown += `**Destination:** ${itinerary.destination}\n`;
    markdown += `**Dates:** ${itinerary.startDate || startDate} to ${itinerary.endDate || endDate}\n`;
    markdown += `**Duration:** ${itinerary.durationDays} Days | **Estimated Cost:** ${itinerary.estimatedTotalCost}\n\n`;
    markdown += `### Overview\n${itinerary.summary}\n\n`;

    itinerary.days.forEach((day) => {
      markdown += `## Day ${day.dayNumber}: ${day.title}\n`;
      day.activities.forEach((act) => {
        markdown += `- **${act.startTime} - ${act.endTime}**: ${act.title} at *${act.locationName}* (${act.description})\n`;
      });
      markdown += '\n';
    });

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            Voyanta AI Itinerary Architect
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Design Your Perfect Trip{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
              Within Your Exact Budget & Dates
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Enter your destination, dates, and target budget. Our intelligent planner builds a realistic schedule that strictly respects your financial plan.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Interactive Configuration Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10 mb-12">
          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Quick Hotspot Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Popular Sri Lankan Destinations
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => setDestination(dest.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      destination.toLowerCase() === dest.name.toLowerCase()
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    📍 {dest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Destination or Region *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-500" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ella, Kandy, Galle Fort, Sigiriya, Tokyo, Paris..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Dates & Duration (Synchronized) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Travel Dates & Duration *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</span>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo-500" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</span>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo-500" />
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1">Duration</span>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo-500" />
                    <select
                      value={duration}
                      onChange={handleDurationChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 1 ? 'Day' : 'Days'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Budget & Currency */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target / Maximum Budget
                </label>
                <span className="text-[11px] text-teal-600 font-medium">
                  ✓ AI guarantees total activities won't exceed this amount
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Budget Amount Input */}
                <div className="sm:col-span-2">
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-500" />
                    <input
                      type="number"
                      min="0"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="e.g. 15000 (leave blank for standard tier)"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="LKR">LKR (Rs. / Sri Lankan Rupee)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Budget Tier Pill Radios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {BUDGET_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setBudget(opt.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      budget === opt.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                      {budget === opt.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Style & Companions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Travel Vibe & Style
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-500" />
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    {TRAVEL_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Number of Travelers
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-500" />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Special Interests */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Special Interests or Notes (Optional)
              </label>
              <input
                type="text"
                value={specialInterests}
                onChange={(e) => setSpecialInterests(e.target.value)}
                placeholder="e.g. Vegetarian food spots, photography viewpoints, surf lessons, early morning sunrise..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>


            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-500 hover:from-indigo-700 hover:to-teal-600 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating Itinerary with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-teal-200" />
                    <span>Generate AI Itinerary</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {itinerary && (
          <div id="itinerary-results" className="space-y-8 animate-in fade-in duration-500">
            {/* Success toast if trip saved */}
            {saveSuccessMessage && (
              <div className="flex items-center gap-3 p-4 bg-teal-50 text-teal-800 border border-teal-200 rounded-2xl shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="font-semibold text-sm">{saveSuccessMessage}</span>
              </div>
            )}

            {/* Itinerary Banner Card */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800">
              <div className="absolute inset-0">
                <img
                  src={itinerary.coverImage}
                  alt={itinerary.destination}
                  className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
              </div>

              <div className="relative p-6 sm:p-10 space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                    📍 {itinerary.destination}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
                    ⏱️ {itinerary.durationDays} Days Plan
                  </span>
                  {(itinerary.startDate || startDate) && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                      📅 {itinerary.startDate || startDate} to {itinerary.endDate || endDate}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                    💰 {itinerary.estimatedTotalCost} (Budget: {itinerary.currency || currency} {itinerary.customBudget ? Number(itinerary.customBudget).toLocaleString() : budget})
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                    🎒 {itinerary.travelStyle}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {itinerary.tripTitle}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                    {itinerary.summary}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveAsTrip}
                      disabled={savingTrip}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-60"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      {savingTrip ? 'Saving Trip...' : 'Save as My Trip'}
                    </button>
                    <button
                      onClick={handleCopyItinerary}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Share2 className="w-4 h-4" />}
                      {copied ? 'Copied Plan!' : 'Copy Plan'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById('itinerary-results')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Generated with Voyanta AI Intelligence
                  </button>
                </div>
              </div>
            </div>

            {/* Grid: Day-by-Day Timeline + Insights Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Timeline & Day Tabs */}
              <div className="lg:col-span-2 space-y-6">
                {/* Day Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {itinerary.days.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDayTab(day.dayNumber)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeDayTab === day.dayNumber
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Day {day.dayNumber} {day.date ? `(${day.date.split('-').slice(1).join('/')})` : ''}
                    </button>
                  ))}
                </div>

                {/* Active Day Content */}
                {(() => {
                  const day = itinerary.days.find((d) => d.dayNumber === activeDayTab) || itinerary.days[0];
                  if (!day) return null;

                  return (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Day {day.dayNumber} Focus
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                          {day.title}
                        </h3>
                        {day.theme && (
                          <p className="text-xs text-slate-500 mt-1 font-medium">Theme: {day.theme}</p>
                        )}
                      </div>

                      {/* Activities Timeline */}
                      <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-8">
                        {day.activities.map((act, index) => (
                          <div key={index} className="relative group">
                            {/* Timeline bullet dot */}
                            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm group-hover:scale-125 transition-transform"></div>

                            <div className="bg-slate-50/80 hover:bg-slate-100/70 p-5 rounded-2xl border border-slate-200/60 transition-colors">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{act.startTime} – {act.endTime}</span>
                                </div>
                                {act.category && (
                                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                    {act.category}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {act.title}
                              </h4>

                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-2.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="font-medium">{act.locationName}</span>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {act.description}
                              </p>

                              {act.estimatedCost !== undefined && (
                                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs">
                                  <span className="text-slate-500">Estimated Expense</span>
                                  <span className="font-bold text-slate-900">
                                    {typeof act.estimatedCost === 'number'
                                      ? act.estimatedCost === 0
                                        ? 'Free Entry'
                                        : `${itinerary.currency || currency || 'LKR'} ${act.estimatedCost.toLocaleString()}`
                                      : act.estimatedCost}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Route Map for this Day */}
                      {day.activities && day.activities.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-600" /> Day {day.dayNumber} Route Map
                          </h4>
                          {(() => {
                            const actStops = day.activities
                              .map((a) => a.locationName || a.title)
                              .filter(Boolean);
                            const originPlace = actStops[0] || itinerary.destination;
                            const destPlace = actStops.length > 1 ? actStops[actStops.length - 1] : itinerary.destination;
                            const midStops = actStops.length > 2 ? actStops.slice(1, -1) : [];

                            return (
                              <TripRouteMap
                                key={`ai-day-${day.dayNumber}-${actStops.join('-')}`}
                                tripTitle={`Day ${day.dayNumber} Route: ${day.title}`}
                                initialOrigin={originPlace}
                                initialDestination={destPlace}
                                initialWaypoints={midStops}
                                height="420px"
                                canEdit={false}
                              />
                            );
                          })()}
                        </div>
                      )}

                      {/* Day navigation footer */}
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        {activeDayTab > 1 ? (
                          <button
                            onClick={() => setActiveDayTab(activeDayTab - 1)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            ← Previous Day
                          </button>
                        ) : <div />}
                        {activeDayTab < itinerary.days.length && (
                          <button
                            onClick={() => setActiveDayTab(activeDayTab + 1)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                          >
                            Next Day →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Col: Highlights, Tips & Interactive Checklist */}
              <div className="space-y-6">
                {/* Highlights Card */}
                {itinerary.highlights?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Trip Highlights
                    </h3>
                    <ul className="space-y-2">
                      {itinerary.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Smart Packing Checklist */}
                {itinerary.packingChecklist?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                      <Backpack className="w-4 h-4 text-indigo-600" />
                      Smart Packing List
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Tailored essentials for {itinerary.destination}:
                    </p>
                    <div className="space-y-2">
                      {itinerary.packingChecklist.map((item, idx) => (
                        <label
                          key={idx}
                          onClick={() => toggleCheckItem(item)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item]}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className={checkedItems[item] ? 'line-through text-slate-400' : ''}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Tips Card */}
                {itinerary.localTips?.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50/70 to-teal-50/70 rounded-3xl p-6 border border-indigo-100 shadow-xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Insider Local Tips
                    </h3>
                    <ul className="space-y-3">
                      {itinerary.localTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                          <span className="font-bold text-indigo-600 shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
