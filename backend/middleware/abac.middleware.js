/**
 * Attribute-Based Access Control (ABAC) Middleware
 * ────────────────────────────────────────────────
 * Enforces ownership rules (e.g., user can only access their own resources).
 */
'use strict';

const { AppError } = require('./errorHandler');

/**
 * Middleware to check if the authenticated user owns the resource.
 * @param {mongoose.Model} Model - The Mongoose model to query
 * @param {string} idParamName - The route parameter name containing the ID (default: 'id')
 * @param {string} userField - The field on the document that stores the owner's ID (default: 'userId')
 */
const checkOwnership = (Model, idParamName = 'id', userField = 'userId') => async (req, res, next) => {
  try {
    const resourceId = req.params[idParamName];
    if (!resourceId) return next(new AppError('Resource ID is required', 400));

    const resource = await Model.findById(resourceId);
    if (!resource) {
      return next(new AppError(`${Model.modelName} not found`, 404));
    }

    // Admins can bypass ownership checks
    if (req.user.role === 'admin') {
      req[Model.modelName.toLowerCase()] = resource;
      return next();
    }

    // Check ownership (ABAC & DAC)
    const isOwner = resource[userField].toString() === req.user._id.toString();
    const isShared = resource.sharedWith && resource.sharedWith.some(id => id.toString() === req.user._id.toString());
    const isReadRequest = req.method === 'GET';

    if (!isOwner && !(isShared && isReadRequest)) {
      return next(new AppError(`You do not have permission to access this ${Model.modelName}`, 403));
    }

    // Attach the resource to the request object so downstream controllers don't need to re-fetch it
    req[Model.modelName.toLowerCase()] = resource;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkOwnership,
};
