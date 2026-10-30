import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import {
  Compass,
  PlusCircle,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  UserPlus,
  CheckCircle2,
  X
} from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAllTrips();
      setTrips(data.trips || []);

      // Fetch pending invitations
      try {
        const invRes = await tripService.getTripInvitations();
        if (invRes?.data) {
          setInvitations(invRes.data);
        }
      } catch (invErr) {
        console.warn('Failed to fetch invitations:', invErr);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInvitation = async (tripId, action) => {
    try {
      setRespondingId(tripId);
      await tripService.respondTripInvitation(tripId, action);
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process invitation');
    } finally {
      setRespondingId(null);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip? All its itinerary and expenses will be removed.')) {
      return;
    }

    try {
      setDeletingId(tripId);
      await tripService.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trip');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDateRange = (start, end) => {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} - ${e}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Trips
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, manage, and coordinate your upcoming journeys and travel memories
          </p>
        </div>

        <Link
          to="/trips/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Plan New Trip
        </Link>
      </div>

      {/* PENDING TRIP INVITATIONS BANNER */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <UserPlus className="w-4 h-4" />
            <span>Trip Invitations ({invitations.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => {
              const tripItem = inv.tripId;
              if (!tripItem) return null;
              const isResponding = respondingId === tripItem._id;

              return (
                <div
                  key={inv._id}
                  className="relative rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5 shadow-lg flex flex-col justify-between gap-4 overflow-hidden border border-indigo-400/30"
                >
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>Travel Crew Invitation</span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {tripItem.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-indigo-200">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {tripItem.destination}
                      </span>
                      <span>•</span>
                      <span>
                        Host: {tripItem.ownerId?.name || 'Friend'}
                        {tripItem.ownerId?.userNumber && (
                          <span className="ml-1 text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">
                            #{tripItem.ownerId.userNumber}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleRespondInvitation(tripItem._id, 'accept')}
                      disabled={isResponding}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isResponding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Join Crew</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRespondInvitation(tripItem._id, 'decline')}
                      disabled={isResponding}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by destination or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'planning', 'confirmed', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trip Cards Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading your trips...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchTerm ? 'No matching trips found' : 'No trips yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm
                ? 'Try a different search keyword or status filter.'
                : 'Create your first custom trip to start building itineraries and budgets!'}
            </p>
          </div>
          <Link
            to="/trips/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Create Trip Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const calculateDuration = (start, end) => {
              if (!start || !end) return 1;
              const s = new Date(start);
              const e = new Date(end);
              const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return diff > 0 ? diff : 1;
            };

            return (
              <Link
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-xs ${getStatusBadge(
                        trip.status
                      )}`}
                    >
                      {trip.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-400/20">
                      {calculateDuration(trip.startDate, trip.endDate)} Days
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTrip(e, trip._id)}
                      title="Delete Trip"
                      disabled={deletingId === trip._id}
                      className="p-2 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-md hover:scale-110 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate drop-shadow-sm">{trip.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-900">
                        {trip.currency} {trip.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{trip.groupSize} {trip.groupSize === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
