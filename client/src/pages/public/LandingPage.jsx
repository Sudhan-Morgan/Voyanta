import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Users, Wallet, Calendar, ArrowRight, Compass, CheckCircle2, Star } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      color: 'from-amber-500 to-rose-500',
      title: 'AI-Assisted Itineraries',
      description: 'Generate customized day-by-day travel schedules tailored to your duration, budget, travel pace, and interests.'
    },
    {
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
      title: 'Interactive Maps & Routes',
      description: 'Explore destinations with integrated maps, pin itinerary stops, and view routes with travel times.'
    },
    {
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      title: 'Smart Budget & Expense Splitting',
      description: 'Set your overall trip budget, track expenses by categories, and split shared costs transparently with friends.'
    },
    {
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      title: 'Group Coordination',
      description: 'Invite your travel companions, vote on proposed activities, and manage a shared packing checklist.'
    }
  ];

  const featuredDestinations = [
    {
      name: 'Sigiriya Lion Rock',
      category: 'UNESCO Heritage',
      image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
      rating: '4.9',
      duration: '2 - 3 Days'
    },
    {
      name: 'Ella & Nine Arch Bridge',
      category: 'Hill Country & Tea Trails',
      image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
      rating: '5.0',
      duration: '3 - 4 Days'
    },
    {
      name: 'Mirissa Beach & Whale Watching',
      category: 'Beaches & Ocean',
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
      rating: '4.8',
      duration: '3 - 5 Days'
    },
    {
      name: 'Galle Dutch Fort',
      category: 'Colonial Fort & Sunset Ramparts',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
      rating: '4.9',
      duration: '2 - 3 Days'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-radial from-indigo-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>AI-Powered Travel Planning across Sri Lanka 🇱🇰</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Plan trips smarter with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500">
                AI & Friends
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Explore the wonder of Sri Lanka with AI-assisted day-by-day itineraries, interactive maps, split budget tracking in LKR, and group coordination in one unified app.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                Start Planning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all"
              >
                <Compass className="w-4 h-4 text-indigo-600" />
                Explore Destinations
              </Link>
            </div>

            {/* Quick Feature Badges */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Free to use
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Instant AI Drafts
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Google Maps Integration
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Group Collaboration
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Features Designed for Travelers
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need for an unforgettable journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Get Inspired
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Trending Destinations
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Browse all places <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.name}
              className="group overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {dest.rating}
                </div>
              </div>
              <div className="p-4">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {dest.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {dest.name}
                </h3>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Recommended: {dest.duration}</span>
                  <Link
                    to="/register"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Plan Trip
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to create your next adventure?
            </h2>
            <p className="mt-4 text-indigo-200 text-sm sm:text-base leading-relaxed">
              Create an itinerary in seconds with Voyanta AI, invite your travel crew, and hit the road with zero planning stress.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-105"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
