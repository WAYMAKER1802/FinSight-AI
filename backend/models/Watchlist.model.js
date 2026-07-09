const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assetType: {
    type: DataTypes.ENUM('Stock', 'Crypto', 'Mutual Fund', 'ETF'),
    defaultValue: 'Stock',
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Watchlist',
  timestamps: false,
});

const User = require('./User.model');
Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlist' });

module.exports = Watchlist;
