import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  X,
  Copy,
  Check,
  Trash2,
  Compass,
  Sparkles,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Share2
} from 'lucide-react';

export default function FriendsManagerTab() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  const fetchFriendData = async () => {
    try {
      setLoading(true);
      const res = await friendService.getFriends();
      const friendsList = res?.friends || res?.data?.friends || [];
      const incoming = res?.incomingRequests || res?.data?.incomingRequests || [];
      const outgoing = res?.outgoingRequests || res?.data?.outgoingRequests || [];
      setFriends(Array.isArray(friendsList) ? friendsList : []);
      setIncomingRequests(Array.isArray(incoming) ? incoming : []);
      setOutgoingRequests(Array.isArray(outgoing) ? outgoing : []);
    } catch (err) {
      console.error('Fetch friends error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, []);

  const handleCopyId = () => {
    if (user?.userNumber) {
      navigator.clipboard.writeText(user.userNumber.toString());
      setCopiedId(true);
      setFeedbackMsg({ text: `User ID #${user.userNumber} copied to clipboard!`, type: 'success' });
      setTimeout(() => {
        setCopiedId(false);
        setFeedbackMsg({ text: '', type: '' });
      }, 3000);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const res = await friendService.searchUsers(searchQuery.trim());
      if (res?.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setFeedbackMsg({ text: 'Search failed. Please try again.', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetUser) => {
    try {
      setActionLoadingId(targetUser._id);
      const res = await friendService.sendFriendRequest({
        targetUserId: targetUser._id,
        userNumber: targetUser.userNumber
      });
      setFeedbackMsg({ text: res.message || 'Friend request sent!', type: 'success' });

      // Update search result status
      setSearchResults((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, relationship: 'pending_sent' } : u))
      );
      fetchFriendData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setFeedbackMsg({
        text: err.response?.data?.message || 'Failed to send friend request',
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      setActionLoadingId(requestId);
      const res = await friendService.respondFriendRequest(requestId, action);
      setFeedbackMsg({ text: res.message, type: 'success' });
      fetchFriendData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setFeedbackMsg({
        text: err.response?.data?.message || 'Failed to process request',
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }
    try {
      await friendService.removeFriend(friendshipId);
      setFeedbackMsg({ text: `Removed ${friendName} from friends.`, type: 'success' });
      fetchFriendData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setFeedbackMsg({
        text: err.response?.data?.message || 'Failed to remove friend',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedbackMsg.text && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ text: '', type: '' })}
            className="p-1 hover:bg-black/5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. YOUR UNIQUE USER ID SHOWCASE CARD */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-900/10 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voyanta Traveler Identity</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Your Voyanta User ID Number
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Give this unique 6-digit number to your friends, couple partner, or group travelers so they can easily find and add you on Voyanta!
          </p>
        </div>

        {/* User ID Highlight Display */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 block">
              Unique User ID
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
              #{user?.userNumber || '------'}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
          >
            {copiedId ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. SEARCH & ADD FRIENDS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Find & Add Friends on Voyanta
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Search any traveler by their 6-digit User ID Number, name, or email address.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Enter 6-digit User ID Number (e.g. 104829), name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Found Travelers ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchResults([])}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((userResult) => {
                const isLoading = actionLoadingId === userResult._id;
                return (
                  <div
                    key={userResult._id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-white shadow-xs flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={
                          userResult.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={userResult.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-50 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{userResult.name}</h4>
                          {userResult.userNumber && (
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-100 shrink-0">
                              #{userResult.userNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {userResult.email}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {userResult.relationship === 'friends' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Friends
                        </span>
                      ) : userResult.relationship === 'pending_sent' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Sent
                        </span>
                      ) : userResult.relationship === 'pending_received' ? (
                        <button
                          onClick={() => handleRespondRequest(userResult.requestId, 'accept')}
                          disabled={isLoading}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Accept
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(userResult)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Friend</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. PENDING FRIEND REQUESTS (Incoming & Outgoing) */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  Incoming Friend Requests
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {incomingRequests.length}
                </span>
              </div>

              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={
                          req.from?.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={req.from?.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{req.from?.name}</h4>
                          {req.from?.userNumber && (
                            <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              #{req.from.userNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{req.from?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRespondRequest(req.requestId, 'accept')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.requestId, 'decline')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Sent Requests (Pending)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {outgoingRequests.length}
                </span>
              </div>

              <div className="space-y-3">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={
                          req.to?.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={req.to?.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{req.to?.name}</h4>
                          {req.to?.userNumber && (
                            <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              #{req.to.userNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{req.to?.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFriend(req.requestId, req.to?.name)}
                      className="px-2.5 py-1 text-slate-400 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Cancel Request"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MY FRIENDS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Friends ({friends.length})
              </h3>
              <p className="text-xs text-slate-500">
                Travelers you can invite with 1-click when planning couple or group trips.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Loading friends list...</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No Friends Connected Yet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect with fellow travelers by searching their 6-digit User ID Number above or sharing your User ID #{user?.userNumber || '------'}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => {
              const profileImg =
                friend.profileImage ||
                friend.user?.profileImage ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
              const friendName = friend.name || friend.user?.name || 'Traveler';
              const friendNum = friend.userNumber || friend.user?.userNumber;
              const friendEmail = friend.email || friend.user?.email || '';
              const friendPhone = friend.phoneNumber || friend.user?.phoneNumber;

              return (
                <div
                  key={friend.friendshipId || friend._id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={profileImg}
                      alt={friendName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {friendName}
                        </h4>
                        {friendNum && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-100">
                            ID: #{friendNum}
                          </span>
                        )}
                      </div>
                      {friendEmail && <p className="text-xs text-slate-500 truncate mt-0.5">{friendEmail}</p>}
                      {friendPhone && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {friendPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate('/trips/create')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Plan Trip</span>
                    </button>

                    <button
                      onClick={() => handleRemoveFriend(friend.friendshipId, friendName)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove friend"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
