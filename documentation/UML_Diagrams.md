# UML & Architecture Diagrams

> All diagrams are written in **Mermaid** and render natively on GitHub.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        Browser["React 18 + TypeScript<br/>Vite + Tailwind CSS"]
    end

    subgraph Gateway["🔀 API Gateway"]
        LB["Load Balancer<br/>Nginx"]
        CDN["CDN<br/>Cloudflare"]
    end

    subgraph Backend["⚙️ Backend Layer"]
        API["Express.js API<br/>Node.js 20"]
        WS["WebSocket Server<br/>Socket.io"]
    end

    subgraph AI["🤖 AI Layer"]
        OpenAI["OpenAI GPT-4<br/>API Client"]
        Prompts["Prompt Engine<br/>11 Templates"]
        Cache["AI Cache<br/>Redis"]
    end

    subgraph Data["🗄️ Data Layer"]
        MongoDB[("MongoDB Atlas<br/>Primary DB")]
        Redis[("Redis<br/>Sessions + Cache")]
        S3["AWS S3<br/>File Storage"]
    end

    subgraph External["🌍 External Services"]
        Finnhub["Finnhub API<br/>Stock Prices"]
        NewsAPI["NewsAPI<br/>Financial News"]
        AV["Alpha Vantage<br/>Market Data"]
        SMTP["SMTP<br/>Email Service"]
    end

    Browser --> CDN --> LB --> API
    Browser --> WS
    API --> OpenAI --> Prompts
    API --> Cache
    API --> MongoDB
    API --> Redis
    API --> S3
    API --> Finnhub
    API --> NewsAPI
    API --> AV
    API --> SMTP
```

---

## 2. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        string riskProfile
        string[] investmentGoals
        number annualIncome
        number monthlyExpenses
        string investmentHorizon
        boolean emailVerified
        boolean isPremium
        date createdAt
    }

    PORTFOLIO {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string currency
        boolean isDefault
        Asset[] assets
        number totalInvested
        number totalCurrentValue
        number totalReturns
        number returnsPercent
        number cagr
        number healthScore
        number riskScore
        number diversificationScore
        SectorAllocation[] sectorAllocation
        Snapshot[] snapshots
        date updatedAt
    }

    GOAL {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId portfolioId FK
        string name
        string type
        number targetAmount
        number currentAmount
        date targetDate
        number monthlySIP
        number expectedReturns
        string status
        string priority
        AISuggestion[] aiSuggestions
    }

    ALERT {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId portfolioId FK
        string type
        string title
        string message
        string severity
        boolean isRead
        date readAt
        string symbol
        number targetPrice
        string[] channels
    }

    REPORT {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId portfolioId FK
        string title
        string type
        string status
        string filePath
        number fileSize
        number downloadCount
        date createdAt
    }

    USER ||--o{ PORTFOLIO : "owns"
    USER ||--o{ GOAL : "sets"
    USER ||--o{ ALERT : "receives"
    USER ||--o{ REPORT : "generates"
    PORTFOLIO ||--o{ GOAL : "linked to"
    PORTFOLIO ||--o{ ALERT : "triggers"
    PORTFOLIO ||--o{ REPORT : "analyzed in"
```

---

## 3. Class Diagram — Backend Services

