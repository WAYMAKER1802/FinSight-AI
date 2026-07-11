/**
 * InvestIQ AI — Main Server Entry Point
 * =====================================
 * @description  Express server bootstrapper with security middleware,
 *               database connection, route registration, and error handling.
 * @author       InvestIQ AI Engineering Team
 * @version      1.0.0
 */

'use strict';

const express       = require('express');

const cors          = require('cors');
const helmet        = require('helmet');
const compression   = require('compression');
const cookieParser  = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp           = require('hpp');
const morgan        = require('morgan');
const xss           = require('xss-clean');
const path          = require('path');
require('dotenv').config();

// ─── Internal Modules ──────────────────────────────────────────────────────
const { connectDB }         = require('./config/database');
const { connectRedis }      = require('./config/redis');
const { setupSwagger }      = require('./config/swagger');
const { apiLimiter }        = require('./middleware/rateLimiter');
const { errorHandler }      = require('./middleware/errorHandler');
const { notFound }          = require('./middleware/notFound');
const logger                = require('./config/logger');

// ─── Route Imports ─────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const portfolioRoutes    = require('./routes/portfolio.routes');
const aiRoutes           = require('./routes/ai.routes');
const newsRoutes         = require('./routes/news.routes');
const goalRoutes         = require('./routes/goal.routes');
const reportRoutes       = require('./routes/report.routes');
const analyticsRoutes    = require('./routes/analytics.routes');
const alertRoutes        = require('./routes/alert.routes');
const uploadRoutes       = require('./routes/upload.routes');
const calculatorRoutes   = require('./routes/calculator.routes');
const healthRoutes       = require('./routes/health.routes');
const marketRoutes       = require('./routes/market.routes');
const watchlistRoutes    = require('./routes/watchlist.routes');

// ─── App Initialization ────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;
const API  = `/api/${process.env.API_VERSION || 'v1'}`;

// Trust Render's reverse proxy for accurate IP rate limiting
app.set('trust proxy', 1);

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc : ["'self'"],
      scriptSrc  : ["'self'", "'unsafe-inline'"],
      styleSrc   : ["'self'", "'unsafe-inline'"],
      imgSrc     : ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin      : [process.env.FRONTEND_URL, process.env.FRONTEND_PROD_URL].filter(Boolean),
  credentials : true,
  methods     : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── General Middleware ────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());   // Prevent NoSQL injection
app.use(xss());             // Prevent XSS attacks
app.use(hpp());             // Prevent HTTP Parameter Pollution

// ─── Request Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ─── Global Rate Limiter ───────────────────────────────────────────────────
app.use(API, apiLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Swagger Docs ─────────────────────────────────────────────────────────
setupSwagger(app);

// ─── API Routes ───────────────────────────────────────────────────────────
app.use(`${API}/auth`,        authRoutes);
app.use(`${API}/users`,       userRoutes);
app.use(`${API}/portfolio`,   portfolioRoutes);
app.use(`${API}/ai`,          aiRoutes);
app.use(`${API}/news`,        newsRoutes);
app.use(`${API}/goals`,       goalRoutes);
app.use(`${API}/reports`,     reportRoutes);
app.use(`${API}/analytics`,   analyticsRoutes);
app.use(`${API}/alerts`,      alertRoutes);
app.use(`${API}/upload`,      uploadRoutes);
app.use(`${API}/calculators`, calculatorRoutes);
app.use(`${API}/health`,      healthRoutes);
app.use(`${API}/market`,      marketRoutes);
app.use(`${API}/watchlist`,   watchlistRoutes);

// ─── Root Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success : true,
    message : '🚀 InvestIQ AI API is live',
    version : process.env.API_VERSION || 'v1',
    docs    : `/api-docs`,
    timestamp: new Date().toISOString(),
  });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

// ─── 404 & Error Handlers ─────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database + Server Start ───────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    const server = app.listen(PORT, () => {
      logger.info(`✅ InvestIQ AI server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`⚠️  ${signal} received — shutting down gracefully`);
      server.close(async () => {
        const { sequelize } = require('./config/database');
        await sequelize.close();
        logger.info('💤 Database connection closed. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error(`💥 Unhandled Rejection: ${err.message}`);
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      logger.error(`💥 Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
module.exports = app; // For testing
