/**
 * Goal Routes
 */
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth.middleware');
const { body }  = require('express-validator');
const { validate } = require('../middleware/validator.middleware');

router.use(protect);

router.get   ('/',                      ctrl.getGoals);
router.post  ('/', [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('type').isIn(['retirement', 'home', 'education', 'vehicle', 'vacation', 'emergency', 'wedding', 'wealth', 'other']),
  body('targetAmount').isFloat({ min: 1000 }),
  body('targetDate').isISO8601().withMessage('Valid target date required'),
  validate,
], ctrl.createGoal);
router.get   ('/:id',                   ctrl.getGoal);
router.put   ('/:id',                   ctrl.updateGoal);
router.delete('/:id',                   ctrl.deleteGoal);
router.post  ('/:id/update-progress',   ctrl.updateProgress);
router.post  ('/:id/ai-plan',           ctrl.generateAIPlan);

module.exports = router;
