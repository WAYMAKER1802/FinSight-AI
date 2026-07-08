/**
 * Goal Controller
 */
'use strict';

const Goal     = require('../models/Goal.model');
const aiSvc    = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

// GET /goals
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ priority: 1, createdAt: -1 });
    sendSuccess(res, 200, { count: goals.length, goals });
  } catch (e) { next(e); }
};

// POST /goals
exports.createGoal = async (req, res, next) => {
  try {
    const {
      name, type, targetAmount, targetDate, monthlySIP,
      expectedReturns = 12, priority = 'medium',
      portfolioId, icon, color,
    } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      portfolioId,
      name, type, targetAmount, targetDate, monthlySIP,
      expectedReturns, priority, icon, color,
    });

    sendSuccess(res, 201, { goal }, 'Goal created successfully');
  } catch (e) { next(e); }
};

// GET /goals/:id
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return next(new AppError('Goal not found', 404));
    sendSuccess(res, 200, { goal });
  } catch (e) { next(e); }
};

// PUT /goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    const allowed = ['name', 'type', 'targetAmount', 'targetDate', 'monthlySIP',
                     'expectedReturns', 'priority', 'status', 'icon', 'color', 'currentAmount'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates, { new: true, runValidators: true }
    );
    if (!goal) return next(new AppError('Goal not found', 404));

    sendSuccess(res, 200, { goal }, 'Goal updated');
  } catch (e) { next(e); }
};

// DELETE /goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return next(new AppError('Goal not found', 404));
    sendSuccess(res, 200, null, 'Goal deleted');
  } catch (e) { next(e); }
};

// POST /goals/:id/update-progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { currentAmount } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { currentAmount }, { new: true }
    );
    if (!goal) return next(new AppError('Goal not found', 404));

    // Auto-check completion
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
      await goal.save();
    }

    sendSuccess(res, 200, { goal }, 'Progress updated');
  } catch (e) { next(e); }
};

// POST /goals/:id/ai-plan
exports.generateAIPlan = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return next(new AppError('Goal not found', 404));

    const { financialContext = {} } = req.body;

    const plan = await aiSvc.planGoal(goal, {
      monthlyIncome  : financialContext.monthlyIncome   || req.user.annualIncome / 12,
      monthlyExpenses: financialContext.monthlyExpenses || 0,
      existingSIP    : financialContext.existingSIP     || goal.monthlySIP,
    });

    // Store AI suggestions
    goal.aiSuggestions = goal.aiSuggestions || [];
    goal.aiSuggestions.push({
      suggestion : JSON.stringify(plan),
      date       : new Date(),
    });
    await goal.save();

    sendSuccess(res, 200, { goal, aiPlan: plan }, 'AI plan generated');
  } catch (e) { next(e); }
};