```mermaid
classDiagram
    class AIService {
        +analyzePortfolio(portfolio, user) Promise
        +chat(message, history, user) Promise
        +assessRisk(portfolio, user) Promise
        +planGoal(goal, financialContext) Promise
        +generateRecommendations(portfolio) Promise
        +summarizeNews(articles, holdings) Promise
        +scoreWealthProfile(portfolios, user) Promise
        -retryWithBackoff(fn, maxRetries) Promise
        -openai OpenAI
    }

    class PortfolioService {
        +fetchStockPrice(symbol) Promise
        +updatePortfolioPrices(portfolio) Promise
        +recalculateScores(portfolio) Portfolio
        +processCSVUpload(filePath) Promise
        +processExcelUpload(filePath) Asset[]
        +checkAndCreateAlerts(portfolio, userId) Promise
    }

    class NewsService {
        +fetchFinancialNews(query, pageSize) Promise
        +fetchCompanyNews(symbol, from, to) Promise
        +fetchMarketSentiment() Promise
        +fetchMarketOverview() Promise
        -getMockNews() Article[]
    }

    class ReportService {
        +generatePortfolioReport(portfolio, user, aiAnalysis) Promise
        -PDF_PATH string
    }

    class AuthController {
        +register(req, res, next) void
        +login(req, res, next) void
        +refreshToken(req, res, next) void
        +logout(req, res, next) void
        +getMe(req, res, next) void
        +changePassword(req, res, next) void
        +forgotPassword(req, res, next) void
        +resetPassword(req, res, next) void
    }

    class AIController {
        +analyzePortfolio(req, res, next) void
        +chat(req, res, next) void
        +assessRisk(req, res, next) void
        +planGoal(req, res, next) void
        +generateRecommendations(req, res, next) void
        +summarizeNews(req, res, next) void
        +getWealthScore(req, res, next) void
    }

    AIController --> AIService : uses
    PortfolioService --> NewsService : data
    ReportService --> AIService : AI insights
```

---

## 4. Sequence Diagram — AI Portfolio Analysis

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API as Express API
    participant Auth as Auth Middleware
    participant AICtrl as AI Controller
    participant AISvc as AI Service
    participant DB as MongoDB
    participant GPT as OpenAI GPT-4

    User->>Frontend: Click "Analyze Portfolio"
    Frontend->>API: POST /api/v1/ai/analyze-portfolio
    API->>Auth: Verify JWT + Check Premium
    Auth-->>API: User authenticated
    API->>AICtrl: analyzePortfolio(req, res)
    AICtrl->>DB: findOne(Portfolio, userId)
    DB-->>AICtrl: Portfolio data
    AICtrl->>AISvc: analyzePortfolio(portfolio, user)
    AISvc->>GPT: Chat Completion (structured JSON)
    Note over GPT: Processes holdings,<br/>calculates scores,<br/>generates insights
    GPT-->>AISvc: JSON analysis response
    AISvc-->>AICtrl: Parsed analysis object
    AICtrl->>DB: Update portfolio.lastAIAnalysis
    AICtrl-->>Frontend: 200 { analysis, insights, recommendations }
    Frontend-->>User: Display AI analysis panel
```

---

## 5. Authentication Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API
    participant JWT as JWT Service
    participant DB as MongoDB

    User->>FE: Enter credentials
    FE->>API: POST /auth/login
    API->>DB: Find user by email
    DB-->>API: User document
    API->>API: bcrypt.compare(password)

    alt Valid Credentials
        API->>JWT: Sign access token (15m)
        API->>JWT: Sign refresh token (7d)
        API->>DB: Store refresh token hash
        API-->>FE: { accessToken, user } + HttpOnly cookie
        FE->>FE: Store accessToken in Zustand + localStorage
        FE-->>User: Redirect to Dashboard
    else Invalid Credentials
        API-->>FE: 401 Unauthorized
        FE-->>User: Show error message
    end

    Note over FE,API: Later — Token Refresh
    FE->>API: Any request with expired token
    API-->>FE: 401 Token expired
    FE->>API: POST /auth/refresh (HttpOnly cookie)
    API->>JWT: Verify refresh token
    API->>JWT: Issue new access token
    API-->>FE: New accessToken
    FE->>API: Retry original request
```

---

## 6. RBAC Security Model

```mermaid
graph LR
    subgraph Roles
        admin["👑 Admin"]
        premium["⭐ Premium"]
        user["👤 User"]
    end

    subgraph Resources
        A["Portfolio CRUD"]
        B["AI Analysis"]
        C["AI Chat"]
        D["Reports PDF"]
        E["Goal Planner"]
        F["Risk Simulator"]
        G["News Feed"]
        H["Calculators"]
        I["User Management"]
        J["System Config"]
    end

    admin --> A & B & C & D & E & F & G & H & I & J
    premium --> A & B & C & D & E & F & G & H
    user --> A & G & H & E
    user -."Limited".-> C
    user -."No Access".-> B & D & F
```

---

