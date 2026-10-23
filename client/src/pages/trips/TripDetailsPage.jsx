import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import TripExpensesTab from '../../components/trips/TripExpensesTab';
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
  AlertCircle
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

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(id);
      setTrip(data.trip);
      setMembers(data.members || []);
      setStats(data.stats || {});
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
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Top Floating Nav */}
        <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-xs font-semibold text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Trips
          </Link>

          {isOwner && (
            <button
              onClick={handleDeleteTrip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-xs font-semibold text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Trip
            </button>
          )}
        </div>

        {/* Banner Details */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {trip.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-indigo-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {trip.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>

            {/* Status Change Selector */}
            {isOwner && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
                <span className="text-xs text-slate-300 pl-2 font-medium">Status:</span>
                <select
                  value={trip.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
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

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Trip Overview' },
            { id: 'itinerary', label: `Itinerary (${stats?.itineraryCount || 0})` },
            { id: 'budget', label: 'Budget & Expenses' },
            { id: 'members', label: `Travel Crew (${members.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
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
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Highlight Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Trip Highlights & Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.interests && trip.interests.length > 0 ? (
                    trip.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No specific interests tags added yet.</p>
                  )}
                </div>
              </div>

              {/* AI & Interactive Map Integration Banner */}
              <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 overflow-hidden shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" /> Next Steps
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Generate Itinerary with AI
                  </h3>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Create a customized day-by-day plan with tourist attractions, restaurants, and routes for {trip.destination}.
                  </p>
                </div>

                <Link
                  to="/ai-planner"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-md hover:bg-indigo-50 transition-all hover:scale-105 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Launch AI Generator
                </Link>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Budget Progress Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Budget Summary
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Planned Budget:</span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {trip.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Spent:</span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {(stats?.totalSpent || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Remaining:</span>
                    <span className="font-bold text-emerald-600">
                      {trip.currency} {(stats?.remainingBudget || trip.budget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group Members Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Trip Companions
                  </h3>
                  <span className="text-xs text-slate-400">{members.length} members</span>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <img
                        src={member.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={member.userId?.name || 'Member'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {member.userId?.name || member.invitedEmail || 'Traveler'}
                        </p>
                        <p className="text-[11px] text-slate-400 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY TAB PLACEHOLDER */}
        {activeTab === 'itinerary' && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto space-y-4">
            <Compass className="w-12 h-12 text-indigo-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Itinerary Schedule</h3>
            <p className="text-xs text-slate-500">
              Your itinerary schedule for {trip.destination} is ready for activities. Add stops manually or generate an AI day-by-day plan!
            </p>
            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-4 h-4" /> Generate AI Itinerary
            </Link>
          </div>
        )}

        {/* BUDGET & EXPENSES TAB */}
        {activeTab === 'budget' && (
          <TripExpensesTab
            trip={trip}
            members={members}
            onExpenseUpdated={fetchTripDetails}
          />
        )}

        {/* MEMBERS TAB PLACEHOLDER */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 max-w-2xl mx-auto space-y-6">
            <h3 className="text-base font-bold text-slate-900">Trip Members & Permissions</h3>
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div key={member._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={member.userId?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.userId?.name || member.invitedEmail}</p>
                      <p className="text-xs text-slate-400">{member.userId?.email || 'Invited'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
