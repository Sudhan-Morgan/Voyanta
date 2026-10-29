import React, { useState, useEffect, useRef } from 'react';
import { journalService } from '../../services/journalService';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Camera,
  Image as ImageIcon,
  Plus,
  Heart,
  Calendar,
  MapPin,
  Trash2,
  Edit3,
  X,
  UploadCloud,
  Smile,
  Sparkles,
  Tag,
  Share2,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const MOOD_META = {
  excited: { label: 'Excited', emoji: '🤩', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  adventurous: { label: 'Adventurous', emoji: '🥾', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  peaceful: { label: 'Peaceful', emoji: '🌿', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  relaxed: { label: 'Relaxed', emoji: '🍹', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  romantic: { label: 'Romantic', emoji: '💖', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  happy: { label: 'Happy', emoji: '😊', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  grateful: { label: 'Grateful', emoji: '🙏', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
};

export default function TripJournalTab({ trip, members = [] }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'

  // Lightbox State
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    photos: [],
    currentIndex: 0,
    title: ''
  });

  // Modal Form State
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    locationName: trip.destination || '',
    date: new Date().toISOString().split('T')[0],
    mood: 'happy',
    photos: [], // [{ url: '', caption: '' }]
    tagsInput: ''
  });

  const fileInputRef = useRef(null);

  const loadJournal = async () => {
    try {
      setLoading(true);
      const res = await journalService.getTripJournal(trip._id);
      if (res.success && res.data) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error('Failed to load travel journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?._id) {
      loadJournal();
    }
  }, [trip?._id]);

  const handleOpenAddModal = () => {
    setEditingEntryId(null);
    setFormData({
      title: '',
      notes: '',
      locationName: trip.destination || '',
      date: new Date().toISOString().split('T')[0],
      mood: 'happy',
      photos: [],
      tagsInput: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (entry) => {
    setEditingEntryId(entry._id);
    setFormData({
      title: entry.title,
      notes: entry.notes,
      locationName: entry.locationName || '',
      date: new Date(entry.date).toISOString().split('T')[0],
      mood: entry.mood || 'happy',
      photos: entry.photos || [],
      tagsInput: (entry.tags || []).join(', ')
    });
    setModalOpen(true);
  };

  // Handle local photo files upload via base64 data-URL
  const handlePhotoFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      // Ensure file is image and under 8MB
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, { url: event.target.result, caption: '' }]
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (idx) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const handlePhotoCaptionChange = (idx, caption) => {
    setFormData((prev) => {
      const updated = [...prev.photos];
      updated[idx].caption = caption;
      return { ...prev, photos: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.notes.trim()) {
      alert('Please provide a title and travel notes.');
      return;
    }

    try {
      setSubmitting(true);
      const tagsArray = formData.tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        notes: formData.notes.trim(),
        locationName: formData.locationName.trim(),
        date: formData.date,
        mood: formData.mood,
        photos: formData.photos,
        tags: tagsArray
      };

      if (editingEntryId) {
        await journalService.updateJournalEntry(trip._id, editingEntryId, payload);
      } else {
        await journalService.createJournalEntry(trip._id, payload);
      }

      setModalOpen(false);
      loadJournal();
    } catch (err) {
      console.error('Save journal entry error:', err);
      alert(err.response?.data?.message || 'Failed to save memory.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await journalService.deleteJournalEntry(trip._id, entryId);
      loadJournal();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete memory.');
    }
  };

  const handleToggleLike = async (entryId) => {
    try {
      // Optimistic update
      setEntries((prev) =>
        prev.map((item) => {
          if (item._id === entryId) {
            const hasLiked = (item.likes || []).some(
              (u) => (u._id || u)?.toString() === user?._id?.toString()
            );
            const updatedLikes = hasLiked
              ? item.likes.filter((u) => (u._id || u)?.toString() !== user?._id?.toString())
              : [...(item.likes || []), { _id: user?._id, name: user?.name }];
            return { ...item, likes: updatedLikes };
          }
          return item;
        })
      );
      await journalService.toggleLikeEntry(trip._id, entryId);
    } catch (err) {
      console.error('Like error:', err);
      loadJournal();
    }
  };

  // Open Lightbox
  const openLightbox = (photos, index, title) => {
    setLightbox({
      isOpen: true,
      photos,
      currentIndex: index,
      title
    });
  };

  const nextLightboxPhoto = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length
    }));
  };

  const prevLightboxPhoto = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
    }));
  };

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery.trim() ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.locationName && entry.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;

    return matchesSearch && matchesMood;
  });

  const totalPhotos = entries.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Journal Stats */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white p-7 sm:p-9 overflow-hidden shadow-lg shadow-rose-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-200">
            <BookOpen className="w-3.5 h-3.5" />
            Trip Travel Journal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Memories & Photo Log
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-medium">
            Chronicle everyday travel stories, upload photos from the road, note memorable local dishes, and cherish moments with companions.
          </p>
        </div>

        {/* Stats & Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-200 block">Memories</span>
              <span className="text-lg font-black">{entries.length}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-200 block">Photos</span>
              <span className="text-lg font-black">{totalPhotos}</span>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-amber-50 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-rose-600 stroke-[3]" />
            Add New Memory
          </button>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, places, tags..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Mood Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedMood === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Moods
          </button>
          {Object.entries(MOOD_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedMood(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedMood === key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Memory Feed / Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          Loading your travel memories...
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-3xl border border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Travel Journal is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Snap photos, record little moments, favorite cafe spots, and travel notes with your trip crew.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const moodInfo = MOOD_META[entry.mood] || MOOD_META.happy;
            const author = entry.authorId || {};
            const isAuthor = author._id?.toString() === user?._id?.toString();
            const hasLiked = (entry.likes || []).some(
              (u) => (u._id || u)?.toString() === user?._id?.toString()
            );

            return (
              <div
                key={entry._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Collage / Hero Image */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="relative bg-slate-950 overflow-hidden cursor-pointer">
                      {entry.photos.length === 1 ? (
                        <div
                          onClick={() => openLightbox(entry.photos, 0, entry.title)}
                          className="h-56 w-full overflow-hidden"
                        >
                          <img
                            src={entry.photos[0].url}
                            alt={entry.photos[0].caption || entry.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {entry.photos[0].caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-[11px] text-white/90 truncate">
                              {entry.photos[0].caption}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => openLightbox(entry.photos, 0, entry.title)}
                          className="h-56 grid grid-cols-2 gap-0.5 overflow-hidden"
                        >
                          <img
                            src={entry.photos[0].url}
                            alt="photo-1"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="relative h-full">
                            <img
                              src={entry.photos[1].url}
                              alt="photo-2"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {entry.photos.length > 2 && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-sm">
                                +{entry.photos.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    {/* Header meta */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={author.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={author.name}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-50 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {author.name || 'Traveler'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Mood Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${moodInfo.bg}`}>
                        <span>{moodInfo.emoji}</span>
                        <span>{moodInfo.label}</span>
                      </span>
                    </div>

                    {/* Location Pin */}
                    {entry.locationName && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{entry.locationName}</span>
                      </div>
                    )}

                    {/* Title & Notes */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {entry.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                        {entry.notes}
                      </p>
                    </div>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Likes reaction */}
                  <button
                    onClick={() => handleToggleLike(entry._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      hasLiked
                        ? 'text-rose-600 bg-rose-50 font-bold'
                        : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{entry.likes?.length || 0}</span>
                  </button>

                  {/* Edit / Delete actions */}
                  <div className="flex items-center gap-1">
                    {isAuthor && (
                      <button
                        onClick={() => handleOpenEditModal(entry)}
                        title="Edit memory"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(isAuthor || trip.ownerId === user?._id) && (
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        title="Delete memory"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MEMORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" />
                {editingEntryId ? 'Edit Travel Memory' : 'Add Travel Memory & Photos'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload Zone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Photos & Visuals
                </label>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/40 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-rose-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to upload photos from device / camera
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PNG, JPG, JPEG, WEBP (Multiple files allowed)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handlePhotoFilesSelect}
                    className="hidden"
                  />
                </div>

                {/* Thumbnails of uploaded photos */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                        <img
                          src={photo.url}
                          alt={`preview-${idx}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => handlePhotoCaptionChange(idx, e.target.value)}
                          placeholder="Add caption..."
                          className="w-full text-[10px] px-2 py-1 bg-white/90 border-t border-slate-200 focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sunrise at Nine Arch Bridge, Ella"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g. Ella, Mirissa Beach, Sigiriya..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Trip Mood & Vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MOOD_META).map(([key, meta]) => {
                    const isSelected = formData.mood === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormData({ ...formData, mood: key })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs scale-105 ring-2 ring-indigo-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Notes / Story */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Travel Notes, Story & Thoughts *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What happened today? Best food, scenic views, funny moments with the crew, secret tips..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="e.g. train, sunset, coffee, hiking, beach"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving Memory...' : editingEntryId ? 'Update Memory' : 'Save to Journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PHOTO VIEWER */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="text-xs font-bold">
              <span>{lightbox.title}</span>
              <span className="text-slate-400 ml-2">
                ({lightbox.currentIndex + 1} of {lightbox.photos.length})
              </span>
            </div>
            <button
              onClick={() => setLightbox({ ...lightbox, isOpen: false })}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Center Display */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            {lightbox.photos.length > 1 && (
              <button
                onClick={prevLightboxPhoto}
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={lightbox.photos[lightbox.currentIndex]?.url}
              alt="fullscreen-view"
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />

            {lightbox.photos.length > 1 && (
              <button
                onClick={nextLightboxPhoto}
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption */}
          <div className="text-center text-xs text-slate-300 pb-2">
            {lightbox.photos[lightbox.currentIndex]?.caption || lightbox.title}
          </div>
        </div>
      )}
    </div>
  );
}

