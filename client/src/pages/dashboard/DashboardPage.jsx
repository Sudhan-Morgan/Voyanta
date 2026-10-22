import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  PlusCircle,
  Calendar,
  Sparkles,
  MapPin,
  Wallet,
  Users,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import API from '../../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In future phases, trips will be fetched from /api/trips
    setLoading(false);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/15 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Travel Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Traveler'}! ✈️
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              Where would you like to travel next? Plan a new trip, generate AI itineraries, or collaborate with friends.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Trip Planner
            </Link>
            <Link
              to="/trips/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 border border-white/20 text-white text-sm font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              New Custom Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Upcoming Trips</p>
            <h3 className="text-2xl font-bold text-slate-900">{trips.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Budget Tracked</p>
            <h3 className="text-2xl font-bold text-slate-900">$0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Places Saved</p>
            <h3 className="text-2xl font-bold text-slate-900">4</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Travel Crew</p>
            <h3 className="text-2xl font-bold text-slate-900">1</h3>
          </div>
        </div>
      </div>

      {/* Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Upcoming Trips</h2>
            <p className="text-xs text-slate-500">Manage itineraries, maps, and shared budgets</p>
          </div>
          <Link
            to="/trips"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all trips <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Empty State */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">No trips planned yet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Start your journey by creating your first trip manually or letting our AI build a day-by-day plan for you!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/ai-planner"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate with AI
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                Explore Places
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Trip cards will be populated here */}
          </div>
        )}
      </div>
    </div>
  );
}