## 7. Data Flow Diagram — Portfolio Update

```mermaid
flowchart TD
    A([User adds asset]) --> B[Validate input<br/>express-validator]
    B --> C{Valid?}
    C -- No --> D[Return 422 Validation Error]
    C -- Yes --> E[Save to MongoDB]
    E --> F[Fetch live price<br/>Finnhub API]
    F --> G{Price fetched?}
    G -- Yes --> H[Update currentPrice<br/>currentValue]
    G -- No --> I[Use avgBuyPrice<br/>as estimate]
    H & I --> J[Recalculate portfolio totals<br/>totalInvested, totalValue, P&L]
    J --> K[Recalculate scores<br/>Health, Risk, Diversification]
    K --> L[Update sector &<br/>asset class allocation]
    L --> M[Check smart alert rules<br/>stop loss, target price]
    M --> N{Alerts triggered?}
    N -- Yes --> O[Create Alert documents<br/>Push notification]
    N -- No --> P[Save portfolio]
    O --> P
    P --> Q[Return updated portfolio]
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph Internet
        Users["👥 Users"]
    end

    subgraph CloudFlare["☁️ Cloudflare CDN"]
        DDoS["DDoS Protection"]
        WAF["Web App Firewall"]
        Cache["Edge Cache"]
    end

    subgraph AWS["☁️ AWS / GCP"]
        subgraph EC2["EC2 Auto Scaling Group"]
            N1["Node.js Instance 1"]
            N2["Node.js Instance 2"]
            N3["Node.js Instance N"]
        end

        subgraph S3["S3 Buckets"]
            FE["Frontend Static Files"]
            Reports["PDF Reports"]
            Uploads["User Uploads"]
        end

        subgraph DB["Database Cluster"]
            MongoPrimary[("MongoDB Primary")]
            MongoReplica[("MongoDB Replica")]
            RedisCluster[("Redis Cluster")]
        end
    end

    Users --> CloudFlare --> EC2
    EC2 --> DB
    EC2 --> S3
```

---

## 9. Component Hierarchy — Frontend

```mermaid
graph TD
    App --> Router

    Router --> LandingPage
    Router --> AuthLayout
    Router --> AppLayout

    AuthLayout --> LoginPage
    AuthLayout --> RegisterPage
    AuthLayout --> ForgotPassword

    AppLayout --> Sidebar
    AppLayout --> TopBar
    AppLayout --> Pages

    Pages --> Dashboard
    Pages --> Portfolio
    Pages --> AIChat
    Pages --> Analytics
    Pages --> News
    Pages --> GoalPlanner
    Pages --> RiskSimulator
    Pages --> Calculators
    Pages --> Reports
    Pages --> Alerts
    Pages --> MarketMood
    Pages --> WealthScore
    Pages --> PersonalityTest
    Pages --> RetirementPlanner
    Pages --> Settings
    Pages --> Profile

    Dashboard --> StatCard
    Dashboard --> PortfolioChart
    Dashboard --> AllocationPie
    Dashboard --> HoldingsTable
    Dashboard --> AIInsights

    Portfolio --> AllocationPie
    Portfolio --> HoldingsTable

    AIChat --> MessageBubble
    AIChat --> TypingIndicator
    AIChat --> SuggestedQuestions
```

---

## 10. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> LoadingScreen
    LoadingScreen --> CheckAuth: App initializes
    CheckAuth --> Landing: Not authenticated
    CheckAuth --> Dashboard: Authenticated

    Landing --> RegisterPage: Click Register
    Landing --> LoginPage: Click Login
    RegisterPage --> Dashboard: Registration success
    LoginPage --> Dashboard: Login success

    Dashboard --> Portfolio: Navigate
    Dashboard --> AIChat: Navigate
    Dashboard --> Analytics: Navigate
    Dashboard --> GoalPlanner: Navigate

    AIChat --> Dashboard: Close chat
    Portfolio --> Dashboard: Back

    state Dashboard {
        [*] --> FetchPortfolio
        FetchPortfolio --> DisplayStats
        DisplayStats --> FetchAIInsights
        FetchAIInsights --> DisplayInsights
    }
```
