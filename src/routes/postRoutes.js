const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Post endpoints
router.get('/', optionalAuth, postController.getPosts);
router.post('/', requireAuth, postController.createPost);
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', requireAuth, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

// Comments nested under post
router.get('/:id/comments', optionalAuth, commentController.getPostComments);
router.post('/:id/comments', requireAuth, commentController.addComment);

// Likes nested under post
router.post('/:id/like', requireAuth, likeController.likePost);
router.delete('/:id/like', requireAuth, likeController.unlikePost);

module.exports = router;
