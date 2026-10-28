import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TripRouteMap from '../../components/trips/TripRouteMap';
import {
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Navigation,
  ArrowRight,
  Route,
  CheckCircle2,
  Share2,
  Clock,
  Car
} from 'lucide-react';

const PRESET_ROUTES = [
  {
    title: 'Nuwara Eliya to Ella Highland Route',
    origin: 'Nuwara Eliya',
    destination: 'Ella',
    waypoints: ['Lake Gregory', 'Horton Plains National Park', 'Nine Arch Bridge'],
    tag: 'Tea Trails & Mountains',
    days: '2-3 Days'
  },
  {
    title: 'Hill Country Tea & Train Trail',
    origin: 'Kandy',
    destination: 'Ella',
    waypoints: ['Nuwara Eliya', 'Horton Plains National Park', 'Nine Arch Bridge'],
    tag: 'Scenic Mountain Drive',
    days: '4-5 Days'
  },
  {
    title: 'Southern Beach & Heritage Trail',
    origin: 'Colombo',
    destination: 'Mirissa',
    waypoints: ['Bentota Beach', 'Galle Fort', 'Weligama Bay'],
    tag: 'Beach & Coastal Vibes',
    days: '3-4 Days'
  },
  {
    title: 'Ancient Cultural Triangle',
    origin: 'Colombo',
    destination: 'Polonnaruwa',
    waypoints: ['Dambulla Cave Temple', 'Sigiriya Rock Fortress'],
    tag: 'UNESCO Heritage & History',
    days: '3 Days'
  },
  {
    title: 'Wildlife & Safari Odyssey',
    origin: 'Galle',
    destination: 'Ella',
    waypoints: ['Mirissa', 'Udawalawe National Park', 'Yala National Park'],
    tag: 'Leopards & Elephants',
    days: '4 Days'
  }
];

export default function RoutePlannerPage() {
  const [activeRoute, setActiveRoute] = useState(PRESET_ROUTES[0]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 rounded-3xl text-white shadow-xl border border-slate-800">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Route className="w-3.5 h-3.5" /> Google Maps & Route Navigation
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Trip Route Planner
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Plan your travel routes with accurate driving distances, real-time travel times,
              and multi-stop waypoint optimization. View on Google Maps or OpenStreetMap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/ai-planner"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/15"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Itinerary Planner
            </Link>
            <Link
              to="/trips/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              Create New Trip
            </Link>
          </div>
        </div>

        {/* Preset Popular Routes Carousel / Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Popular Curated Travel Routes
            </h3>
            <span className="text-xs text-slate-400">Click a route to load into the map</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_ROUTES.map((route, i) => {
              const isSelected = activeRoute.title === route.title;
              return (
                <div
                  key={i}
                  onClick={() => setActiveRoute(route)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 mb-1">
                    <span>{route.tag}</span>
                    <span className="text-slate-400 font-semibold">{route.days}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 mb-2">
                    {route.title}
                  </h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5 font-medium truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      {route.origin} → {route.destination}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Via: {route.waypoints.join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Map Component */}
        <div className="space-y-4">
          <TripRouteMap
            key={activeRoute.title}
            tripTitle={activeRoute.title}
            initialOrigin={activeRoute.origin}
            initialDestination={activeRoute.destination}
            initialWaypoints={activeRoute.waypoints}
            height="560px"
          />
        </div>

        {/* Informative Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Add Multiple Waypoints</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add any scenic stops, viewpoints, or restaurants along the road. Reorder stops with the up/down arrows to optimize your itinerary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Real Driving Times & Distances</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates real turn-by-turn road distances and driving durations for winding mountain roads and highways across Sri Lanka.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Google Maps Live GPS Navigation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click "Open in Google Maps" to instantly launch Google Maps on your phone or tablet with all waypoints ready for turn-by-turn navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
