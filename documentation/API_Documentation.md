# FinSight AI — API Documentation

> **Base URL:** `https://api.finsight.ai/api/v1`  
> **Format:** JSON  
> **Authentication:** Bearer Token (JWT)

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Endpoints

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "Secure@1234",
  "riskProfile": "moderate"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "_id": "64abc...",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "role": "user",
    "isPremium": false
  },
  "accessToken": "eyJhbGci...",
  "expiresIn": 900
}
```

**Errors:** `409` Email exists · `422` Validation failed

---

### POST `/auth/login`
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "arjun@example.com",
  "password": "Secure@1234"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": { "...user fields" },
  "accessToken": "eyJhbGci...",
  "expiresIn": 900
}
```

**Errors:** `401` Invalid credentials · `403` Account disabled

---

### POST `/auth/refresh`
Refresh access token using HttpOnly refresh cookie.

**Response 200:**
```json
{ "success": true, "accessToken": "eyJhbGci...", "expiresIn": 900 }
```

---

### POST `/auth/logout` 🔒
Invalidate refresh token.

---

### GET `/auth/me` 🔒
Get authenticated user profile.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "role": "premium", "isPremium": true }
  }
}
```

---

### POST `/auth/forgot-password`
Send password reset email.

**Request Body:** `{ "email": "user@example.com" }`

---

### PATCH `/auth/reset-password/:token`
Reset password with token from email.

**Request Body:** `{ "password": "NewSecure@1234" }`

---

## 📊 Portfolio Endpoints

### GET `/portfolios` 🔒
Get all portfolios for the authenticated user.

**Response 200:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "portfolios": [
      {
        "_id": "...",
        "name": "Growth Portfolio",
        "totalCurrentValue": 2485320,
        "totalReturns": 485320,
        "returnsPercent": 24.2,
        "healthScore": 84,
        "riskScore": 5.5,
        "assets": [...]
      }
    ]
  }
}
```

---

### POST `/portfolios` 🔒
Create a new portfolio.

**Request Body:**
```json
{
  "name": "Retirement Fund",
  "currency": "INR",
  "description": "Long-term retirement portfolio"
}
```

---

### GET `/portfolios/:id` 🔒
Get a specific portfolio by ID.

---

### PUT `/portfolios/:id` 🔒
Update portfolio metadata.

---

### DELETE `/portfolios/:id` 🔒
Delete a portfolio.

---

### POST `/portfolios/:id/assets` 🔒
Add an asset to a portfolio.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "name": "Reliance Industries Ltd.",
  "type": "stock",
  "quantity": 25,
  "avgBuyPrice": 2400,
  "sector": "Energy",
  "buyDate": "2023-01-15"
}
```

---

### PUT `/portfolios/:id/assets/:assetId` 🔒
Update an existing asset.

---

### DELETE `/portfolios/:id/assets/:assetId` 🔒
Remove an asset from portfolio.

---

### GET `/portfolios/:id/performance` 🔒
Get portfolio performance history.

**Query Params:** `?period=1M|3M|6M|1Y|3Y|ALL`

---

### POST `/portfolios/:id/refresh-prices` 🔒
Trigger live price refresh from market APIs.

---

## 🤖 AI Endpoints

### POST `/ai/analyze-portfolio` 🔒 ⭐ Premium
AI deep analysis of a portfolio.

**Request Body:**
```json
{ "portfolioId": "64abc..." }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "healthScore": 84,
      "riskScore": 5.5,
      "diversificationScore": 65,
      "strengths": ["Strong IT exposure during tech rally"],
      "weaknesses": ["IT concentration above 30% threshold"],
      "insights": [
        {
          "type": "rebalance",
          "priority": "high",
          "message": "Reduce IT sector to below 30% by trimming TCS",
          "action": "Sell 5 shares TCS"
        }
      ],
      "recommendations": [
        { "symbol": "HDFCBANK", "action": "BUY", "reasoning": "Technically oversold" }
      ],
      "summary": "Your portfolio shows strong returns..."
    }
  }
}
```

---

### POST `/ai/chat` 🔒
Chat with the AI financial coach.

**Request Body:**
```json
{
  "message": "Should I invest in HDFC Bank now?",
  "sessionId": "sess_123",
  "history": [
    { "role": "user", "content": "What is my portfolio health?" },
    { "role": "assistant", "content": "Your portfolio health is 84/100..." }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reply": "Based on current technicals, HDFC Bank (RSI: 28) appears oversold...",
    "sessionId": "sess_123",
    "tokensUsed": 450
  }
}
```

---

### POST `/ai/risk-assessment` 🔒 ⭐ Premium
AI portfolio risk scoring.

---

### POST `/ai/plan-goal` 🔒
AI-powered goal planning.

**Request Body:**
```json
{
  "goalId": "...",
  "financialContext": {
    "monthlyIncome": 200000,
    "monthlyExpenses": 80000,
    "existingSIP": 15000
  }
}
```

---

### POST `/ai/generate-recommendations` 🔒 ⭐ Premium
Generate stock/MF recommendations based on profile.

---

### POST `/ai/summarize-news` 🔒
Summarize financial news impact on portfolio.

---

### GET `/ai/wealth-score` 🔒
Get AI-computed wealth score.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "score": 612,
    "level": "Wealth Builder",
    "rank": "Top 28%",
    "breakdown": {
      "portfolioSize": 185,
      "healthScore": 336,
      "diversification": 91
    }
  }
}
```

