/**
 * Alert Routes
 */
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get   ('/',               ctrl.getAlerts);
router.get   ('/unread-count',   ctrl.getUnreadCount);
router.post  ('/',               ctrl.createAlert);
router.patch ('/mark-all-read',  ctrl.markAllRead);
router.delete('/clear-read',     ctrl.clearRead);
router.patch ('/:id/read',       ctrl.markRead);
router.delete('/:id',            ctrl.deleteAlert);

module.exports = router;
