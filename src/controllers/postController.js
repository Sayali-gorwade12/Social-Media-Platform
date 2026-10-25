const { getDatabase } = require('../database/db');
const { isValidUrl, sanitizeText } = require('../utils/validator');

async function getPosts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const feedType = req.query.feed || 'all'; // 'all' or 'following'

    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    let whereClause = '';
    const queryParams = [];

    if (feedType === 'following' && currentUserId) {
      whereClause = `WHERE p.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      ) OR p.user_id = ?`;
      queryParams.push(currentUserId, currentUserId);
    }

    const selectParams = [];
    let isLikedSelect = '0';
    let isAuthorSelect = '0';

    if (currentUserId) {
      isLikedSelect = 'EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?)';
      isAuthorSelect = '(p.user_id = ?)';
      selectParams.push(currentUserId, currentUserId);
    }

    const postsSql = `
      SELECT 
        p.id, p.content, p.image_url, p.created_at, p.updated_at,
        u.id as author_id, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        ${isLikedSelect} as is_liked,
        ${isAuthorSelect} as is_author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const allParams = [...selectParams, ...queryParams, limit, offset];
    const posts = db.prepare(postsSql).all(...allParams);

    const countSql = `SELECT COUNT(*) as count FROM posts p ${whereClause}`;
    const totalCount = db.prepare(countSql).get(...queryParams).count;

    const formattedPosts = posts.map(p => ({
      id: p.id,
      content: p.content,
      imageUrl: p.image_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      author: {
        id: p.author_id,
        name: p.author_name,
        username: p.author_username,
        avatarUrl: p.author_avatar
      },
      likeCount: p.like_count,
      commentCount: p.comment_count,
      isLiked: Boolean(p.is_liked),
      isAuthor: Boolean(p.is_author)
    }));

    return res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
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

    let isLikedSelect = '0';
    let isAuthorSelect = '0';
    const params = [];

    if (currentUserId) {
      isLikedSelect = 'EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?)';
      isAuthorSelect = '(p.user_id = ?)';
      params.push(currentUserId, currentUserId);
    }
    params.push(postId);

    const post = db.prepare(`
      SELECT 
        p.id, p.content, p.image_url, p.created_at, p.updated_at,
        u.id as author_id, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        ${isLikedSelect} as is_liked,
        ${isAuthorSelect} as is_author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(...params);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        post: {
          id: post.id,
          content: post.content,
          imageUrl: post.image_url,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: {
            id: post.author_id,
            name: post.author_name,
            username: post.author_username,
            avatarUrl: post.author_avatar
          },
          likeCount: post.like_count,
          commentCount: post.comment_count,
          isLiked: Boolean(post.is_liked),
          isAuthor: Boolean(post.is_author)
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { content, imageUrl } = req.body;
    const trimmedContent = sanitizeText(content);
    const trimmedImage = imageUrl ? sanitizeText(imageUrl) : null;

    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty.'
      });
    }

    if (trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Post content exceeds the 2,000 character limit.'
      });
    }

    if (trimmedImage && !isValidUrl(trimmedImage)) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid http or https URL.'
      });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    const insertResult = db.prepare(`
      INSERT INTO posts (user_id, content, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, trimmedContent, trimmedImage, now, now);

    const newPost = {
      id: insertResult.lastInsertRowid,
      content: trimmedContent,
      imageUrl: trimmedImage,
      createdAt: now,
      updatedAt: now,
      author: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        avatarUrl: req.user.avatar_url
      },
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isAuthor: true
    };

    return res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      data: { post: newPost }
    });
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const { content, imageUrl } = req.body;
    const trimmedContent = sanitizeText(content);
    const trimmedImage = imageUrl !== undefined ? (imageUrl ? sanitizeText(imageUrl) : null) : undefined;

    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty.'
      });
    }

    if (trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Post content exceeds the 2,000 character limit.'
      });
    }

    if (trimmedImage && !isValidUrl(trimmedImage)) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid http or https URL.'
      });
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT user_id, image_url FROM posts WHERE id = ?').get(postId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post.'
      });
    }

    const finalImage = trimmedImage !== undefined ? trimmedImage : existing.image_url;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE posts
      SET content = ?, image_url = ?, updated_at = ?
      WHERE id = ?
    `).run(trimmedContent, finalImage, now, postId);

    const updated = db.prepare(`
      SELECT 
        p.id, p.content, p.image_url, p.created_at, p.updated_at,
        u.id as author_id, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        1 as is_author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.user.id, postId);

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: {
        post: {
          id: updated.id,
          content: updated.content,
          imageUrl: updated.image_url,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          author: {
            id: updated.author_id,
            name: updated.author_name,
            username: updated.author_username,
            avatarUrl: updated.author_avatar
          },
          likeCount: updated.like_count,
          commentCount: updated.comment_count,
          isLiked: Boolean(updated.is_liked),
          isAuthor: true
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID provided.'
      });
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.'
      });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
