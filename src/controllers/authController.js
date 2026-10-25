const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/db');
const { signToken } = require('../utils/jwt');
const { isValidEmail, isValidUsername, sanitizeText } = require('../utils/validator');

async function register(req, res, next) {
  try {
    const { name, username, email, password } = req.body;

    const trimmedName = sanitizeText(name);
    const trimmedUsername = sanitizeText(username).toLowerCase();
    const trimmedEmail = sanitizeText(email).toLowerCase();

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

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const db = getDatabase();

    // Check duplicate email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check duplicate username
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(trimmedUsername);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const insertResult = db.prepare(`
      INSERT INTO users (name, username, email, password_hash, bio, avatar_url, cover_url, created_at)
      VALUES (?, ?, ?, ?, '', NULL, NULL, ?)
    `).run(trimmedName, trimmedUsername, trimmedEmail, passwordHash, now);

    const newUser = {
      id: insertResult.lastInsertRowid,
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      bio: '',
      avatar_url: null,
      cover_url: null,
      created_at: now
    };

    const token = signToken({ userId: newUser.id, username: newUser.username });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    const trimmedIdentifier = sanitizeText(identifier);
    if (!trimmedIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/username and password.'
      });
    }

    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, username, email, password_hash, bio, avatar_url, cover_url, created_at
      FROM users
      WHERE email = ? OR username = ?
    `).get(trimmedIdentifier.toLowerCase(), trimmedIdentifier.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.'
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = signToken({ userId: safeUser.id, username: safeUser.username });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current user profile fetched successfully.',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password you provided is incorrect.'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
