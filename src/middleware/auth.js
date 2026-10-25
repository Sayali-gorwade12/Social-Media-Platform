const { verifyToken } = require('../utils/jwt');
const { getDatabase } = require('../database/db');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }

  const db = getDatabase();
  const user = db.prepare(`
    SELECT id, name, username, email, bio, avatar_url, cover_url, created_at
    FROM users
    WHERE id = ?
  `).get(decoded.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authenticated user account no longer exists.'
    });
  }

  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyToken(token);

  if (decoded && decoded.userId) {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, username, email, bio, avatar_url, cover_url, created_at
      FROM users
      WHERE id = ?
    `).get(decoded.userId);
    req.user = user || null;
  } else {
    req.user = null;
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
