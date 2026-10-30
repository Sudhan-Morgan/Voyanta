import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Heart,
  X,
  Check,
  Tag
} from 'lucide-react';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, addFavoritePlace, removeFavoritePlace } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTipId, setActiveTipId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const categories = [
    { id: 'all', label: 'All Sri Lanka' },
    { id: 'culture', label: 'Cultural & Heritage' },
    { id: 'nature', label: 'Hill Country & Nature' },
    { id: 'beach', label: 'Beaches & Coast' },
    { id: 'wildlife', label: 'Wildlife & Safari' },
    { id: 'adventure', label: 'Adventure & Surfing' },
    { id: 'city', label: 'City & Modern' }
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

  // Debounced search & category trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 250);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const handlePlanTripToDestination = (destinationName) => {
    const targetUrl = `/trips/create?destination=${encodeURIComponent(destinationName)}`;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    navigate(targetUrl);
  };

  // Check if place is already in user's favorites
  const isPlaceFavorited = (destName) => {
    if (!user?.favoritePlaces) return false;
    const nameLow = destName.toLowerCase();
    return user.favoritePlaces.some((fp) => {
      const fpLow = fp.name.toLowerCase();
      return fpLow === nameLow || nameLow.includes(fpLow) || fpLow.includes(nameLow.split(' ')[0]);
    });
  };

  // Toggle Favorite
  const handleToggleFavorite = async (dest) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const favorited = isPlaceFavorited(dest.name);
    try {
      if (favorited) {
        const nameLow = dest.name.toLowerCase();
        const found = user.favoritePlaces.find((fp) => {
          const fpLow = fp.name.toLowerCase();
          return fpLow === nameLow || nameLow.includes(fpLow) || fpLow.includes(nameLow.split(' ')[0]);
        });
        if (found && found._id) {
          await removeFavoritePlace(found._id);
          setToastMsg(`Removed "${dest.name}" from favorites`);
        }
      } else {
        await addFavoritePlace({
          name: dest.name,
          location: dest.region || 'Sri Lanka',
          category:
            dest.category === 'culture'
              ? 'Heritage'
              : dest.category === 'beach'
              ? 'Beach'
              : dest.category === 'nature'
              ? 'Mountain'
              : dest.category === 'wildlife'
              ? 'Nature'
              : 'General',
          description: dest.description || '',
          image: dest.imageUrls?.[0] || '',
          rating: 5,
          notes: dest.practicalTips?.[0] || 'Added from Explore page'
        });
        setToastMsg(`Saved "${dest.name}" to favorites! ❤️`);
      }
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="pb-24 space-y-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative bg-slate-950 py-16 sm:py-24 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 scale-102 transition-transform duration-1000"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=2000&q=85")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/25" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-xs font-semibold text-amber-300 border border-amber-300/25 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Sri Lanka 🇱🇰 ({destinations.length}+ Destinations)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
            Explore Every Corner of Sri Lanka
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-100 leading-relaxed drop-shadow-md font-medium">
            Search any city, national park, beach, mountain peak, or ancient fortress from Jaffna to Dondra Head.
          </p>

          {/* Search bar inside hero with live query */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto pt-4 flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search Sigiriya, Kandy, Ella, Mirissa, Jaffna, Bentota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg mr-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              Search
            </button>
          </form>

          {/* Popular Search Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Popular:</span>
            {['Sigiriya', 'Ella', 'Kandy', 'Mirissa', 'Galle', 'Jaffna', 'Nuwara Eliya', 'Yala', 'Trincomalee', 'Bentota'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearch(tag)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
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
            {search && <span> matching "<strong className="text-indigo-600">{search}</strong>"</span>}
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
            <h3 className="text-base font-bold text-slate-900">No destinations found for "{search}"</h3>
            <p className="text-xs text-slate-500">Try searching for other towns like Kandy, Sigiriya, Mirissa, Jaffna, or Ella.</p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('all');
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {destinations.map((dest) => {
              const favorited = isPlaceFavorited(dest.name);
              return (
                <div
                  key={dest._id}
                  className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                >
                  {/* Photo & Glassmorphism Badges */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                    <img
                      src={dest.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay for Cinematic Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Top Badges Row */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-indigo-700 shadow-sm flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-600" />
                          {dest.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/70 backdrop-blur-md text-amber-300 border border-amber-300/20 flex items-center gap-1">
                          ★ 4.9
                        </span>
                      </div>

                      {/* Bookmark / Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(dest)}
                        title={favorited ? 'Saved in Favorite Places' : 'Add to Favorite Places'}
                        className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                          favorited
                            ? 'bg-rose-500 text-white scale-110 ring-2 ring-white'
                            : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 hover:scale-105'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate drop-shadow-sm">{dest.region || 'Sri Lanka'}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md group-hover:text-amber-200 transition-colors">
                        {dest.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {dest.description}
                      </p>

                      {/* Top Highlights Tags if present */}
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dest.highlights.slice(0, 3).map((hl, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-indigo-50/70 text-indigo-700 text-[11px] font-medium border border-indigo-100"
                            >
                              ✨ {hl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metric Highlights Strip */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                          Best Season
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{dest.bestTimeToVisit || 'Year-round'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                          Daily Budget
                        </span>
                        <div className="flex items-center gap-1 font-bold text-emerald-600 truncate">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>LKR {dest.averageDailyBudget?.toLocaleString() || '15,000'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Practical Tips Toggle */}
                    {dest.practicalTips && dest.practicalTips.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTipId(activeTipId === dest._id ? null : dest._id)
                          }
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          {activeTipId === dest._id ? 'Hide travel tips' : 'View insider tips & spots'}
                        </button>

                        {activeTipId === dest._id && (
                          <div className="mt-2.5 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 text-[11px] text-slate-700 animate-fadeIn">
                            {dest.practicalTips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action CTA Bar */}
                    <div className="pt-2 flex items-center gap-2.5">
                      <button
                        onClick={() => handlePlanTripToDestination(dest.name)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Plan Trip to {dest.name.split(' ')[0]}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(dest)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          favorited
                            ? 'border-rose-200 bg-rose-50 text-rose-600 ring-2 ring-rose-200/50'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                        title={favorited ? 'In Favorites' : 'Add to Favorites'}
                      >
                        <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
