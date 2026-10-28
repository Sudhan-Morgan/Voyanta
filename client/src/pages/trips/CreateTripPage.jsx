import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { aiService } from '../../services/aiService';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  Info,
  LogIn,
  Layers,
  HeartHandshake,
  UserPlus,
  UserCheck
} from 'lucide-react';

// Comprehensive dataset of all 25 districts in Sri Lanka grouped by Province (100% English)
export const SRI_LANKA_DISTRICTS = [
  {
    province: 'Western Province',
    districts: [
      {
        id: 'colombo',
        name: 'Colombo',
        highlights: 'Colombo Fort, Galle Face Green, Gangaramaya Temple, Mount Lavinia Beach',
        coverImage: 'https://images.unsplash.com/photo-1578652197841-39e3fa7c0f18?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture', 'Sri Lankan Culinary']
      },
      {
        id: 'gampaha',
        name: 'Gampaha',
        highlights: 'Negombo Beach & Lagoon, Kelaniya Raja Maha Vihara, Henarathgoda Gardens',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Historical & Culture']
      },
      {
        id: 'kalutara',
        name: 'Kalutara',
        highlights: 'Kalutara Bodhiya, Richmond Castle, Bentota Beach Resort, Barberyn Lighthouse',
        coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Temple & Heritage']
      }
    ]
  },
  {
    province: 'Central Province',
    districts: [
      {
        id: 'kandy',
        name: 'Kandy',
        highlights: 'Temple of the Sacred Tooth Relic (Dalada Maligawa), Kandy Lake, Peradeniya Gardens',
        coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Temple & Heritage', 'Historical & Culture', 'Scenic Train Journeys']
      },
      {
        id: 'matale',
        name: 'Matale',
        highlights: 'Sigiriya Rock Fortress, Dambulla Cave Temple, Riverston & Knuckles Range',
        coverImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture', 'Adventure & Surfing', 'Temple & Heritage']
      },
      {
        id: 'nuwara-eliya',
        name: 'Nuwara Eliya',
        highlights: 'Little England, Gregory Lake, Horton Plains & World\'s End, Pedro Tea Estate',
        coverImage: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Hill Country & Tea', 'Scenic Train Journeys']
      }
    ]
  },
  {
    province: 'Southern Province',
    districts: [
      {
        id: 'galle',
        name: 'Galle',
        highlights: 'Galle Dutch Fort, Iconic Lighthouse, Unawatuna Beach, Hikkaduwa Coral Reef',
        coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Historical & Culture', 'Sri Lankan Culinary']
      },
      {
        id: 'matara',
        name: 'Matara',
        highlights: 'Mirissa Blue Whale Watching, Coconut Tree Hill, Dondra Head Lighthouse, Polhena Beach',
        coverImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Wildlife Safari', 'Adventure & Surfing']
      },
      {
        id: 'hambantota',
        name: 'Hambantota',
        highlights: 'Yala National Park Safari, Bundala Bird Sanctuary, Tangalle Silent Beach',
        coverImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Wildlife Safari', 'Beach & Coastal']
      }
    ]
  },
  {
    province: 'Northern Province',
    districts: [
      {
        id: 'jaffna',
        name: 'Jaffna',
        highlights: 'Nallur Kandaswamy Kovil, Jaffna Fort, Casuarina Beach, Nainativu Island',
        coverImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Temple & Heritage', 'Historical & Culture', 'Sri Lankan Culinary']
      },
      {
        id: 'kilinochchi',
        name: 'Kilinochchi',
        highlights: 'Iranamadu Giant Reservoir, Kilinochchi Landmark, Scenic Rural Landscapes',
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture']
      },
      {
        id: 'mannar',
        name: 'Mannar',
        highlights: 'Mannar Portuguese Fort, Ancient Baobab Tree, Adam\'s Bridge / Rama Setu, Bird Sanctuary',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture', 'Wildlife Safari']
      },
      {
        id: 'vavuniya',
        name: 'Vavuniya',
        highlights: 'Northern Gateway, Ancient Buddhist & Hindu Ruins, Madhu Sanctuary Route',
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture']
      },
      {
        id: 'mullaitivu',
        name: 'Mullaitivu',
        highlights: 'Nayaru Lagoon, Unspoiled Coastal Beaches, Wildlife Habitats',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Historical & Culture']
      }
    ]
  },
  {
    province: 'Eastern Province',
    districts: [
      {
        id: 'trincomalee',
        name: 'Trincomalee',
        highlights: 'Nilaveli Beach, Pigeon Island Snorkeling, Koneswaram Temple, Fort Frederick, Marble Beach',
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Temple & Heritage', 'Adventure & Surfing']
      },
      {
        id: 'batticaloa',
        name: 'Batticaloa',
        highlights: 'Pasikudah Bay Coral Reef, Batticaloa Dutch Fort, Singing Fish Lagoon, Kallady Lighthouse',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Beach & Coastal', 'Historical & Culture']
      },
      {
        id: 'ampara',
        name: 'Ampara',
        highlights: 'Arugam Bay (World Surfing Hub), Kumana National Park Safari, Kudumbigala Monastery',
        coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Adventure & Surfing', 'Wildlife Safari', 'Beach & Coastal']
      }
    ]
  },
  {
    province: 'North Western Province',
    districts: [
      {
        id: 'kurunegala',
        name: 'Kurunegala',
        highlights: 'Elephant Rock (Ethagala), Ancient Citadel of Yapahuwa, Panduwasnuwara',
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture', 'Temple & Heritage']
      },
      {
        id: 'puttalam',
        name: 'Puttalam',
        highlights: 'Kalpitiya Dolphin & Kitesurfing Lagoon, Wilpattu Safari Gateway, Salt Pans',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Adventure & Surfing', 'Wildlife Safari', 'Beach & Coastal']
      }
    ]
  },
  {
    province: 'North Central Province',
    districts: [
      {
        id: 'anuradhapura',
        name: 'Anuradhapura',
        highlights: 'Jaya Sri Maha Bodhi, Ruwanwelisaya, Mihintale, Ancient Sacred City',
        coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Temple & Heritage', 'Historical & Culture']
      },
      {
        id: 'polonnaruwa',
        name: 'Polonnaruwa',
        highlights: 'Gal Vihara Rock Sculptures, Parakrama Samudra, Ancient Royal Palaces, Minneriya Safari',
        coverImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Historical & Culture', 'Wildlife Safari']
      }
    ]
  },
  {
    province: 'Uva Province',
    districts: [
      {
        id: 'badulla',
        name: 'Badulla',
        highlights: 'Ella, Nine Arch Bridge, Little Adam\'s Peak, Dunhinda Falls, Lipton\'s Seat',
        coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Hill Country & Tea', 'Scenic Train Journeys', 'Adventure & Surfing']
      },
      {
        id: 'monaragala',
        name: 'Monaragala',
        highlights: 'Kataragama Sacred Shrine, Maligawila Buddha Statue, Yala National Park (East)',
        coverImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Temple & Heritage', 'Wildlife Safari']
      }
    ]
  },
  {
    province: 'Sabaragamuwa Province',
    districts: [
      {
        id: 'ratnapura',
        name: 'Ratnapura',
        highlights: 'Adam\'s Peak (Sri Pada Sacred Mountain), Sinharaja Rainforest UNESCO, World Gem Mines',
        coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Adventure & Surfing', 'Temple & Heritage', 'Wildlife Safari']
      },
      {
        id: 'kegalle',
        name: 'Kegalle',
        highlights: 'Pinnawala Elephant Orphanage & River Bathing, Bible Rock (Bathalegala)',
        coverImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
        suggestedInterests: ['Wildlife Safari', 'Historical & Culture']
      }
    ]
  }
];

