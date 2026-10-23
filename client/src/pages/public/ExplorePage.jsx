import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../../services/destinationService';
import {
  Compass,
  MapPin,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Loader2,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTipId, setActiveTipId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'culture', label: 'Cultural & Heritage' },
    { id: 'nature', label: 'Hill Country & Nature' },
    { id: 'beach', label: 'Beaches & Coast' },
    { id: 'wildlife', label: 'Wildlife & Safari' },
    { id: 'adventure', label: 'Adventure & Surfing' }
  ];

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await destinationService.getDestinations(category, search);
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const handlePlanTripToDestination = (destinationName) => {
    // Navigate to create trip page with pre-filled destination query param
    navigate(`/trips/create?destination=${encodeURIComponent(destinationName)}`);
  };

  return (
    <div className="pb-24 space-y-12">
      {/* Hero Header */}
      <div className="relative bg-slate-900 py-16 sm:py-24 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1600&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Sri Lanka 🇱🇰</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Explore the Wonder of Asia
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            From mist-shrouded tea mountains and ancient fortress citadels to world-renowned leopard safaris and golden surf coastlines.
          </p>

          {/* Search bar inside hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto pt-4 flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search Sigiriya, Ella, Mirissa, Jaffna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count & Quick Status */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{destinations.length}</strong> Sri Lankan destinations
          </span>
          <span className="flex items-center gap-1 text-teal-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> All locations map-ready with GPS coordinates
          </span>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading Sri Lankan gems...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-md mx-auto space-y-3">
            <Compass className="w-10 h-10 text-indigo-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No destinations found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div
                key={dest._id}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Photo & Badge */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dest.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-indigo-700 shadow-xs">
                      {dest.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{dest.region}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dest.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>

                  {/* Highlights (Best time & Budget in LKR) */}
                  <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Best Season:
                      </span>
                      <span className="font-semibold text-slate-800">{dest.bestTimeToVisit}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Avg. Budget / Day:
                      </span>
                      <span className="font-bold text-emerald-600">
                        LKR {dest.averageDailyBudget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Practical Tips Toggle */}
                  {dest.practicalTips && dest.practicalTips.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          setActiveTipId(activeTipId === dest._id ? null : dest._id)
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        {activeTipId === dest._id ? 'Hide travel tips' : 'View traveler tips'}
                      </button>

                      {activeTipId === dest._id && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 animate-fadeIn">
                          {dest.practicalTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plan Trip CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => handlePlanTripToDestination(dest.name)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Plan a Trip to {dest.name.split(' ')[0]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
