import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import TripExpensesTab from '../../components/trips/TripExpensesTab';
import TripItineraryTab from '../../components/trips/TripItineraryTab';
import TripRouteMap from '../../components/trips/TripRouteMap';
import TripForumTab from '../../components/trips/TripForumTab';
import TripMembersTab from '../../components/trips/TripMembersTab';
import TripWeatherWidget from '../../components/trips/TripWeatherWidget';
import TripJournalTab from '../../components/trips/TripJournalTab';
import { itineraryService } from '../../services/itineraryService';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  ArrowLeft,
  Trash2,
  Edit3,
  Plus,
  Compass,
  CheckCircle2,
  Share2,
  Loader2,
  AlertCircle,
  Route,
  MessageSquare,
  UserPlus,
  BookOpen,
  CloudSun,
  Check,
  ChevronRight,
  ExternalLink,
  Backpack,
  Navigation,
  CreditCard,
  Camera,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [itineraryItems, setItineraryItems] = useState([]);
  const [selectedRouteDay, setSelectedRouteDay] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [packingChecklist, setPackingChecklist] = useState({
    passports: true,
    camera: false,
    cash: false,
    sunscreen: true,
    powerbank: false
  });

  const togglePackingItem = (key) => {
    setPackingChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShareTrip = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const calculateDurationDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(id);
      setTrip(data.trip);
      setMembers(data.members || []);
      setStats(data.stats || {});

      // Fetch itinerary items for route map
      try {
        const itinRes = await itineraryService.getTripItinerary(id);
        if (itinRes?.success && itinRes.data?.items) {
          setItineraryItems(itinRes.data.items);
        }
      } catch (itinErr) {
        console.warn('Itinerary items fetch error for map:', itinErr);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await tripService.updateTrip(id, { status: newStatus });
      setTrip(res.trip);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip permanently?')) {
      return;
    }
    try {
      await tripService.deleteTrip(id);
      navigate('/trips');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trip');
    }
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} — ${e}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your adventure...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || 'Trip not found'}</h2>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </Link>
      </div>
    );
  }

  const isOwner = trip.ownerId?._id === user?.id || trip.ownerId === user?.id;

  return (
    <div className="pb-20">
      {/* Toast Alert for Share Link */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Trip link copied to clipboard!</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative min-h-[360px] sm:h-[420px] w-full overflow-hidden bg-slate-950">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover opacity-60 scale-102 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />

        {/* Top Floating Nav */}
        <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-xs font-semibold text-white transition-all border border-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4" /> All Trips
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTrip}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold text-white transition-all border border-white/15 cursor-pointer"
              title="Share Trip Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteTrip}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Banner Details (Split Layout) */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Left Info */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {trip.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-indigo-300 font-bold bg-indigo-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-400/20">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {trip.destination}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-bold bg-emerald-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/20">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {calculateDurationDays(trip.startDate, trip.endDate)} Days Adventure
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {trip.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-2 drop-shadow-sm font-medium">
                <Calendar className="w-4 h-4 text-amber-400" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>

            {/* Right Metric Cluster */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Budget Badge */}
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                <span className="block text-[10px] uppercase font-bold text-slate-300">Planned Budget</span>
                <span className="text-base font-black text-white">
                  {trip.currency} {trip.budget?.toLocaleString()}
                </span>
              </div>

              {/* Companions Badge */}
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                <span className="block text-[10px] uppercase font-bold text-slate-300">Travel Crew</span>
                <span className="text-base font-black text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-300" />
                  {members.length} Traveler{members.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Status Change Selector */}
              {isOwner && (
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Status:</span>
                  <select
                    value={trip.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-slate-900/90 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer border border-white/20"
                  >
                    <option value="planning">Planning</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Trip Overview' },
            { id: 'itinerary', label: `Itinerary (${stats?.itineraryCount || itineraryItems.length || 0})` },
            { id: 'route-map', label: 'Route & Map' },
            { id: 'budget', label: 'Budget & Expenses' },
            { id: 'weather', label: 'Weather Forecast' },
            { id: 'journal', label: 'Travel Journal' },
            { id: 'forum', label: 'Discussion Forum' },
            { id: 'members', label: `Travel Crew (${members.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB (Executive 2-Column Left & Right Balanced Layout) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Main Trip Experience & Roadmap (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Quick Trip Vitals 4-Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Duration
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {calculateDurationDays(trip.startDate, trip.endDate)} Days
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Destination
                  </span>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm truncate">
                      {trip.destination.split(',')[0]}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Spent
                  </span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {trip.currency} {(stats?.totalSpent || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Planned Stops
                  </span>
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {itineraryItems.length} Activities
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Upcoming Stops & Itinerary Preview Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Route className="w-4 h-4 text-indigo-600" />
                      Trip Stops & Itinerary Highlights
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Activities planned for your days in {trip.destination}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('itinerary')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {itineraryItems.length > 0 ? (
                  <div className="space-y-3.5">
                    {itineraryItems.slice(0, 4).map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                                Day {item.dayNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {item.startTime || '09:00 AM'} - {item.endTime || '11:00 AM'}
                              </span>
                              {item.locationName && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                  {item.locationName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            {item.cost ? `${trip.currency} ${item.cost.toLocaleString()}` : 'Free Activity'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {itineraryItems.length > 4 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setActiveTab('itinerary')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          + View {itineraryItems.length - 4} more activities in Itinerary
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
                    <Compass className="w-10 h-10 text-indigo-400 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">No itinerary activities added yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Generate a full customized day-by-day plan with AI or add your favorite stops.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Link
                        to={`/ai-planner?destination=${encodeURIComponent(trip.destination)}&tripId=${trip._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate with AI
                      </Link>
                      <button
                        onClick={() => setActiveTab('itinerary')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Activity Manually
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Live Route Map Snapshot */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-indigo-600" />
                      Live Route & Destinations Map
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visual path and road directions connecting your stops
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('route-map')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Map Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200/80">
                  {(() => {
                    const stops = itineraryItems
                      .map((item) => item.locationName || item.title)
                      .filter(Boolean);

                    const startPlace = stops[0] || 'Colombo';
                    const endPlace = stops.length > 1 ? stops[stops.length - 1] : trip.destination || 'Galle';
                    const middleStops = stops.length > 2 ? stops.slice(1, -1) : [];

                    return (
                      <TripRouteMap
                        tripTitle={`${trip.title} — Overview Route`}
                        initialOrigin={startPlace}
                        initialDestination={endPlace}
                        initialWaypoints={middleStops}
                        height="360px"
                        canEdit={false}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* 4. AI Travel Assistant Command Banner */}
              <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-7 overflow-hidden shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" /> Voyanta AI Intelligence
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    Generate Smart Itinerary with AI
                  </h3>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Instantly craft customized day-by-day sightseeing, authentic local food stops, and scenic routes for {trip.destination}.
                  </p>
                </div>

                <Link
                  to={`/ai-planner?destination=${encodeURIComponent(trip.destination)}&tripId=${trip._id}&startDate=${trip.startDate ? trip.startDate.split('T')[0] : ''}&endDate=${trip.endDate ? trip.endDate.split('T')[0] : ''}&budget=${trip.budget || ''}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 text-xs font-extrabold shadow-md hover:bg-indigo-50 transition-all hover:scale-105 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Launch AI Planner
                </Link>
              </div>

              {/* 5. Trip Highlights & Interests */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Trip Interests & Focus Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.interests && trip.interests.length > 0 ? (
                    trip.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold"
                      >
                        ✨ {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No specific interests tags configured for this trip.</p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Smart Companion Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* 1. Destination Weather Forecast Spotlight */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    Weather Forecast
                  </h3>
                  <button
                    onClick={() => setActiveTab('weather')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Detailed &rarr;
                  </button>
                </div>
                <TripWeatherWidget
                  tripId={trip._id}
                  destination={trip.destination}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                />
              </div>

              {/* 2. Budget Health & Group Expenses Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Budget & Expenses Health
                  </h3>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Split Bills &rarr;
                  </button>
                </div>

                {/* Progress Bar */}
                {(() => {
                  const spent = stats?.totalSpent || 0;
                  const total = trip.budget || 1;
                  const percent = Math.min(Math.round((spent / total) * 100), 100);

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Utilization</span>
                        <span className={percent > 90 ? 'text-rose-600' : 'text-indigo-600'}>
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Planned Budget:</span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {trip.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Spent:</span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {(stats?.totalSpent || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className="text-emerald-600">
                      {trip.currency} {(stats?.remainingBudget || trip.budget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('budget')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Manage Group Expenses</span>
                </button>
              </div>

              {/* 3. Travel Crew & Companions Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Travel Crew
                  </h3>
                  <span className="text-xs font-bold text-slate-400">{members.length} members</span>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={member.userId?.name || 'Member'}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {member.userId?.name || member.invitedEmail || 'Traveler'}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">{member.role}</p>
                        </div>
                      </div>

                      {member.role === 'organizer' && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('members')}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Invite Companions</span>
                </button>
              </div>

              {/* 4. Essential Travel Packing Checklist */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Backpack className="w-4 h-4 text-indigo-600" />
                  Pre-Trip Readiness Checklist
                </h3>
                <p className="text-xs text-slate-400">Essential items for {trip.destination}:</p>

                <div className="space-y-2 pt-1 text-xs text-slate-700">
                  {[
                    { id: 'passports', label: 'Passport / National ID & Driving License' },
                    { id: 'cash', label: 'Cash (LKR notes) & Travel Credit Cards' },
                    { id: 'sunscreen', label: 'Sunscreen, Sunglasses & Hat' },
                    { id: 'powerbank', label: 'Universal Adapter & Powerbank' },
                    { id: 'camera', label: 'Camera / Phone with extra storage' }
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => togglePackingItem(item.id)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!packingChecklist[item.id]}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className={packingChecklist[item.id] ? 'line-through text-slate-400' : 'font-medium'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Discussion Forum Quick Link */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 space-y-3">
                <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Crew Discussion Forum
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Coordinate plans, suggest dinner places, or chat with travel buddies in real-time.
                </p>
                <button
                  onClick={() => setActiveTab('forum')}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                >
                  Open Forum Chat &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <TripItineraryTab
            trip={trip}
            canEdit={isOwner || members.some(m => (m.userId?._id || m.userId)?.toString() === user?._id?.toString() && m.role !== 'viewer')}
            onItineraryUpdated={fetchTripDetails}
          />
        )}

        {/* ROUTE & MAP TAB */}
        {activeTab === 'route-map' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Itinerary Route Map</h4>
                  <p className="text-xs text-slate-500">Filter road directions by specific day or view all trip stops</p>
                </div>
              </div>

              {/* Day Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setSelectedRouteDay('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRouteDay === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  All Days ({itineraryItems.length} stops)
                </button>
                {Array.from(new Set(itineraryItems.map((item) => item.dayNumber)))
                  .sort((a, b) => a - b)
                  .map((dayNum) => (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedRouteDay(dayNum)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRouteDay === dayNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Day {dayNum}
                    </button>
                  ))}
              </div>
            </div>

            {(() => {
              const filteredItems = selectedRouteDay === 'all'
                ? itineraryItems
                : itineraryItems.filter((item) => item.dayNumber === selectedRouteDay);

              const stops = filteredItems
                .map((item) => item.locationName || item.title)
                .filter(Boolean);

              const startPlace = stops[0] || 'Colombo';
              const endPlace = stops.length > 1 ? stops[stops.length - 1] : trip.destination || 'Galle';
              const middleStops = stops.length > 2 ? stops.slice(1, -1) : [];

              return (
                <TripRouteMap
                  key={`${selectedRouteDay}-${stops.join('-')}`}
                  tripTitle={`${trip.title} — ${selectedRouteDay === 'all' ? 'All Stops' : `Day ${selectedRouteDay}`}`}
                  initialOrigin={startPlace}
                  initialDestination={endPlace}
                  initialWaypoints={middleStops}
                  height="560px"
                  canEdit={true}
                />
              );
            })()}
          </div>
        )}

        {/* WEATHER FORECAST TAB */}
        {activeTab === 'weather' && (
          <TripWeatherWidget
            tripId={trip._id}
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
          />
        )}

        {/* TRAVEL JOURNAL & MEMORIES TAB */}
        {activeTab === 'journal' && (
          <TripJournalTab trip={trip} members={members} />
        )}

        {/* DISCUSSION FORUM TAB */}
        {activeTab === 'forum' && (
          <TripForumTab trip={trip} members={members} />
        )}

        {/* BUDGET & EXPENSES TAB */}
        {activeTab === 'budget' && (
          <TripExpensesTab
            trip={trip}
            members={members}
            onExpenseUpdated={fetchTripDetails}
          />
        )}

        {/* MEMBERS / TRAVEL CREW TAB */}
        {activeTab === 'members' && (
          <TripMembersTab
            trip={trip}
            members={members}
            onMemberUpdated={fetchTripDetails}
          />
        )}
      </div>
    </div>
  );
}