// Flat list of all 25 districts for rapid lookup
const ALL_DISTRICTS = SRI_LANKA_DISTRICTS.flatMap((group) =>
  group.districts.map((d) => ({ ...d, provinceName: group.province }))
);

export default function CreateTripPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Travel Friends invitation state
  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);

  // Fetch accepted friends when user is authenticated
  useEffect(() => {
    const fetchFriends = async () => {
      if (!isAuthenticated) return;
      try {
        setLoadingFriends(true);
        const res = await friendService.getFriends();
        if (res.success && Array.isArray(res.friends)) {
          setFriendsList(res.friends);
        }
      } catch (err) {
        console.warn('Could not load friends list for trip creation:', err);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, [isAuthenticated]);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  // Read URL query parameter for prefilling
  const urlDestination = searchParams.get('destination') || '';

  // Helper to find matching district from query string
  const findDistrictByQuery = (query) => {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    return ALL_DISTRICTS.find(
      (d) =>
        d.id === clean ||
        d.name.toLowerCase() === clean ||
        clean.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(clean)
    );
  };

  const initialMatchedDistrict = findDistrictByQuery(urlDestination) || ALL_DISTRICTS.find((d) => d.id === 'galle');

  const [selectedDistrictId, setSelectedDistrictId] = useState(initialMatchedDistrict ? initialMatchedDistrict.id : 'galle');
  const [subLocation, setSubLocation] = useState('');
  const [isCustomDestination, setIsCustomDestination] = useState(false);

  const initialDestinationString = initialMatchedDistrict
    ? `${initialMatchedDistrict.name}, Sri Lanka`
    : urlDestination || 'Galle, Sri Lanka';

  const [formData, setFormData] = useState({
    title: initialMatchedDistrict ? `Trip to ${initialMatchedDistrict.name}` : 'Trip to Galle',
    destination: initialDestinationString,
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'LKR',
    groupSize: 1,
    interests: initialMatchedDistrict?.suggestedInterests || ['Beach & Coastal', 'Historical & Culture'],
    coverImage: initialMatchedDistrict ? initialMatchedDistrict.coverImage : 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80'
  });

  const availableInterests = [
    'Beach & Coastal',
    'Hill Country & Tea',
    'Historical & Culture',
    'Sri Lankan Culinary',
    'Adventure & Surfing',
    'Wildlife Safari',
    'Temple & Heritage',
    'Scenic Train Journeys'
  ];

  const sampleCovers = [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80', // Galle
    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80', // Sigiriya
    'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80', // Ella
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', // Kandy
    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80'  // Mirissa / Jaffna
  ];

  // Update selection if URL param changes
  useEffect(() => {
    if (urlDestination) {
      const matched = findDistrictByQuery(urlDestination);
      if (matched) {
        setSelectedDistrictId(matched.id);
        setIsCustomDestination(false);
        const destString = `${matched.name}, Sri Lanka`;
        setFormData((prev) => ({
          ...prev,
          destination: destString,
          title: prev.title && !prev.title.startsWith('Trip to') ? prev.title : `Trip to ${matched.name}`,
          coverImage: matched.coverImage,
          interests: Array.from(new Set([...prev.interests, ...(matched.suggestedInterests || [])]))
        }));
      } else {
        setIsCustomDestination(true);
        setFormData((prev) => ({
          ...prev,
          destination: urlDestination,
          title: prev.title && !prev.title.startsWith('Trip to') ? prev.title : `Trip to ${urlDestination}`
        }));
      }
    }
  }, [urlDestination]);

  // Handle District Dropdown Selection
  const handleDistrictChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomDestination(true);
      setFormData((prev) => ({
        ...prev,
        destination: ''
      }));
      return;
    }

    setIsCustomDestination(false);
    setSelectedDistrictId(val);

    const district = ALL_DISTRICTS.find((d) => d.id === val);
    if (district) {
      const fullDest = subLocation.trim()
        ? `${subLocation.trim()}, ${district.name}, Sri Lanka`
        : `${district.name}, Sri Lanka`;

      setFormData((prev) => ({
        ...prev,
        destination: fullDest,
        // Auto-update title if empty or default
        title: !prev.title || prev.title.startsWith('Trip to') ? `Trip to ${district.name}` : prev.title,
        coverImage: district.coverImage,
        interests: Array.from(new Set([...prev.interests, ...(district.suggestedInterests || [])]))
      }));
    }
    if (error) setError('');
  };

  // Handle optional sub-location / town input (e.g. Unawatuna, Hikkaduwa within Galle)
  const handleSubLocationChange = (e) => {
    const sub = e.target.value;
    setSubLocation(sub);
    const district = ALL_DISTRICTS.find((d) => d.id === selectedDistrictId);
    if (district) {
      const fullDest = sub.trim()
        ? `${sub.trim()}, ${district.name}, Sri Lanka`
        : `${district.name}, Sri Lanka`;
      setFormData((prev) => ({ ...prev, destination: fullDest }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Check auth and submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify token presence
    const token = localStorage.getItem('voyanta_token') || localStorage.getItem('travelmate_token');
    if (!token || !isAuthenticated) {
      setError('Not authorized to create trip: You are not logged in or your session has expired. Please log in first.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a trip title.');
      return;
    }

    if (!formData.destination.trim()) {
      setError('Please select a destination district in Sri Lanka.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please select travel start and end dates.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be equal to or after start date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const activeDistrict = ALL_DISTRICTS.find((d) => d.id === selectedDistrictId);
      const chosenCover = formData.coverImage || activeDistrict?.coverImage || sampleCovers[0];

      const payload = {
        title: formData.title.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget) || 0,
        currency: formData.currency || 'LKR',
        groupSize: Number(formData.groupSize) || 1,
        interests: formData.interests,
        coverImage: chosenCover
      };

      const res = await tripService.createTrip(payload);

      // Auto-invite selected friends to the travel crew
      if (selectedFriendIds.length > 0 && res.trip?._id) {
        try {
          await Promise.allSettled(
            selectedFriendIds.map((friendId) =>
              tripService.inviteFriendToTrip(res.trip._id, { friendId })
            )
          );
        } catch (inviteErr) {
          console.warn('Initial friend invitations skipped:', inviteErr);
        }
      }

      // Auto-generate AI Itinerary if requested
      if (autoGenerateAI && res.trip) {
        try {
          const aiRes = await aiService.generateItinerary({
            destination: formData.destination,
            startDate: formData.startDate,
            endDate: formData.endDate,
            customBudget: Number(formData.budget) || null,
            currency: formData.currency || 'LKR',
            travelersCount: Number(formData.groupSize) || 1,
            interests: formData.interests
          });
          if (aiRes.success && aiRes.data) {
            await aiService.saveItineraryAsTrip({
              itinerary: aiRes.data,
              tripId: res.trip._id,
              startDate: formData.startDate,
              endDate: formData.endDate,
              customBudget: Number(formData.budget) || null,
              currency: formData.currency || 'LKR'
            });
          }
        } catch (aiErr) {
          console.warn('AI itinerary auto-generation skipped:', aiErr);
        }
      }

      navigate(`/trips/${res.trip._id}`);
    } catch (err) {
      console.error('Trip creation error:', err);
      if (err.response?.status === 401 || err.response?.data?.message?.includes('token')) {
        setError('Not authorized: Your login token has expired or is invalid. Please log in again to save this trip.');
      } else {
        setError(err.response?.data?.message || 'Failed to create trip. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentDistrictObj = ALL_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const token = localStorage.getItem('voyanta_token') || localStorage.getItem('travelmate_token');
  const isAuthMissing = !isAuthenticated || !token || token === 'undefined';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Trips
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 text-white relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Sri Lanka Travel Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create Your Next Sri Lanka Trip
          </h1>
          <p className="mt-2 text-indigo-100 text-sm max-w-xl">
            Choose any of the 25 Sri Lanka districts from the dropdown, customize your travel dates and budget, and let Voyanta prepare your journey.
          </p>
        </div>

        {/* Auth Warning Banner if user has no valid token */}
        {isAuthMissing && (
          <div className="m-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">Authentication Required</p>
                <p className="text-xs text-amber-700">
                  You are currently not logged in. To save trips to your account, please sign in.
                </p>
              </div>
            </div>
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" /> Log In to Save Trip
            </Link>
          </div>
        )}

        {/* Error message alert */}
        {error && (
          <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5 sm:mt-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">{error}</span>
              </div>
            </div>
            {(error.includes('authorized') || error.includes('token') || error.includes('logged in')) && (
              <Link
                to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                Sign In Now &rarr;
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Trip Basics */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" /> 1. Destination & Trip Title
              </h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                25 Districts of Sri Lanka
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Destination Dropdown for Sri Lanka Districts */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Sri Lanka District *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Select your destination
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    id="destination-district-select"
                    value={isCustomDestination ? 'custom' : selectedDistrictId}
                    onChange={handleDistrictChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 hover:border-indigo-400 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {SRI_LANKA_DISTRICTS.map((provinceGroup) => (
                      <optgroup
                        key={provinceGroup.province}
                        label={`📍 ${provinceGroup.province}`}
                        className="font-bold text-slate-900 bg-slate-100 py-1"
                      >
                        {provinceGroup.districts.map((district) => (
                          <option
                            key={district.id}
                            value={district.id}
                            className="font-normal text-slate-800 bg-white py-1"
                          >
                            {district.name} — {district.highlights.split(',').slice(0, 2).join(',')}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="🌍 Other Options" className="font-bold text-slate-900 bg-slate-100">
                      <option value="custom">Type Custom City / Country...</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Custom Destination input if user picked custom */}
                {isCustomDestination && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="destination"
                      required
                      placeholder="e.g. Ella, Sri Lanka or Tokyo, Japan"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                )}

                {/* District Details Banner */}
                {!isCustomDestination && currentDistrictObj && (
                  <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-950 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        {currentDistrictObj.name} District
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">
                        {currentDistrictObj.provinceName}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      <strong className="text-slate-700">Highlights:</strong> {currentDistrictObj.highlights}
                    </p>
                  </div>
                )}
              </div>

              {/* Trip Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Trip Title *
                  </label>
                  <span className="text-[11px] text-slate-400">Auto-filled or custom</span>
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Trip to Galle"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />

                {/* Optional Specific Town / Beach within District */}
                {!isCustomDestination && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Specific Town or Beach (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${
                        selectedDistrictId === 'galle'
                          ? 'Unawatuna or Hikkaduwa'
                          : selectedDistrictId === 'badulla'
                          ? 'Ella or Haputale'
                          : selectedDistrictId === 'matara'
                          ? 'Mirissa'
                          : 'City center / Resort'
                      }`}
                      value={subLocation}
                      onChange={handleSubLocationChange}
                      className="w-full px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Start Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  End Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Group Size */}
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> 2. Budget & Travelers
            </h2>

            {/* Trip Type Quick Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Trip Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Solo Trip', size: 1, icon: Compass, desc: '1 Traveler' },
                  { label: 'Couple Trip', size: 2, icon: HeartHandshake, desc: '2 Travelers' },
                  { label: 'Group Trip', size: 4, icon: Users, desc: '3–6 Travelers' },
                  { label: 'Large Crew', size: 8, icon: Sparkles, desc: '7+ Travelers' }
                ].map((preset) => {
                  const isSelected =
                    (preset.size === 1 && Number(formData.groupSize) === 1) ||
                    (preset.size === 2 && Number(formData.groupSize) === 2) ||
                    (preset.size === 4 && Number(formData.groupSize) >= 3 && Number(formData.groupSize) <= 6) ||
                    (preset.size === 8 && Number(formData.groupSize) >= 7);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, groupSize: preset.size }));
                        if (preset.size === 1) {
                          setSelectedFriendIds([]);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <preset.icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold">{preset.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Estimated Budget
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    placeholder="e.g. 50000"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="LKR">LKR (Rs. / Sri Lankan Rupee)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Exact Travelers Count
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    name="groupSize"
                    min="1"
                    max="50"
                    value={formData.groupSize}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (Number(e.target.value) === 1) {
                        setSelectedFriendIds([]);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Friend Invites for Group/Couple Trips */}
            {Number(formData.groupSize) > 1 && (
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        Invite Friends to Travel Crew (Optional)
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Trip Forum & Discussion
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Select friends to invite now. When they accept, you can collaborate together in the Trip Discussion Forum.
                      </p>
                    </div>
                  </div>
                  {friendsList.length > 0 && (
                    <span className="text-xs font-semibold text-indigo-600 shrink-0">
                      {selectedFriendIds.length} of {friendsList.length} selected
                    </span>
                  )}
                </div>

                {loadingFriends ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-indigo-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading your friends list...
                  </div>
                ) : friendsList.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">You haven't added any travel friends yet</p>
                      <p className="text-slate-500 mt-0.5">
                        Share your 6-digit User ID ({user?.userNumber ? `#${user.userNumber}` : ''}) with friends or search their ID in your Profile &rarr; Friends tab. You can also invite friends later anytime inside Trip Details!
                      </p>
                    </div>
                    <Link
                      to="/profile?tab=friends"
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs shrink-0 transition-colors"
                    >
                      Find Friends &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {friendsList.map((friend) => {
                      const isSelected = selectedFriendIds.includes(friend._id);
                      return (
                        <div
                          key={friend._id}
                          onClick={() => toggleFriendSelection(friend._id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="relative shrink-0">
                            {friend.profileImage ? (
                              <img
                                src={friend.profileImage}
                                alt={friend.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                {friend.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{friend.name}</p>
                            <p className="text-[11px] font-mono font-semibold text-indigo-600">
                              {friend.userNumber ? `#${friend.userNumber}` : ''}
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Travel Interests */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> 3. Travel Interests & Style
            </h2>
            <p className="text-xs text-slate-500">
              Select key interests for this trip. Voyanta AI will use these to organize stops and activities:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {availableInterests.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Photo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-600" /> 4. Trip Cover Photo
              </h2>
              <span className="text-xs text-slate-500">
                Auto-matched with {currentDistrictObj?.name || 'Destination'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Primary match cover */}
              {currentDistrictObj && (
                <div
                  onClick={() => setFormData({ ...formData, coverImage: currentDistrictObj.coverImage })}
                  className={`relative rounded-xl overflow-hidden h-24 cursor-pointer border-2 transition-all ${
                    formData.coverImage === currentDistrictObj.coverImage
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-102'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={currentDistrictObj.coverImage}
                    alt={currentDistrictObj.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] font-bold text-white text-center">
                    {currentDistrictObj.name} (Matched)
                  </div>
                </div>
              )}

              {/* Sample Covers */}
              {sampleCovers
                .filter((url) => !currentDistrictObj || url !== currentDistrictObj.coverImage)
                .slice(0, currentDistrictObj ? 4 : 5)
                .map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFormData({ ...formData, coverImage: imgUrl })}
                    className={`relative rounded-xl overflow-hidden h-24 cursor-pointer border-2 transition-all ${
                      formData.coverImage === imgUrl
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-102'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Cover option" className="w-full h-full object-cover" />
                  </div>
                ))}
            </div>
          </div>

          {/* AI Auto Plan Option */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="autoGenerateAI"
              checked={autoGenerateAI}
              onChange={(e) => setAutoGenerateAI(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="autoGenerateAI" className="text-xs sm:text-sm text-slate-700 cursor-pointer">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Auto-generate AI Itinerary for {currentDistrictObj?.name || 'this district'}
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                Voyanta AI will automatically plan day-by-day stops and activities tailored to {currentDistrictObj?.name || 'your destination'}, your travel dates, and budget.
              </p>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <Link
              to="/trips"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Trip to {currentDistrictObj?.name || 'Sri Lanka'}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Trip to {currentDistrictObj?.name || 'Sri Lanka'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
