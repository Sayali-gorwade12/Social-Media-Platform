const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Static & search routes first
router.get('/search', optionalAuth, userController.searchUsers);
router.get('/suggestions', optionalAuth, userController.getSuggestions);
router.put('/me', requireAuth, userController.updateProfile);

// Follow / Unfollow user by ID
router.post('/:id/follow', requireAuth, followController.followUser);
router.delete('/:id/follow', requireAuth, followController.unfollowUser);

// Username-based routes
router.get('/:username', optionalAuth, userController.getUserByUsername);
router.get('/:username/posts', optionalAuth, userController.getUserPosts);
router.get('/:username/followers', optionalAuth, userController.getUserFollowers);
router.get('/:username/following', optionalAuth, userController.getUserFollowing);
router.get('/:username/follow-status', optionalAuth, userController.getFollowStatus);

module.exports = router;
