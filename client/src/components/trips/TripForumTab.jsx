import React, { useState, useEffect, useRef } from 'react';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  Heart,
  Trash2,
  Users,
  Compass,
  MapPin,
  Utensils,
  Hotel,
  DollarSign,
  Loader2,
  Sparkles,
  Smile,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TripForumTab({ trip, members = [] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [activeFilter, setActiveFilter] = useState('all');
  const chatEndRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Topics', icon: MessageSquare },
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'itinerary', label: 'Places & Itinerary', icon: MapPin },
    { id: 'stay', label: 'Hotels & Stay', icon: Hotel },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'expenses', label: 'Budget & Cost', icon: DollarSign }
  ];

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await tripService.getTripMessages(trip._id);
      if (res?.data) {
        setMessages(res.data);
      }
    } catch (err) {
      if (!silent) setError('Failed to load discussion messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 8 seconds for new messages in discussion
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [trip._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || sending) return;

    try {
      setSending(true);
      setError('');
      const res = await tripService.createTripMessage(trip._id, {
        message: newMessageText.trim(),
        category: selectedCategory
      });
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessageText('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post message');
    } finally {
      setSending(false);
    }
  };

  const handleToggleLike = async (messageId) => {
    try {
      const res = await tripService.toggleLikeTripMessage(trip._id, messageId);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m._id === messageId) {
              const currentUserId = user?._id || user?.id;
              const hasLiked = m.likes?.some((id) => id.toString() === currentUserId?.toString());
              const updatedLikes = hasLiked
                ? m.likes.filter((id) => id.toString() !== currentUserId?.toString())
                : [...(m.likes || []), currentUserId];
              return { ...m, likes: updatedLikes };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await tripService.deleteTripMessage(trip._id, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'itinerary':
        return { label: 'Places & Itinerary', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'stay':
        return { label: 'Hotels & Stay', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'food':
        return { label: 'Food & Dining', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'expenses':
        return { label: 'Budget & Cost', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'General', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  const isOwner = trip.ownerId?._id === user?._id || trip.ownerId === user?._id;
  const currentUserIdStr = (user?._id || user?.id)?.toString();

  const quickStarters = [
    { text: 'What time are we heading out on Day 1?', cat: 'itinerary' },
    { text: 'Any hotel or villa recommendations for our stay?', cat: 'stay' },
    { text: 'Where should we stop for lunch or seafood?', cat: 'food' },
    { text: 'Shall we split the transport and fuel costs equally?', cat: 'expenses' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[750px]">
      {/* Forum Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Trip Discussion Forum</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              {messages.length} messages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discuss stops, suggest spots, agree on budgets, and plan with your travel crew in real-time.
          </p>
        </div>

        {/* Crew Avatars Stack */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Crew:</span>
          <div className="flex -space-x-2 overflow-hidden">
            {members.slice(0, 5).map((m) => (
              <img
                key={m._id}
                title={`${m.userId?.name || 'Member'} (#${m.userId?.userNumber || 'N/A'})`}
                src={m.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={m.userId?.name}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
              />
            ))}
            {members.length > 5 && (
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white text-[10px] font-bold text-slate-700">
                +{members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeFilter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveFilter(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading travel crew discussions...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Start the Discussion!</h4>
              <p className="text-xs text-slate-500 mt-1">
                No messages in this topic yet. Say hello or use one of the quick starters below to plan your trip together.
              </p>
            </div>

            {/* Quick Starter Suggestions */}
            <div className="w-full space-y-2 pt-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Quick Discussion Starters:
              </p>
              {quickStarters.map((qs, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNewMessageText(qs.text);
                    setSelectedCategory(qs.cat);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs text-slate-700 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>"{qs.text}"</span>
                  <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId?._id?.toString() === currentUserIdStr;
            const badge = getCategoryBadge(msg.category);
            const hasLiked = msg.likes?.some((id) => id.toString() === currentUserIdStr);

            return (
              <div
                key={msg._id}
                className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Author Avatar */}
                <img
                  src={
                    msg.senderId?.profileImage ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={msg.senderId?.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                />

                <div className={`max-w-xl flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name + User ID + Time */}
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-900">
                      {msg.senderId?.name || 'Traveler'}
                    </span>
                    {msg.senderId?.userNumber && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-[10px] font-mono font-bold text-slate-600">
                        #{msg.senderId.userNumber}
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 shadow-xs text-sm relative leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Category Tag inside message */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          isMe
                            ? 'bg-white/20 text-white border-white/30'
                            : badge.bg
                        }`}
                      >
                        {badge.label}
                      </span>

                      {/* Delete button (author or trip owner) */}
                      {(isMe || isOwner) && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 cursor-pointer ${
                            isMe ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                          }`}
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>

                  {/* Like Button */}
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <button
                      onClick={() => handleToggleLike(msg._id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        hasLiked ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{msg.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Composer Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white space-y-3">
        {error && (
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Topic Selector */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Topic:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="general">✨ General Chat</option>
            <option value="itinerary">📍 Places & Itinerary</option>
            <option value="stay">🏨 Hotels & Stay</option>
            <option value="food">🍽️ Food & Dining</option>
            <option value="expenses">💰 Budget & Cost</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Share thoughts with travel crew on ${selectedCategory}... (Press Enter to send)`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none transition-all"
          />

          <button
            type="submit"
            disabled={!newMessageText.trim() || sending}
            className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
