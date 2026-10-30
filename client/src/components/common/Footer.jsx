import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, MapPin, Sparkles, Shield, Mail, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand & Slogan (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Voy<span className="text-indigo-400">anta</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern AI-assisted travel companion designed for effortless journey planning, interactive route exploration, and seamless group expense coordination across Sri Lanka.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Discover Sri Lanka 🇱🇰
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> AI Powered
              </span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Top Destinations
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Sigiriya & Cultural Triangle
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Ella & Scenic Hill Country
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Galle Fort & Southern Coast
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Mirissa & Whale Coast
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Yala National Park Safari
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-400 transition-colors">
                  Jaffna & Northern Peninsula
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Travel Tools
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/ai-planner" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <span>AI Itinerary Planner</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </Link>
              </li>
              <li>
                <Link to="/route-map" className="hover:text-indigo-400 transition-colors">
                  Interactive Route Studio
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-indigo-400 transition-colors">
                  Group Bill Splitter & Budget
                </Link>
              </li>
              <li>
                <Link to="/trips/create" className="hover:text-indigo-400 transition-colors">
                  Sri Lanka Trip Builder
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Traveler Memories & Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore & Connect
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Traveler Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Saved Favorite Places
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=friends" className="hover:text-indigo-400 transition-colors">
                  Travel Buddies & Crew
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Sudhan-Morgan/Voyanta"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Voyanta Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Voyanta Travel Platform. Designed for unforgettable journeys.
          </p>

          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <strong className="text-white font-semibold">Sudhan Morgan</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
