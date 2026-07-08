/**
 * User Routes — Profile Management
 */
'use strict';

const express = require('express');
const router  = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadAvatar }       = require('../middleware/upload.middleware');

router.use(protect);

// Current User Routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/upload-avatar', uploadAvatar, userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/', authorize('admin'), userController.getAllUsers);
router.patch('/:id/role', authorize('admin'), userController.updateUserRole);

module.exports = router;

