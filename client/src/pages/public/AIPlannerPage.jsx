import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
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

  // Form states
  const [destination, setDestination] = useState('Ella');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState('moderate');
  const [travelStyle, setTravelStyle] = useState('Romantic Couple');
  const [travelersCount, setTravelersCount] = useState(2);
  const [specialInterests, setSpecialInterests] = useState('');

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
        budget,
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
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (res.success && res.trip) {
        setSaveSuccessMessage('Itinerary saved! Redirecting to your trip details...');
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
            Design Your Perfect Sri Lanka Trip{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
              in Seconds
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Pick your destination, pace, and travel style. Our intelligent planner generates a realistic, balanced day-by-day plan packed with authentic local experiences.
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

            {/* Destination & Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Destination Input */}
              <div className="md:col-span-2">
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
                    placeholder="e.g. Ella, Kandy, Galle Fort, Sigiriya..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Duration (Days) *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-500" />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Budget Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Budget Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                    💰 {itinerary.estimatedTotalCost} Estimated
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
                      Day {day.dayNumber}
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
                                        : `LKR ${act.estimatedCost.toLocaleString()}`
                                      : act.estimatedCost}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

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
