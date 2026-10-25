const { getDatabase } = require('../database/db');
const { createNotification } = require('../services/notificationService');

async function followUser(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID provided.'
      });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.'
      });
    }

    const db = getDatabase();
    const targetUser = db.prepare('SELECT id, name FROM users WHERE id = ?').get(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to follow was not found.'
      });
    }

    const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, targetUserId);
    if (existing) {
      const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUserId).count;
      return res.status(400).json({
        success: false,
        message: 'You are already following this user.',
        data: {
          isFollowing: true,
          followersCount
        }
      });
    }

    const now = new Date().toISOString();
    db.prepare('INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)').run(req.user.id, targetUserId, now);

    // Create notification
    createNotification({
      recipientId: targetUserId,
      actorId: req.user.id,
      type: 'follow'
    });

    const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUserId).count;

    return res.status(200).json({
      success: true,
      message: 'User followed successfully.',
      data: {
        isFollowing: true,
        followersCount
      }
    });
  } catch (err) {
    next(err);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID provided.'
      });
    }

    const db = getDatabase();
    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User was not found.'
      });
    }

    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, targetUserId);

    const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUserId).count;

    return res.status(200).json({
      success: true,
      message: 'User unfollowed successfully.',
      data: {
        isFollowing: false,
        followersCount
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  followUser,
  unfollowUser
};
