import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/tripService';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function TripMembersTab({ trip, members = [], onMemberUpdated }) {
  const { user } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('friends'); // 'friends' | 'search'
  const [myFriends, setMyFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Direct search input
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Invite action state
  const [invitingId, setInvitingId] = useState(null);
  const [inviteRole, setInviteRole] = useState('editor');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const currentUserIdStr = (user?._id || user?.id)?.toString();
  const isOwner = trip.ownerId?._id?.toString() === currentUserIdStr || trip.ownerId?.toString() === currentUserIdStr;

  // Load user's friends when opening modal
  useEffect(() => {
    if (isInviteModalOpen) {
      loadFriends();
    }
  }, [isInviteModalOpen]);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const res = await friendService.getFriends();
      if (res?.data?.friends) {
        setMyFriends(res.data.friends.map((f) => f.user).filter(Boolean));
      }
    } catch (err) {
      console.warn('Failed to load friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await friendService.searchUsers(searchQuery.trim());
      if (res?.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setStatusMsg({ text: 'Search failed. Please try again.', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const handleSendInvite = async ({ friendId, userNumber, email }) => {
    try {
      setInvitingId(friendId || userNumber || email);
      setStatusMsg({ text: '', type: '' });

      const res = await tripService.inviteFriendToTrip(trip._id, {
        friendId,
        userNumber,
        email,
        role: inviteRole
      });

      setStatusMsg({ text: res.message || 'Invitation sent successfully!', type: 'success' });
      if (onMemberUpdated) onMemberUpdated();
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Failed to send invitation',
        type: 'error'
      });
    } finally {
      setInvitingId(null);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this trip?`)) return;
    try {
      await tripService.removeTripMember(trip._id, memberId);
      if (onMemberUpdated) onMemberUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Check if a user is already in members list
  const getMemberStatus = (targetUserId) => {
    if (!targetUserId) return null;
    const found = members.find((m) => m.userId?._id?.toString() === targetUserId.toString());
    return found ? found.invitationStatus : null;
  };

  return (
    <div className="space-y-6">
      {/* Travel Crew Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Travel Crew & Members</h3>
              <p className="text-xs text-slate-500">
                Manage group travelers, invite friends, and coordinate roles.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:scale-102"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Friends to Trip</span>
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Trip Members ({members.length})
          </span>
          <span className="text-xs text-slate-500">
            Trip Group Size: <strong className="text-indigo-600">{trip.groupSize || 1} travelers</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((member) => {
            const memberUser = member.userId;
            const isTripOwner = member.role === 'owner' || trip.ownerId?._id?.toString() === memberUser?._id?.toString();
            const isSelf = memberUser?._id?.toString() === currentUserIdStr;

            return (
              <div
                key={member._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={
                        memberUser?.profileImage ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={memberUser?.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    {isTripOwner && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-400 text-amber-950 font-bold text-[9px] rounded-full ring-2 ring-white">
                        Host
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {memberUser?.name || member.invitedEmail || 'Traveler'}
                      </h4>
                      {isSelf && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {memberUser?.userNumber && (
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          ID: #{memberUser.userNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {memberUser?.email || member.invitedEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Status Badge */}
                  {member.invitationStatus === 'accepted' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Joined
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Invited (Pending)
                    </span>
                  )}

                  {/* Role Badge */}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                    {member.role}
                  </span>

                  {/* Remove Button */}
                  {(isOwner || isSelf) && !isTripOwner && (
                    <button
                      onClick={() => handleRemoveMember(member._id, memberUser?.name || 'this member')}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={isSelf ? 'Leave trip' : 'Remove from trip'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INVITATION MODAL ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-700 to-purple-600 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-1">
                  <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Travel Crew</span>
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">Invite Friends to Trip</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert inside modal */}
            {statusMsg.text && (
              <div
                className={`m-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100">
              <button
                onClick={() => setInviteMethod('friends')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                  inviteMethod === 'friends'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                My Friends ({myFriends.length})
              </button>
              <button
                onClick={() => setInviteMethod('search')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                  inviteMethod === 'search'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Search by User ID or Email
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Role selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-semibold text-slate-700">Invite Role:</span>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="editor">Editor (Can plan & add expenses)</option>
                  <option value="viewer">Viewer (Can view itinerary & forum)</option>
                </select>
              </div>

              {/* METHOD 1: My Friends */}
              {inviteMethod === 'friends' && (
                <div className="space-y-3">
                  {loadingFriends ? (
                    <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span className="text-xs">Loading friends list...</span>
                    </div>
                  ) : myFriends.length === 0 ? (
                    <div className="py-8 text-center p-4 border border-dashed border-slate-200 rounded-2xl">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No Friends Added Yet</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                        Add friends in your Profile page or switch to "Search by User ID" tab to invite any user.
                      </p>
                    </div>
                  ) : (
                    myFriends.map((friend) => {
                      const memberStatus = getMemberStatus(friend._id);
                      const isInviting = invitingId === friend._id;

                      return (
                        <div
                          key={friend._id}
                          className="p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between gap-3 bg-white transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                friend.profileImage ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{friend.name}</h4>
                                {friend.userNumber && (
                                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                    #{friend.userNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{friend.email}</p>
                            </div>
                          </div>

                          {memberStatus === 'accepted' ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Crew
                            </span>
                          ) : memberStatus === 'pending' ? (
                            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Invited
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendInvite({ friendId: friend._id })}
                              disabled={isInviting}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              {isInviting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" /> Invite
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* METHOD 2: Search by User ID or Email */}
              {inviteMethod === 'search' && (
                <div className="space-y-4">
                  <form onSubmit={handleSearchUsers} className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit User ID (e.g. 104829), name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                  </form>

                  <div className="space-y-2">
                    {searchResults.map((userResult) => {
                      const memberStatus = getMemberStatus(userResult._id);
                      const isInviting = invitingId === userResult._id;

                      return (
                        <div
                          key={userResult._id}
                          className="p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                userResult.profileImage ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={userResult.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{userResult.name}</h4>
                                {userResult.userNumber && (
                                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                                    ID: #{userResult.userNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{userResult.email}</p>
                            </div>
                          </div>

                          {memberStatus === 'accepted' ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Crew
                            </span>
                          ) : memberStatus === 'pending' ? (
                            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Invited
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendInvite({ friendId: userResult._id })}
                              disabled={isInviting}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              {isInviting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" /> Invite
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
