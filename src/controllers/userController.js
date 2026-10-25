const { getDatabase } = require('../database/db');
const { isValidUsername, isValidUrl, sanitizeText } = require('../utils/validator');

async function searchUsers(req, res, next) {
  try {
    const query = sanitizeText(req.query.q || '');
    if (!query) {
      return res.status(200).json({
        success: true,
        data: { users: [] }
      });
    }

    const db = getDatabase();
    const searchTerm = `%${query}%`;
    const currentUserId = req.user ? req.user.id : null;

    const users = db.prepare(`
      SELECT 
        u.id, u.name, u.username, u.bio, u.avatar_url, u.cover_url, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        ${currentUserId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id)` : '0'} as is_following
      FROM users u
      WHERE u.username LIKE ? OR u.name LIKE ?
      ORDER BY followers_count DESC
      LIMIT 20
    `).all(...(currentUserId ? [currentUserId, searchTerm, searchTerm] : [searchTerm, searchTerm]));

    const formattedUsers = users.map(u => ({
      ...u,
      is_following: Boolean(u.is_following)
    }));

    return res.status(200).json({
      success: true,
      data: { users: formattedUsers }
    });
  } catch (err) {
    next(err);
  }
}

async function getSuggestions(req, res, next) {
  try {
    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    let users;
    if (currentUserId) {
      users = db.prepare(`
        SELECT 
          u.id, u.name, u.username, u.bio, u.avatar_url, u.cover_url, u.created_at,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
          0 as is_following
        FROM users u
        WHERE u.id != ?
          AND NOT EXISTS (
            SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
          )
        ORDER BY followers_count DESC, u.created_at DESC
        LIMIT 5
      `).all(currentUserId, currentUserId);
    } else {
      users = db.prepare(`
        SELECT 
          u.id, u.name, u.username, u.bio, u.avatar_url, u.cover_url, u.created_at,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
          0 as is_following
        FROM users u
        ORDER BY followers_count DESC, u.created_at DESC
        LIMIT 5
      `).all();
    }

    const formattedUsers = users.map(u => ({
      ...u,
      is_following: Boolean(u.is_following)
    }));

    return res.status(200).json({
      success: true,
      data: { users: formattedUsers }
    });
  } catch (err) {
    next(err);
  }
}

async function getUserByUsername(req, res, next) {
  try {
    const username = sanitizeText(req.params.username).toLowerCase();
    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const user = db.prepare(`
      SELECT 
        u.id, u.name, u.username, u.email, u.bio, u.avatar_url, u.cover_url, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        ${currentUserId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id)` : '0'} as is_following
      FROM users u
      WHERE u.username = ?
    `).get(...(currentUserId ? [currentUserId, username] : [username]));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User @${username} was not found.`
      });
    }

    // Hide email if viewing someone else's profile
    const safeUser = {
      ...user,
      email: currentUserId === user.id ? user.email : undefined,
      is_following: Boolean(user.is_following)
    };

    return res.status(200).json({
      success: true,
      data: { user: safeUser }
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, username, bio, avatar_url, cover_url } = req.body;
    const currentUserId = req.user.id;
    const db = getDatabase();

    const trimmedName = sanitizeText(name);
    const trimmedUsername = sanitizeText(username).toLowerCase();
    const trimmedBio = sanitizeText(bio);
    const trimmedAvatar = avatar_url ? sanitizeText(avatar_url) : null;
    const trimmedCover = cover_url ? sanitizeText(cover_url) : null;

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.'
      });
    }

    if (!isValidUsername(trimmedUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores.'
      });
    }

    if (trimmedBio.length > 250) {
      return res.status(400).json({
        success: false,
        message: 'Bio must not exceed 250 characters.'
      });
    }

    if (trimmedAvatar && !isValidUrl(trimmedAvatar)) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL must be a valid http or https URL.'
      });
    }

    if (trimmedCover && !isValidUrl(trimmedCover)) {
      return res.status(400).json({
        success: false,
        message: 'Cover image URL must be a valid http or https URL.'
      });
    }

    // Check if new username is already taken by another user
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(trimmedUsername, currentUserId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken by another user.'
      });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, username = ?, bio = ?, avatar_url = ?, cover_url = ?
      WHERE id = ?
    `).run(trimmedName, trimmedUsername, trimmedBio, trimmedAvatar, trimmedCover, currentUserId);

    const updatedUser = db.prepare(`
      SELECT 
        u.id, u.name, u.username, u.email, u.bio, u.avatar_url, u.cover_url, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count
      FROM users u
      WHERE u.id = ?
    `).get(currentUserId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
}

async function getUserPosts(req, res, next) {
  try {
    const username = sanitizeText(req.params.username).toLowerCase();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `User @${username} was not found.`
      });
    }

    const posts = db.prepare(`
      SELECT 
        p.id, p.content, p.image_url, p.created_at, p.updated_at,
        u.id as author_id, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        ${currentUserId ? `EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?)` : '0'} as is_liked,
        ${currentUserId ? `(p.user_id = ?)` : '0'} as is_author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...(currentUserId ? [currentUserId, currentUserId, targetUser.id, limit, offset] : [targetUser.id, limit, offset]));

    const totalCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(targetUser.id).count;

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

async function getUserFollowers(req, res, next) {
  try {
    const username = sanitizeText(req.params.username).toLowerCase();
    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `User @${username} was not found.`
      });
    }

    const followers = db.prepare(`
      SELECT 
        u.id, u.name, u.username, u.bio, u.avatar_url,
        ${currentUserId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id)` : '0'} as is_following
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `).all(...(currentUserId ? [currentUserId, targetUser.id] : [targetUser.id]));

    const formatted = followers.map(u => ({
      ...u,
      is_following: Boolean(u.is_following)
    }));

    return res.status(200).json({
      success: true,
      data: { followers: formatted }
    });
  } catch (err) {
    next(err);
  }
}

async function getUserFollowing(req, res, next) {
  try {
    const username = sanitizeText(req.params.username).toLowerCase();
    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `User @${username} was not found.`
      });
    }

    const following = db.prepare(`
      SELECT 
        u.id, u.name, u.username, u.bio, u.avatar_url,
        ${currentUserId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id)` : '0'} as is_following
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(...(currentUserId ? [currentUserId, targetUser.id] : [targetUser.id]));

    const formatted = following.map(u => ({
      ...u,
      is_following: Boolean(u.is_following)
    }));

    return res.status(200).json({
      success: true,
      data: { following: formatted }
    });
  } catch (err) {
    next(err);
  }
}

async function getFollowStatus(req, res, next) {
  try {
    const username = sanitizeText(req.params.username).toLowerCase();
    const db = getDatabase();
    const currentUserId = req.user ? req.user.id : null;

    const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `User @${username} was not found.`
      });
    }

    let isFollowing = false;
    if (currentUserId) {
      const followRecord = db.prepare(`
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
      `).get(currentUserId, targetUser.id);
      isFollowing = Boolean(followRecord);
    }

    return res.status(200).json({
      success: true,
      data: { isFollowing }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchUsers,
  getSuggestions,
  getUserByUsername,
  updateProfile,
  getUserPosts,
  getUserFollowers,
  getUserFollowing,
  getFollowStatus
};
