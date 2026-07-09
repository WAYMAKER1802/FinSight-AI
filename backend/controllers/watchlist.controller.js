const Watchlist = require('../models/Watchlist.model');
const { AppError, sendSuccess } = require('../middleware/errorHandler');

// GET /watchlist
exports.getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.findAll({
      where: { userId: req.user.id },
      order: [['addedAt', 'DESC']],
    });
    sendSuccess(res, 200, items, 'Watchlist fetched');
  } catch (err) {
    next(err);
  }
};

// POST /watchlist
exports.addToWatchlist = async (req, res, next) => {
  try {
    const { symbol, name, assetType } = req.body;
    if (!symbol) return next(new AppError('Symbol is required', 400));

    const existing = await Watchlist.findOne({
      where: { userId: req.user.id, symbol },
    });
    
    if (existing) {
      return next(new AppError('Asset already in watchlist', 400));
    }

    const item = await Watchlist.create({
      userId: req.user.id,
      symbol,
      name,
      assetType: assetType || 'Stock',
    });

    sendSuccess(res, 201, item, 'Added to watchlist');
  } catch (err) {
    next(err);
  }
};

// DELETE /watchlist/:symbol
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const deleted = await Watchlist.destroy({
      where: { userId: req.user.id, symbol },
    });

    if (!deleted) return next(new AppError('Asset not found in watchlist', 404));

    sendSuccess(res, 200, null, 'Removed from watchlist');
  } catch (err) {
    next(err);
  }
};
