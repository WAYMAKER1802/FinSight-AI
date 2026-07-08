# Changelog

All notable changes to FinSight AI are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2025-07-08 🎉 Initial Release

### Added

#### Frontend
- ✅ Modern landing page with animated hero section and feature showcase
- ✅ Auth flow: Login, Register (2-step), Forgot Password
- ✅ Main Dashboard with portfolio stats, area chart, P&L bar chart, AI insights
- ✅ Portfolio Manager with filterable holdings table and allocation pie chart
- ✅ AI Chat with GPT-4 integration, typing indicator, and message history
- ✅ Analytics page with radar scorecard, bar comparisons, sector breakdown
- ✅ Financial News with AI digest and sentiment filtering
- ✅ Goal Planner with progress tracking and AI plan generation
- ✅ Risk Simulator with historical crash scenarios and impact visualization
- ✅ Financial Calculators: SIP, EMI, CAGR (interactive sliders)
- ✅ AI Reports with PDF generation and download
- ✅ Smart Alerts with severity-color system
- ✅ Market Mood with SVG Fear & Greed gauge
- ✅ Wealth Score with animated circular ring and achievement badges
- ✅ Investor Personality Test (5 questions, AI result)
- ✅ Retirement Planner with 40-year projection chart
- ✅ Settings: Profile, Notifications, AI, Security, Appearance
- ✅ Profile page with activity feed
- ✅ Dark theme with glassmorphism design system
- ✅ Fully responsive layout
- ✅ Animated sidebar navigation with mobile support

#### Backend
- ✅ Express.js REST API with full OpenAPI/Swagger documentation
- ✅ JWT Authentication with refresh token rotation
- ✅ RBAC: user / premium / admin roles
- ✅ MongoDB schemas: User, Portfolio, Goal, Alert, Report
- ✅ AI Service: GPT-4 portfolio analysis, chat, risk assessment, goal planning
- ✅ Portfolio Service: live price fetching, CSV/Excel import, smart alerts
- ✅ News Service: NewsAPI + Finnhub integration
- ✅ Report Service: auto-generated PDF reports (PDFKit)
- ✅ Financial Calculators: SIP, EMI, CAGR, inflation, retirement, goal
- ✅ Rate limiting per endpoint category
- ✅ Helmet.js security headers
- ✅ Winston structured logging

#### Infrastructure
- ✅ Docker + Docker Compose (MongoDB, Redis, Backend, Frontend)
- ✅ GitHub Actions CI/CD (5-stage: test, security, build, staging, production)
- ✅ Database seeder with demo data

#### Documentation
- ✅ README.md with full setup guide
- ✅ UML Diagrams (10 Mermaid diagrams)
- ✅ Workflow Diagrams (10 Mermaid diagrams)
- ✅ API Documentation (all endpoints)
- ✅ Security Architecture (RBAC/ABAC/MAC/DAC)
- ✅ SRS (Software Requirements Specification)
- ✅ CONTRIBUTING.md
- ✅ CHANGELOG.md

---

## [Unreleased] — Future

### Planned
- [ ] Real-time WebSocket price updates
- [ ] Demat account integration (Zerodha Kite, Groww)
- [ ] WhatsApp bot alerts
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Tax loss harvesting module
- [ ] Automated rebalancing
- [ ] Social portfolio sharing
- [ ] Mutual fund NAV tracking
- [ ] Options/Futures analytics
