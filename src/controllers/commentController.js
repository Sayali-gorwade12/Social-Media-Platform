const { getDatabase } = require('../database/db');
const { createNotification } = require('../services/notificationService');
const { sanitizeText } = require('../utils/validator');

async function getPostComments(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const comments = db.prepare(`
      SELECT 
        c.id, c.post_id, c.content, c.created_at, c.updated_at,
        u.id as author_id, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar,
        ${currentUserId ? `(c.user_id = ?)` : '0'} as is_author
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(...(currentUserId ? [currentUserId, postId] : [postId]));

    const formatted = comments.map(c => ({
      id: c.id,
      postId: c.post_id,
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author: {
        id: c.author_id,
        name: c.author_name,
        username: c.author_username,
        avatarUrl: c.author_avatar
      },
      isAuthor: Boolean(c.is_author)
    }));

    return res.status(200).json({
      success: true,
      data: { comments: formatted }
    });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const { content } = req.body;
    const trimmed = sanitizeText(content);

    if (!trimmed || trimmed.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.'
      });
    }

    if (trimmed.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content exceeds the 1,000 character limit.'
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

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, req.user.id, trimmed, now, now);

    const commentId = result.lastInsertRowid;

    // Create notification for post owner if someone else comments
    if (post.user_id !== req.user.id) {
      createNotification({
        recipientId: post.user_id,
        actorId: req.user.id,
        type: 'comment',
        postId: postId,
        commentId: commentId
      });
    }

    const newComment = {
      id: commentId,
      postId,
      content: trimmed,
      createdAt: now,
      updatedAt: now,
      author: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        avatarUrl: req.user.avatar_url
      },
      isAuthor: true
    };

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: { comment: newComment }
    });
  } catch (err) {
    next(err);
  }
}

async function updateComment(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID provided.'
      });
    }

    const { content } = req.body;
    const trimmed = sanitizeText(content);

    if (!trimmed || trimmed.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.'
      });
    }

    if (trimmed.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content exceeds the 1,000 character limit.'
      });
    }

    const db = getDatabase();
    const comment = db.prepare('SELECT user_id, post_id FROM comments WHERE id = ?').get(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this comment.'
      });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?').run(trimmed, now, commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      data: {
        comment: {
          id: commentId,
          postId: comment.post_id,
          content: trimmed,
          updatedAt: now,
          isAuthor: true
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID provided.'
      });
    }

    const db = getDatabase();
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.'
      });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPostComments,
  addComment,
  updateComment,
  deleteComment
};
