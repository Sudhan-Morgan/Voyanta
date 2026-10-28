const User = require('../models/User');
const Friendship = require('../models/Friendship');

// @desc    Get user's friends list, incoming requests, and outgoing requests
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Accepted friendships (user is either requester or recipient)
    const acceptedFriendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: 'accepted'
    })
      .populate('requester', 'name email userNumber profileImage phoneNumber')
      .populate('recipient', 'name email userNumber profileImage phoneNumber')
      .sort({ updatedAt: -1 });

    const friends = acceptedFriendships
      .map((f) => {
        if (!f.requester || !f.recipient) return null;
        const isRequester = f.requester._id.toString() === currentUserId.toString();
        const friendUser = isRequester ? f.recipient : f.requester;
        if (!friendUser) return null;
        return {
          friendshipId: f._id,
          _id: friendUser._id,
          name: friendUser.name,
          email: friendUser.email,
          userNumber: friendUser.userNumber,
          phoneNumber: friendUser.phoneNumber,
          profileImage: friendUser.profileImage,
          user: friendUser,
          since: f.updatedAt
        };
      })
      .filter(Boolean);

    // 2. Incoming pending requests (user is recipient)
    const incomingRequests = await Friendship.find({
      recipient: currentUserId,
      status: 'pending'
    })
      .populate('requester', 'name email userNumber profileImage phoneNumber')
      .sort({ createdAt: -1 });

    // 3. Outgoing pending requests (user is requester)
    const outgoingRequests = await Friendship.find({
      requester: currentUserId,
      status: 'pending'
    })
      .populate('recipient', 'name email userNumber profileImage phoneNumber')
      .sort({ createdAt: -1 });

    const formattedIncoming = incomingRequests
      .filter((r) => r.requester)
      .map((r) => ({
        requestId: r._id,
        from: r.requester,
        createdAt: r.createdAt
      }));

    const formattedOutgoing = outgoingRequests
      .filter((r) => r.recipient)
      .map((r) => ({
        requestId: r._id,
        to: r.recipient,
        createdAt: r.createdAt
      }));

    res.status(200).json({
      success: true,
      count: friends.length,
      friends,
      incomingRequests: formattedIncoming,
      outgoingRequests: formattedOutgoing,
      data: {
        friends,
        incomingRequests: formattedIncoming,
        outgoingRequests: formattedOutgoing
      }
    });
  } catch (error) {
    console.error('Get Friends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends'
    });
  }
};

// @desc    Search users by 6-digit User ID Number, Name, or Email
// @route   GET /api/friends/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cleanQ = q.trim();
    const currentUserId = req.user._id;

    const queryConditions = [
      { name: { $regex: cleanQ, $options: 'i' } },
      { email: { $regex: cleanQ, $options: 'i' } }
    ];

    // If numeric query, search userNumber exact or prefix
    const numericQ = parseInt(cleanQ.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numericQ)) {
      queryConditions.push({ userNumber: numericQ });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: queryConditions
    })
      .select('name email userNumber profileImage phoneNumber')
      .limit(20);

    // Fetch existing friendship statuses between current user and found users
    const userIds = users.map((u) => u._id);
    const existingFriendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: currentUserId }
      ]
    });

    const statusMap = new Map();
    existingFriendships.forEach((f) => {
      const otherId =
        f.requester.toString() === currentUserId.toString()
          ? f.recipient.toString()
          : f.requester.toString();

      if (f.status === 'accepted') {
        statusMap.set(otherId, { status: 'friends', friendshipId: f._id });
      } else if (f.status === 'pending') {
        if (f.requester.toString() === currentUserId.toString()) {
          statusMap.set(otherId, { status: 'pending_sent', requestId: f._id });
        } else {
          statusMap.set(otherId, { status: 'pending_received', requestId: f._id });
        }
      }
    });

    const results = users.map((u) => {
      const rel = statusMap.get(u._id.toString()) || { status: 'none' };
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        userNumber: u.userNumber,
        profileImage: u.profileImage,
        phoneNumber: u.phoneNumber,
        relationship: rel.status,
        friendshipId: rel.friendshipId,
        requestId: rel.requestId
      };
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// @desc    Send Friend Request (by targetUserId or 6-digit User ID Number)
// @route   POST /api/friends/request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId, userNumber } = req.body;
    let targetUser = null;

    if (targetUserId) {
      targetUser = await User.findById(targetUserId);
    } else if (userNumber) {
      const num = parseInt(userNumber.toString().replace(/[^0-9]/g, ''), 10);
      targetUser = await User.findOne({ userNumber: num });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please verify the 6-digit User ID or email.'
      });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself.'
      });
    }

    // Check existing friendship in either direction
    let existing = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: targetUser._id },
        { requester: targetUser._id, recipient: req.user._id }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: `You are already friends with ${targetUser.name}.`
        });
      }

      if (existing.status === 'pending') {
        if (existing.requester.toString() === req.user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Friend request already sent and pending.'
          });
        } else {
          // If the other user already sent a request, auto-accept it!
          existing.status = 'accepted';
          await existing.save();
          return res.status(200).json({
            success: true,
            message: `You and ${targetUser.name} are now friends!`,
            friendship: existing
          });
        }
      }

      // If previously declined, reset to pending
      existing.requester = req.user._id;
      existing.recipient = targetUser._id;
      existing.status = 'pending';
      await existing.save();

      return res.status(200).json({
        success: true,
        message: `Friend request sent to ${targetUser.name}!`,
        friendship: existing
      });
    }

    // Create new friend request
    const friendship = await Friendship.create({
      requester: req.user._id,
      recipient: targetUser._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: `Friend request sent to ${targetUser.name}!`,
      friendship
    });
  } catch (error) {
    console.error('Send Friend Request Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send friend request'
    });
  }
};

// @desc    Respond to incoming friend request (accept or decline)
// @route   PUT /api/friends/requests/:id/respond
// @access  Private
exports.respondFriendRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "accept" or "decline"'
      });
    }

    const friendship = await Friendship.findById(req.params.id).populate(
      'requester',
      'name email profileImage userNumber'
    );

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (friendship.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this friend request'
      });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      return res.status(200).json({
        success: true,
        message: `Accepted friend request from ${friendship.requester?.name || 'user'}!`,
        friendship
      });
    } else {
      friendship.status = 'declined';
      await friendship.save();
      return res.status(200).json({
        success: true,
        message: 'Friend request declined.',
        friendship
      });
    }
  } catch (error) {
    console.error('Respond Friend Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process friend request'
    });
  }
};

// @desc    Remove a friend or cancel a request
// @route   DELETE /api/friends/:id
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetId = req.params.id;

    // Search by friendship ID or friend's user ID
    const friendship = await Friendship.findOne({
      $or: [
        { _id: targetId },
        { requester: currentUserId, recipient: targetId },
        { requester: targetId, recipient: currentUserId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend connection not found'
      });
    }

    // Ensure current user is part of this connection
    const isMember =
      friendship.requester.toString() === currentUserId.toString() ||
      friendship.recipient.toString() === currentUserId.toString();

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this friend'
      });
    }

    await friendship.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove Friend Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
};
