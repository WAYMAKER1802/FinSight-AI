/**
 * File Upload Middleware — Multer Configuration
 * ──────────────────────────────────────────────
 * Handles CSV and Excel file uploads for portfolio import.
 */

'use strict';

const multer = require('multer');
const path   = require('path');
const { AppError } = require('./errorHandler');

const UPLOAD_PATH    = process.env.UPLOAD_PATH   || 'uploads/';
const MAX_FILE_SIZE  = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB

// ── Storage Engine ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext          = path.extname(file.originalname).toLowerCase();
    cb(null, `portfolio-${req.user?._id}-${uniqueSuffix}${ext}`);
  },
});

// ── File Filter ─────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes  = ['text/csv', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const allowedExts   = ['.csv', '.xlsx', '.xls'];
  const ext           = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only CSV and Excel files (.csv, .xlsx, .xls) are allowed.', 400), false);
  }
};

// ── Multer Instance ─────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

// ── Avatar Upload ───────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename   : (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user?._id}${ext}`);
  },
});

const avatarFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed for avatars.', 400), false);
  }
};

const uploadAvatar = multer({
  storage   : avatarStorage,
  fileFilter: avatarFilter,
  limits    : { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

module.exports = {
  uploadPortfolio: upload.single('portfolio'),
  uploadAvatar   : uploadAvatar.single('avatar'),
};
