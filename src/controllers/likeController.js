const { getDatabase } = require('../database/db');
const { createNotification } = require('../services/notificationService');

async function likePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const db = getDatabase();
    const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id);
    if (existing) {
      const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;
      return res.status(400).json({
        success: false,
        message: 'You have already liked this post.',
        data: {
          likeCount: count,
          isLiked: true
        }
      });
    }

    const now = new Date().toISOString();
    db.prepare('INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, req.user.id, now);

    // Notify post owner
    if (post.user_id !== req.user.id) {
      createNotification({
        recipientId: post.user_id,
        actorId: req.user.id,
        type: 'like',
        postId: postId
      });
    }

    const newCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;

    return res.status(200).json({
      success: true,
      message: 'Post liked successfully.',
      data: {
        likeCount: newCount,
        isLiked: true
      }
    });
  } catch (err) {
    next(err);
  }
}

async function unlikePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const db = getDatabase();
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id);

    const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;

    return res.status(200).json({
      success: true,
      message: 'Post unliked successfully.',
      data: {
        likeCount: count,
        isLiked: false
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  likePost,
  unlikePost
};