---

## 🎯 Goals Endpoints

### GET `/goals` 🔒
Get all user goals.

### POST `/goals` 🔒
Create a goal.

**Request Body:**
```json
{
  "name": "Early Retirement",
  "type": "retirement",
  "targetAmount": 50000000,
  "targetDate": "2045-01-01",
  "monthlySIP": 25000,
  "expectedReturns": 12,
  "priority": "high",
  "icon": "🏖️",
  "color": "#667eea"
}
```

### GET `/goals/:id` 🔒
### PUT `/goals/:id` 🔒
### DELETE `/goals/:id` 🔒
### POST `/goals/:id/update-progress` 🔒
### POST `/goals/:id/ai-plan` 🔒
AI-generate a goal achievement plan.

---

## 🔔 Alerts Endpoints

### GET `/alerts` 🔒
Get all alerts (with optional `?unreadOnly=true&severity=warning`).

### POST `/alerts` 🔒
Create a custom alert.

### PATCH `/alerts/:id/read` 🔒
Mark alert as read.

### PATCH `/alerts/mark-all-read` 🔒
Mark all alerts as read.

### DELETE `/alerts/:id` 🔒
Delete an alert.

### GET `/alerts/unread-count` 🔒
Get unread alert count (for badge).

**Response 200:**
```json
{ "success": true, "data": { "count": 3 } }
```

---

## 📰 News Endpoints

### GET `/news` 🔒
Fetch financial news.

**Query Params:**
- `q` — Search query (default: "stock market India")
- `pageSize` — Results per page (default: 20)
- `category` — Filter category

### GET `/news/company/:symbol` 🔒
Get company-specific news.

### GET `/news/market-sentiment` 🔒
Get overall market sentiment index.

---

## 📈 Analytics Endpoints

### GET `/analytics/portfolio-performance/:id` 🔒
Historical portfolio performance.

### GET `/analytics/benchmark-comparison` 🔒 ⭐ Premium
Compare portfolio vs. Nifty 50.

### GET `/analytics/sector-breakdown` 🔒
Sector allocation breakdown.

### GET `/analytics/top-performers` 🔒
Best/worst performing assets.

---

## 📄 Reports Endpoints

### GET `/reports` 🔒
Get all generated reports.

### POST `/reports/generate/:portfolioId` 🔒 ⭐ Premium
Generate a PDF portfolio report.

**Request Body:**
```json
{
  "type": "portfolio_analysis",
  "title": "Q2 2025 Portfolio Report"
}
```

**Response 202:**
```json
{
  "success": true,
  "message": "Report generation started",
  "data": { "reportId": "...", "status": "generating" }
}
```

### GET `/reports/:id/download` 🔒
Download a report PDF.

### DELETE `/reports/:id` 🔒
Delete a report.

---

## ⚙️ Calculators Endpoints

### POST `/calculators/sip`
SIP future value calculator.

**Request Body:**
```json
{ "monthly": 10000, "annualReturn": 12, "years": 10 }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyInvestment": 10000,
    "totalInvested": 1200000,
    "estimatedGains": 1103567,
    "maturityAmount": 2303567,
    "absoluteReturn": 91.96,
    "cagr": 12
  }
}
```

### POST `/calculators/emi`
EMI calculator.

### POST `/calculators/cagr`
CAGR calculator.

### POST `/calculators/inflation`
Inflation-adjusted value calculator.

### POST `/calculators/retirement`
Retirement corpus calculator.

### POST `/calculators/goal`
Goal SIP calculator (reverse engineering the required SIP).

---

## 👤 User Endpoints

### GET `/users/profile` 🔒
Get detailed user profile.

### PUT `/users/profile` 🔒
Update profile information.

### POST `/users/change-password` 🔒
Change account password.

### POST `/users/upload-avatar` 🔒
Upload profile picture.

### DELETE `/users/account` 🔒
Delete account (requires password confirmation).

---

## 📤 Upload Endpoints

### POST `/upload/portfolio` 🔒
Import portfolio from CSV/Excel file.

**Headers:** `Content-Type: multipart/form-data`

**Form Data:**
- `file` — CSV or XLSX file
- `name` — Portfolio name (optional)

**CSV Format:**
```
Symbol,Name,Type,Quantity,Avg Buy Price,Sector,Buy Date
RELIANCE,Reliance Industries,stock,10,2400,Energy,2023-01-15
```

### GET `/upload/template`
Download the CSV import template.

---

## ❤️ Health Endpoint

### GET `/health`
Server health check.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-08T10:00:00.000Z",
  "version": "v1",
  "services": {
    "api": "up",
    "database": "up"
  },
  "system": {
    "uptime": "2d 4h 32m",
    "memoryUsed": "142MB",
    "nodeVersion": "v20.11.0"
  }
}
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 202  | Accepted (async job started) |
| 400  | Bad Request |
| 401  | Unauthorized |
| 402  | Premium Required |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict (duplicate) |
| 413  | Payload Too Large |
| 422  | Validation Error |
| 429  | Rate Limit Exceeded |
| 500  | Internal Server Error |
| 503  | Service Unavailable |

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| Auth (login/register) | 5 req / 15 min |
| AI endpoints | 20 req / hour |
| Portfolio CRUD | 100 req / 15 min |
| File upload | 10 req / hour |
| General | 100 req / 15 min |
