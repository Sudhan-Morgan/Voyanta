import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { destinationService } from '../../services/destinationService';
import {
  User,
  Mail,
  Phone,
  Heart,
  Camera,
  Upload,
  Trash2,
  Plus,
  Star,
  MapPin,
  Check,
  AlertCircle,
  Sparkles,
  Compass,
  Shield,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Globe,
  Tag,
  Bookmark,
  X,
  Sliders,
  Users,
  Copy
} from 'lucide-react';
import FriendsManagerTab from '../../components/profile/FriendsManagerTab';

// Curated Travel Avatars
const PRESET_AVATARS = [
  { id: 'wanderer', name: 'Wanderer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'explorer', name: 'Explorer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'backpacker', name: 'Backpacker', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
  { id: 'photographer', name: 'Photographer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { id: 'adventurer', name: 'Adventurer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
  { id: 'nomad', name: 'Nomad', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
  { id: 'solotraveler', name: 'Solo Traveler', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
  { id: 'classic', name: 'Default Modern', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' }
];

// Preset scenery options for favorite places
const PLACE_SCENERY_PRESETS = [
  { name: 'Sigiriya Rock Fortress', url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nine Arch Bridge (Ella)', url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mirissa Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Galle Colonial Fort', url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nuwara Eliya Tea Hills', url: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Yala Wildlife Leopard', url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80' }
];

// Quick suggestions for first-time favorites (Sri Lanka highlights)
const SUGGESTED_PLACES = [
  {
    name: 'Sigiriya (Lion Rock)',
    location: 'Central Province / Cultural Triangle',
    category: 'Heritage',
    description: 'Ancient 5th-century rock citadel with frescoes and palace ruins.',
    image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
    rating: 5
  },
  {
    name: 'Ella & Nine Arch Bridge',
    location: 'Uva Province / Hill Country',
    category: 'Mountain',
    description: 'Misty tea hills, blue colonial train rides, and lush pine valleys.',
    image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
    rating: 5
  },
  {
    name: 'Mirissa & Coconut Tree Hill',
    location: 'Southern Province',
    category: 'Beach',
    description: 'Golden palm-fringed bay, blue whale watching, and ocean sunsets.',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
    rating: 5
  },
  {
    name: 'Galle Fort & Lighthouse',
    location: 'Southern Province (Galle)',
    category: 'Heritage',
    description: '16th-century ocean ramparts, cobblestone alleys, and artisan shops.',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
    rating: 5
  },
  {
    name: 'Kandy & Temple of the Tooth Relic',
    location: 'Central Province',
    category: 'Heritage',
    description: 'Sacred mountain capital with lake walks and cultural temples.',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    rating: 5
  },
  {
    name: 'Jaffna & Casuarina Beach',
    location: 'Northern Province',
    category: 'Beach',
    description: 'Historic Nallur Kovil, shallow turquoise waters, and northern culture.',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=600&q=80',
    rating: 5
  }
];

const CATEGORIES = ['All', 'Beach', 'Mountain', 'Heritage', 'City', 'Nature', 'Wildlife', 'Adventure'];

export default function ProfilePage() {
  const { user, loading: authLoading, updateProfile, addFavoritePlace, removeFavoritePlace } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab from URL query param (e.g. /profile?tab=favorites)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['personal', 'favorites', 'preferences', 'security', 'friends'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('personal');
    }
  }, [location.search]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`, { replace: true });
  };

  // Load all Sri Lanka destinations from database
  const [allSriLankaDestinations, setAllSriLankaDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoadingDestinations(true);
        const data = await destinationService.getDestinations('all', '');
        setAllSriLankaDestinations(Array.isArray(data?.destinations) ? data.destinations : []);
      } catch (err) {
        console.error('Failed to load Sri Lanka destinations:', err);
      } finally {
        setLoadingDestinations(false);
      }
    };
    loadDestinations();
  }, []);

  // Personal Info Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: user?.profileImage || PRESET_AVATARS[0].url
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage || PRESET_AVATARS[0].url
      });
    }
  }, [user]);

  // Status feedback
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState('');
  const [personalError, setPersonalError] = useState('');

  // Image custom URL toggle
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Favorite Places Form & Filters
  const [favoritePlaces, setFavoritePlaces] = useState(
    Array.isArray(user?.favoritePlaces) ? user.favoritePlaces : []
  );
  useEffect(() => {
    if (Array.isArray(user?.favoritePlaces)) {
      setFavoritePlaces(user.favoritePlaces);
    }
  }, [user?.favoritePlaces]);

  const [placeSearch, setPlaceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [addingPlaceLoading, setAddingPlaceLoading] = useState(false);
  const [placeSuccessMsg, setPlaceSuccessMsg] = useState('');
  const [placeErrorMsg, setPlaceErrorMsg] = useState('');

  // Modal Autocomplete state
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const [newPlace, setNewPlace] = useState({
    name: '',
    location: '',
    category: 'Mountain',
    description: '',
    image: PLACE_SCENERY_PRESETS[0].url,
    rating: 5,
    notes: ''
  });

  // Preferences Form State
  const [preferences, setPreferences] = useState({
    interests: Array.isArray(user?.travelPreferences?.interests)
      ? user.travelPreferences.interests
      : ['culture', 'nature'],
    preferredPace: user?.travelPreferences?.preferredPace || 'moderate',
    budgetTier: user?.travelPreferences?.budgetTier || 'mid-range',
    dietaryNotes: user?.travelPreferences?.dietaryNotes || ''
  });

  useEffect(() => {
    if (user?.travelPreferences) {
      setPreferences({
        interests: Array.isArray(user.travelPreferences.interests)
          ? user.travelPreferences.interests
          : ['culture', 'nature'],
        preferredPace: user.travelPreferences.preferredPace || 'moderate',
        budgetTier: user.travelPreferences.budgetTier || 'mid-range',
        dietaryNotes: user.travelPreferences.dietaryNotes || ''
      });
    }
  }, [user?.travelPreferences]);

  const [savingPref, setSavingPref] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');

  // Security Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile image handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPersonalError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPersonalError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, profileImage: event.target.result }));
      setPersonalSuccess('Profile photo updated in preview! Click "Save Changes" to save.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url) => {
    setFormData((prev) => ({ ...prev, profileImage: url }));
    setPersonalSuccess('Avatar selected! Click "Save Changes" to save.');
  };

  const handleApplyCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData((prev) => ({ ...prev, profileImage: customImageUrl.trim() }));
    setShowUrlInput(false);
    setCustomImageUrl('');
    setPersonalSuccess('Custom image URL applied! Click "Save Changes" to save.');
  };

  // Save Personal Info & Contact
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    setPersonalSuccess('');
    setPersonalError('');

    try {
      if (!formData.name.trim()) throw new Error('Name cannot be empty.');
      if (!formData.email.trim()) throw new Error('Email cannot be empty.');

      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        profileImage: formData.profileImage
      });

      setPersonalSuccess('Profile, phone number, and photo updated successfully! ✨');
      setTimeout(() => setPersonalSuccess(''), 4000);
    } catch (err) {
      setPersonalError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSavingPersonal(false);
    }
  };

  // Check if a destination is already saved in favorites
  const isPlaceInFavorites = (destName) => {
    if (!favoritePlaces || !destName) return false;
    const nameLow = String(destName).toLowerCase().trim();
    const safeFavs = Array.isArray(favoritePlaces) ? favoritePlaces : [];
    return safeFavs.some((fp) => {
      if (!fp || !fp.name) return false;
      const fpLow = String(fp.name).toLowerCase().trim();
      return fpLow === nameLow || nameLow.includes(fpLow) || fpLow.includes(nameLow.split(' ')[0]);
    });
  };

  // Add Favorite Place Form Submit
  const handleAddFavoritePlace = async (e) => {
    e.preventDefault();
    if (!newPlace.name.trim()) {
      setPlaceErrorMsg('Please provide a place name.');
      return;
    }

    setAddingPlaceLoading(true);
    setPlaceErrorMsg('');
    setPlaceSuccessMsg('');

    try {
      const response = await addFavoritePlace(newPlace);
      setFavoritePlaces(response.user?.favoritePlaces || response.favoritePlaces || []);
      setPlaceSuccessMsg(`"${newPlace.name}" added to your Favorite Places! ❤️`);
      setShowAddPlaceModal(false);
      setModalSearchQuery('');
      setNewPlace({
        name: '',
        location: '',
        category: 'Mountain',
        description: '',
        image: PLACE_SCENERY_PRESETS[0].url,
        rating: 5,
        notes: ''
      });
      setTimeout(() => setPlaceSuccessMsg(''), 4000);
    } catch (err) {
      setPlaceErrorMsg(err.response?.data?.message || err.message || 'Failed to add place.');
    } finally {
      setAddingPlaceLoading(false);
    }
  };

  // 1-Click Quick Add Place to Favorites
  const handleQuickAddSuggested = async (placeObj) => {
    try {
      setPlaceSuccessMsg(`Adding "${placeObj.name}" to favorites...`);
      const response = await addFavoritePlace({
        name: placeObj.name,
        location: placeObj.location || placeObj.region || 'Sri Lanka',
        category:
          placeObj.category === 'culture'
            ? 'Heritage'
            : placeObj.category === 'beach'
            ? 'Beach'
            : placeObj.category === 'nature'
            ? 'Mountain'
            : placeObj.category === 'wildlife'
            ? 'Wildlife'
            : placeObj.category === 'adventure'
            ? 'Adventure'
            : placeObj.category || 'General',
        description: placeObj.description || '',
        image: placeObj.image || placeObj.imageUrls?.[0] || PLACE_SCENERY_PRESETS[0].url,
        rating: placeObj.rating || 5,
        notes: placeObj.practicalTips?.[0] || 'Added from Sri Lanka destinations'
      });
      setFavoritePlaces(response.user?.favoritePlaces || response.favoritePlaces || []);
      setPlaceSuccessMsg(`"${placeObj.name}" saved to your favorites! ❤️`);
      setTimeout(() => setPlaceSuccessMsg(''), 4000);
    } catch (err) {
      setPlaceErrorMsg(err.response?.data?.message || err.message || 'Failed to add place.');
    }
  };

  // Autocomplete selection in Modal
  const handleSelectAutocompletePlace = (dest) => {
    setNewPlace({
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
          : dest.category === 'adventure'
          ? 'Adventure'
          : 'General',
      description: dest.description || '',
      image: dest.imageUrls?.[0] || PLACE_SCENERY_PRESETS[0].url,
      rating: 5,
      notes: dest.practicalTips?.[0] || ''
    });
    setModalSearchQuery(dest.name);
  };

  // Remove Favorite Place
  const handleRemovePlace = async (placeId, placeName) => {
    if (!window.confirm(`Are you sure you want to remove "${placeName}" from your favorites?`)) {
      return;
    }

    try {
      const response = await removeFavoritePlace(placeId);
      setFavoritePlaces(response.user?.favoritePlaces || response.favoritePlaces || []);
      setPlaceSuccessMsg(`Removed "${placeName}" from favorites.`);
      setTimeout(() => setPlaceSuccessMsg(''), 3000);
    } catch (err) {
      setPlaceErrorMsg(err.response?.data?.message || err.message || 'Failed to remove place.');
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPref(true);
    setPrefSuccess('');
    setPrefError('');

    try {
      await updateProfile({ travelPreferences: preferences });
      setPrefSuccess('Travel preferences updated successfully! 🌍');
      setTimeout(() => setPrefSuccess(''), 4000);
    } catch (err) {
      setPrefError(err.response?.data?.message || err.message || 'Failed to update preferences.');
    } finally {
      setSavingPref(false);
    }
  };

  const toggleInterest = (interest) => {
    setPreferences((prev) => {
      const currentInterests = Array.isArray(prev.interests) ? prev.interests : [];
      const exists = currentInterests.includes(interest);
      if (exists) {
        return { ...prev, interests: currentInterests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
  };

  // Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswordSuccess('Password updated successfully! Keep it safe.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Filter saved favorite places by user search & category
  const safeFavoritePlaces = Array.isArray(favoritePlaces) ? favoritePlaces : [];
  const filteredSavedPlaces = safeFavoritePlaces.filter((place) => {
    if (!place) return false;
    const q = (placeSearch || '').toLowerCase().trim();
    const pName = String(place.name || '').toLowerCase();
    const pLoc = String(place.location || '').toLowerCase();
    const pDesc = String(place.description || '').toLowerCase();
    const matchesSearch =
      !q ||
      pName.includes(q) ||
      pLoc.includes(q) ||
      pDesc.includes(q);
    const matchesCategory =
      selectedCategory === 'All' || String(place.category || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Filter all Sri Lanka destinations when user types in search bar
  const safeDestinations = Array.isArray(allSriLankaDestinations) ? allSriLankaDestinations : [];
  const matchingSriLankaPlaces = (placeSearch || '').trim()
    ? safeDestinations.filter((dest) => {
        if (!dest) return false;
        const q = placeSearch.toLowerCase().trim();
        const dName = String(dest.name || '').toLowerCase();
        const dRegion = String(dest.region || '').toLowerCase();
        const dDesc = String(dest.description || '').toLowerCase();
        const dCat = String(dest.category || '').toLowerCase();
        return (
          dName.includes(q) ||
          dRegion.includes(q) ||
          dDesc.includes(q) ||
          dCat.includes(q)
        );
      })
    : [];

  // Filter for Sri Lanka Explore Catalog in Favorites Tab
  const [catalogCategory, setCatalogCategory] = useState('All');
  const catalogPlaces = safeDestinations.filter((dest) => {
    if (!dest) return false;
    if (catalogCategory === 'All') return true;
    const catMap = {
      Beach: 'beach',
      Mountain: 'nature',
      Heritage: 'culture',
      Wildlife: 'wildlife',
      Adventure: 'adventure',
      City: 'city'
    };
    return dest.category === catMap[catalogCategory];
  });

  // Autocomplete filtered list in Add Place modal
  const autocompleteSuggestions = (modalSearchQuery || '').trim()
    ? safeDestinations
        .filter((d) => {
          if (!d) return false;
          const q = modalSearchQuery.toLowerCase().trim();
          const dName = String(d.name || '').toLowerCase();
          const dRegion = String(d.region || '').toLowerCase();
          return dName.includes(q) || dRegion.includes(q);
        })
        .slice(0, 5)
    : [];

  if (!user) {
    if (authLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your profile...</p>
        </div>
      );
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to Access Your Profile</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to view and edit your profile, travel friends, favorite places, and settings.
        </p>
        <Link
          to="/login?redirect=/profile"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          Sign In to Voyanta &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-xl shadow-indigo-500/15 overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Camera Icon Badge */}
          <div className="relative group">
            <img
              src={formData.profileImage || PRESET_AVATARS[0].url}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white/30 shadow-2xl transition-transform group-hover:scale-105"
            />
            <label
              htmlFor="hero-avatar-file"
              title="Click to change profile picture"
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer shadow-lg ring-2 ring-white transition-all hover:scale-110"
            >
              <Camera className="w-4 h-4" />
              <input
                id="hero-avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* User Info Details */}
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sri Lanka Traveler 🇱🇰</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {user?.name || 'My Profile'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-indigo-100">
              <span className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-1 rounded-lg">
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-1 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-indigo-300" />
                {user?.phoneNumber ? user.phoneNumber : 'No phone added yet'}
              </span>
              <span className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-1 rounded-lg">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300/30" />
                {favoritePlaces.length} Favorite {favoritePlaces.length === 1 ? 'Place' : 'Places'}
              </span>

              {/* Unique User ID Badge */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/25">
                <span className="font-mono font-bold tracking-wide text-white text-xs">
                  User ID: #{user?.userNumber || '------'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (user?.userNumber) {
                      navigator.clipboard.writeText(user.userNumber.toString());
                      alert(`User ID #${user.userNumber} copied to clipboard!`);
                    }
                  }}
                  className="text-amber-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy User ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                switchTab('favorites');
                setShowAddPlaceModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Favorite Place
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 border border-white/20 text-white text-sm font-semibold transition-all"
            >
              <Compass className="w-4 h-4" />
              Explore Sri Lanka
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => switchTab('personal')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'personal'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Contact Info
        </button>

        <button
          onClick={() => switchTab('favorites')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'favorites'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          Favorite Places
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 font-bold">
            {favoritePlaces.length}
          </span>
        </button>

        <button
          onClick={() => switchTab('preferences')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'preferences'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Travel Preferences
        </button>

        <button
          onClick={() => switchTab('friends')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'friends'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          Friends & Connections
        </button>

        <button
          onClick={() => switchTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* ================= TAB 1: PROFILE & CONTACT INFO ================= */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Picture Management */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Update Profile Picture
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an image from your device, choose a traveler avatar, or link a photo URL.
                </p>
              </div>

              {/* Photo Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <img
                  src={formData.profileImage}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
                />
                <div className="text-center">
                  <span className="text-xs font-medium text-slate-700 block">Current Photo Preview</span>
                  <span className="text-[11px] text-slate-400">JPG, PNG, or WEBP up to 5MB</span>
                </div>
              </div>

              {/* Upload Actions */}
              <div className="space-y-3">
                <label
                  htmlFor="avatar-file-upload"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 text-sm font-semibold cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload from Device
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {showUrlInput ? 'Hide URL Input' : 'Use Image URL'}
                </button>

                {showUrlInput && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Preset Avatars Grid */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Or Pick a Travel Avatar
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((avatar) => {
                    const isSelected = formData.profileImage === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(avatar.url)}
                        className={`relative rounded-xl overflow-hidden p-1 transition-all ${
                          isSelected ? 'ring-2 ring-indigo-600 scale-105 shadow-sm' : 'hover:opacity-80'
                        }`}
                        title={avatar.name}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-12 rounded-lg object-cover" />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white p-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Name, Email & Phone Number Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSavePersonalInfo} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal & Contact Details</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Update your display name, login email address, and phone number for travel communications.
                </p>
              </div>

              {personalSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{personalSuccess}</span>
                </div>
              )}

              {personalError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{personalError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. traveler@voyanta.com"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    This email is used to log in and receive itinerary confirmation emails.
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+94 77 123 4567 or +91 98765 43210"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used for trip alerts, SMS notifications, and hotel check-in updates.
                  </p>
                </div>
              </div>

              {/* Form Submission */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPersonal}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                >
                  {savingPersonal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Updates...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FAVORITE PLACES ================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-8">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                My Favorite Places ({favoritePlaces.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Save your dream Sri Lanka destinations, beaches, mountain peaks, and cultural ruins. Search for ANY place in Sri Lanka below!
              </p>
            </div>

            <button
              onClick={() => {
                setModalSearchQuery('');
                setShowAddPlaceModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Favorite Place
            </button>
          </div>

          {placeSuccessMsg && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{placeSuccessMsg}</span>
            </div>
          )}

          {placeErrorMsg && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{placeErrorMsg}</span>
            </div>
          )}

          {/* Real-time Sri Lanka Search & Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search input with live clear */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ANY Sri Lanka place (e.g. Kandy, Jaffna, Bentota, Sigiriya, Mirissa)..."
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {placeSearch && (
                  <button
                    onClick={() => setPlaceSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Keyword Shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
              <span className="font-semibold text-slate-700">Quick Search:</span>
              {['Sigiriya', 'Ella', 'Mirissa', 'Galle', 'Kandy', 'Jaffna', 'Nuwara Eliya', 'Bentota', 'Trincomalee', 'Yala', 'Colombo'].map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setPlaceSearch(keyword)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    placeSearch.toLowerCase() === keyword.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* ================= SECTION A: MATCHING SRI LANKA DESTINATIONS FROM DATABASE ================= */}
          {placeSearch.trim() && matchingSriLankaPlaces.length > 0 && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-3xl border border-indigo-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Sri Lanka Places Matching "{placeSearch}" ({matchingSriLankaPlaces.length})
                  </h3>
                  <p className="text-xs text-slate-500">Click "+ Add to Favorites" to immediately bookmark any of these places!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {matchingSriLankaPlaces.map((dest) => {
                  const alreadySaved = isPlaceInFavorites(dest.name);
                  return (
                    <div
                      key={dest._id || dest.name}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-36 overflow-hidden bg-slate-100">
                        <img
                          src={dest.imageUrls?.[0] || PLACE_SCENERY_PRESETS[0].url}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-700 shadow-xs uppercase">
                          {dest.category}
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{dest.name}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{dest.region}</span>
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{dest.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                          <Link
                            to={`/ai-planner?destination=${encodeURIComponent(dest.name)}`}
                            className="text-[11px] font-bold text-indigo-600 hover:underline"
                          >
                            Plan Trip →
                          </Link>

                          {alreadySaved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <Check className="w-3 h-3" /> Saved ❤️
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickAddSuggested(dest)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add to Favorites
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION B: USER'S SAVED FAVORITES ================= */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>My Saved Favorites ({filteredSavedPlaces.length})</span>
              {placeSearch && (
                <span className="text-xs font-normal text-slate-500">Filtered by: "{placeSearch}"</span>
              )}
            </h3>

            {filteredSavedPlaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSavedPlaces.map((place) => (
                  <div
                    key={place._id || place.name}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Place Image */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={place.image || PLACE_SCENERY_PRESETS[0].url}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-600" />
                          {place.category || 'Travel'}
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[11px] font-bold text-amber-600 shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {place.rating || 5}.0
                        </div>
                      </div>

                      {/* Place Body */}
                      <div className="p-5 space-y-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {place.name}
                        </h4>
                        {place.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {place.location}
                          </p>
                        )}
                        {place.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 pt-1">{place.description}</p>
                        )}
                        {place.notes && (
                          <div className="text-[11px] text-indigo-700 bg-indigo-50/70 p-2 rounded-lg mt-2">
                            <strong>Note:</strong> {place.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Place Actions */}
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/ai-planner?destination=${encodeURIComponent(place.name)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Plan Trip Here
                      </Link>

                      <button
                        onClick={() => handleRemovePlace(place._id, place.name)}
                        title="Remove from favorites"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Saved Places State */
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    {placeSearch ? `No saved favorites match "${placeSearch}"` : 'You haven\'t saved any favorite places yet'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {placeSearch
                      ? 'Check the Sri Lanka destinations section above to add it with one click!'
                      : 'Explore the destinations below or click any suggestion to add it to your collection!'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= SECTION C: BROWSE & ADD POPULAR SRI LANKA DESTINATIONS ================= */}
          <div className="pt-6 border-t border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Explore & Bookmark Sri Lanka Destinations 🇱🇰 ({allSriLankaDestinations.length}+ Places)
                </h3>
                <p className="text-xs text-slate-500">
                  Click "+ Add" on any place to instantly bookmark it to your Profile Favorites.
                </p>
              </div>

              {/* Catalog category pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Beach', 'Mountain', 'Heritage', 'Wildlife', 'Adventure', 'City'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      catalogCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {catalogPlaces.slice(0, 16).map((dest) => {
                const saved = isPlaceInFavorites(dest.name);
                return (
                  <div
                    key={dest._id || dest.name}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left hover:border-indigo-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
                  >
                    <div className="relative h-32 overflow-hidden bg-slate-100">
                      <img
                        src={dest.imageUrls?.[0] || PLACE_SCENERY_PRESETS[0].url}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-indigo-700 uppercase">
                        {dest.category}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{dest.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          {dest.region}
                        </p>
                      </div>

                      {saved ? (
                        <div className="w-full py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1 border border-emerald-200">
                          <Check className="w-3 h-3" /> In Favorites ❤️
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAddSuggested(dest)}
                          className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Favorites
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= ADD PLACE MODAL WITH AUTOCOMPLETE ================= */}
          {showAddPlaceModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      Add Favorite Place in Sri Lanka
                    </h3>
                    <p className="text-xs text-slate-500">Pick any Sri Lanka place or enter custom details.</p>
                  </div>
                  <button
                    onClick={() => setShowAddPlaceModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Instant Autocomplete search for Sri Lanka places */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700">
                    🔍 Quick Search Any Sri Lanka Place (Auto-fills details)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type Kandy, Ella, Jaffna, Sigiriya, Mirissa, Bentota..."
                      value={modalSearchQuery}
                      onChange={(e) => {
                        setModalSearchQuery(e.target.value);
                        setNewPlace((prev) => ({ ...prev, name: e.target.value }));
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {autocompleteSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
                      {autocompleteSuggestions.map((sug) => (
                        <button
                          key={sug._id || sug.name}
                          type="button"
                          onClick={() => handleSelectAutocompletePlace(sug)}
                          className="w-full p-2.5 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={sug.imageUrls?.[0] || PLACE_SCENERY_PRESETS[0].url}
                            alt={sug.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="overflow-hidden flex-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">{sug.name}</span>
                            <span className="text-[11px] text-slate-500 block truncate">{sug.region}</span>
                          </div>
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded-md">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddFavoritePlace} className="space-y-4 pt-2">
                  {/* Place Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Place Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sigiriya Rock, Kandy Temple, Mirissa Beach"
                      value={newPlace.name}
                      onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Location / Province
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Central Province / Cultural Triangle"
                      value={newPlace.location}
                      onChange={(e) => setNewPlace({ ...newPlace, location: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Category & Star Rating */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newPlace.category}
                        onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="Mountain">Mountain 🏔️</option>
                        <option value="Beach">Beach 🏖️</option>
                        <option value="Heritage">Heritage 🏛️</option>
                        <option value="Wildlife">Wildlife 🐘</option>
                        <option value="Nature">Nature 🌲</option>
                        <option value="Adventure">Adventure 🏄‍♂️</option>
                        <option value="City">City 🏙️</option>
                        <option value="General">General 🌍</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center gap-1 pt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewPlace({ ...newPlace, rating: star })}
                            className="p-0.5 text-amber-400 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newPlace.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scenery Photo Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Scenic Photo Preview or Custom Image URL
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLACE_SCENERY_PRESETS.map((preset) => {
                        const isSelected = newPlace.image === preset.url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setNewPlace({ ...newPlace, image: preset.url })}
                            className={`relative rounded-xl overflow-hidden h-14 border transition-all ${
                              isSelected ? 'ring-2 ring-indigo-600 scale-102' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] py-0.5 px-1 truncate block text-center">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="url"
                      placeholder="Or enter custom image URL (https://...)"
                      value={newPlace.image}
                      onChange={(e) => setNewPlace({ ...newPlace, image: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 mt-1"
                    />
                  </div>

                  {/* Personal Notes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Personal Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Best sunset view, loved the blue train ride..."
                      value={newPlace.notes}
                      onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPlaceModal(false)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingPlaceLoading}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                    >
                      {addingPlaceLoading ? 'Saving...' : 'Add to Favorites'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TRAVEL PREFERENCES ================= */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Travel Preferences & AI Trip Customization
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Voyanta’s AI engine uses these preferences to tailor personalized itineraries, attractions, and hotels across Sri Lanka.
            </p>
          </div>

          {prefSuccess && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{prefSuccess}</span>
            </div>
          )}

          {prefError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{prefError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Preferred Pace */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Travel Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', title: 'Relaxed 🧘‍♂️', desc: '1-2 key activities per day, plenty of leisure time' },
                  { id: 'moderate', title: 'Moderate 🚶‍♂️', desc: 'Balanced mix of sightseeing, dining, and relaxing' },
                  { id: 'fast-paced', title: 'Fast-Paced ⚡', desc: 'Pack as many sights and experiences as possible' }
                ].map((pace) => {
                  const isSelected = preferences.preferredPace === pace.id;
                  return (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, preferredPace: pace.id })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-slate-900">{pace.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pace.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Tier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Budget Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'budget', title: 'Budget 🎒', desc: 'Hostels, public transit, street food & free sights' },
                  { id: 'mid-range', title: 'Mid-Range 🏨', desc: 'Boutique stays, casual dining, standard tours' },
                  { id: 'luxury', title: 'Luxury ✨', desc: '5-star resorts, fine dining, private guides' }
                ].map((tier) => {
                  const isSelected = preferences.budgetTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, budgetTier: tier.id })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-slate-900">{tier.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Interests & Activities (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'culture',
                  'nature',
                  'beach',
                  'food',
                  'adventure',
                  'history',
                  'nightlife',
                  'photography',
                  'hiking',
                  'wildlife',
                  'shopping',
                  'relaxation'
                ].map((interest) => {
                  const isSelected = (preferences?.interests || []).includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                        isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary & Travel Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dietary & Special Travel Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Vegetarian, Halal, Sri Lankan spicy food lover, tea estate visits..."
                value={preferences.dietaryNotes}
                onChange={(e) => setPreferences({ ...preferences, dietaryNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingPref}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {savingPref ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Travel Preferences
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: SECURITY ================= */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className="max-w-xl bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Account Security & Password
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ensure your account is using a strong password of at least 6 characters.
            </p>
          </div>

          {passwordSuccess && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {savingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 5: FRIENDS & CONNECTIONS ================= */}
      {activeTab === 'friends' && (
        <FriendsManagerTab />
      )}
    </div>
  );
}
