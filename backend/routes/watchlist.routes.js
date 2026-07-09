const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(watchlistController.getWatchlist)
  .post(watchlistController.addToWatchlist);

router.route('/:symbol')
  .delete(watchlistController.removeFromWatchlist);

module.exports = router;
