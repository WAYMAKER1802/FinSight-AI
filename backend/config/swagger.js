/**
 * Swagger / OpenAPI 3.0 Configuration
 * ─────────────────────────────────────
 * Auto-generates interactive API documentation from JSDoc comments.
 * Accessible at /api-docs (development) or behind basic auth (production).
 */

'use strict';

const swaggerJsdoc    = require('swagger-jsdoc');
const swaggerUi       = require('swagger-ui-express');
const path            = require('path');

const swaggerDefinition = {
  openapi : '3.0.0',
  info    : {
    title       : 'InvestIQ AI — REST API',
    version     : '1.0.0',
    description : `
## 🚀 InvestIQ AI — AI-Driven Financial Portfolio Advisor

### Overview
InvestIQ AI provides a comprehensive REST API for managing financial portfolios,
generating AI-powered investment recommendations, analyzing market sentiment,
and delivering personalized financial guidance.

### Authentication
All protected endpoints require a **Bearer JWT token** in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

### Rate Limiting
- General API: 100 requests / 15 minutes
- AI endpoints: 20 requests / 15 minutes
- Auth endpoints: 10 requests / 15 minutes

### Response Format
All responses follow a consistent envelope:
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}
\`\`\`
    `,
    contact     : {
      name  : 'InvestIQ AI Engineering Team',
      email : 'api@investiq.ai',
      url   : 'https://investiq.ai',
    },
    license     : {
      name : 'MIT',
      url  : 'https://opensource.org/licenses/MIT',
    },
    'x-logo': {
      url: 'https://investiq.ai/logo.png',
    },
  },
  servers: [
    {
      url        : 'http://localhost:5000/api/v1',
      description: 'Development Server',
    },
    {
      url        : 'https://api.investiq.ai/api/v1',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type        : 'http',
        scheme      : 'bearer',
        bearerFormat: 'JWT',
        description : 'Enter your JWT access token',
      },
    },
    schemas: {
      // ── Success Response ──────────────────────────────────────────────
      SuccessResponse: {
        type      : 'object',
        properties: {
          success  : { type: 'boolean', example: true },
          message  : { type: 'string',  example: 'Operation successful' },
          data     : { type: 'object' },
          timestamp: { type: 'string',  format: 'date-time' },
        },
      },
      // ── Error Response ────────────────────────────────────────────────
      ErrorResponse: {
        type      : 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string',  example: 'An error occurred' },
          errors : { type: 'array', items: { type: 'object' } },
          stack  : { type: 'string',  description: 'Stack trace (dev only)' },
        },
      },
      // ── Pagination ────────────────────────────────────────────────────
      PaginationMeta: {
        type      : 'object',
        properties: {
          page     : { type: 'integer', example: 1 },
          limit    : { type: 'integer', example: 20 },
          total    : { type: 'integer', example: 150 },
          totalPages: { type: 'integer', example: 8 },
          hasNext  : { type: 'boolean', example: true },
          hasPrev  : { type: 'boolean', example: false },
        },
      },
      // ── User ──────────────────────────────────────────────────────────
      User: {
        type      : 'object',
        properties: {
          _id         : { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          name        : { type: 'string', example: 'Arjun Sharma' },
          email       : { type: 'string', format: 'email', example: 'arjun@example.com' },
          role        : { type: 'string', enum: ['user', 'premium', 'admin'] },
          avatar      : { type: 'string', example: 'https://api.investiq.ai/uploads/avatars/user.jpg' },
          riskProfile : { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] },
          createdAt   : { type: 'string', format: 'date-time' },
        },
      },
      // ── Portfolio ─────────────────────────────────────────────────────
      Portfolio: {
        type      : 'object',
        required  : ['name'],
        properties: {
          _id          : { type: 'string' },
          name         : { type: 'string', example: 'My Growth Portfolio' },
          totalValue   : { type: 'number', example: 1250000.50 },
          totalInvested: { type: 'number', example: 1000000 },
          returns      : { type: 'number', example: 25.00 },
          cagr         : { type: 'number', example: 12.5 },
          healthScore  : { type: 'number', example: 82 },
          riskScore    : { type: 'number', example: 6.5 },
          assets       : { type: 'array', items: { '$ref': '#/components/schemas/Asset' } },
        },
      },
      // ── Asset ─────────────────────────────────────────────────────────
      Asset: {
        type      : 'object',
        properties: {
          symbol       : { type: 'string', example: 'RELIANCE' },
          name         : { type: 'string', example: 'Reliance Industries Ltd.' },
          type         : { type: 'string', enum: ['stock', 'mutual_fund', 'etf', 'crypto', 'gold', 'bond', 'fd', 'ppf'] },
          quantity     : { type: 'number', example: 100 },
          avgBuyPrice  : { type: 'number', example: 2400 },
          currentPrice : { type: 'number', example: 2780 },
          currentValue : { type: 'number', example: 278000 },
          allocation   : { type: 'number', example: 22.24 },
          returns      : { type: 'number', example: 15.83 },
          recommendation: { type: 'string', enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'] },
        },
      },
      // ── AI Recommendation ─────────────────────────────────────────────
      AIRecommendation: {
        type      : 'object',
        properties: {
          portfolioId     : { type: 'string' },
          healthScore     : { type: 'number', example: 78 },
          overallSentiment: { type: 'string', enum: ['bullish', 'neutral', 'bearish'] },
          recommendations : { type: 'array', items: { type: 'object' } },
          riskLevel       : { type: 'string', enum: ['low', 'moderate', 'high', 'very_high'] },
          diversification : { type: 'object' },
          insights        : { type: 'array', items: { type: 'string' } },
          generatedAt     : { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: 'Auth',        description: 'Authentication & Authorization' },
    { name: 'Users',       description: 'User profile management' },
    { name: 'Portfolio',   description: 'Portfolio CRUD operations' },
    { name: 'AI',          description: 'AI analysis & recommendations' },
    { name: 'News',        description: 'Financial news & sentiment' },
    { name: 'Goals',       description: 'Investment goal planning' },
    { name: 'Reports',     description: 'PDF report generation' },
    { name: 'Analytics',   description: 'Portfolio analytics & metrics' },
    { name: 'Alerts',      description: 'Smart alert management' },
    { name: 'Calculators', description: 'Financial calculators (SIP, CAGR, etc.)' },
    { name: 'Upload',      description: 'CSV/Excel portfolio upload' },
    { name: 'Health',      description: 'API health check' },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.routes.js'),
    path.join(__dirname, '../controllers/*.controller.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .swagger-ui .topbar-wrapper .link { color: white; font-weight: bold; }
    .swagger-ui .info .title { color: #667eea; }
  `,
  customSiteTitle : 'InvestIQ AI — API Docs',
  customfavIcon   : '/favicon.ico',
  swaggerOptions  : {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
};

/**
 * Setup Swagger middleware on the Express app.
 * @param {import('express').Application} app
 */
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger, swaggerSpec };
