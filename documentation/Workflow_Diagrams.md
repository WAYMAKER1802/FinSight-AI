# Workflow Diagrams

> All diagrams are in **Mermaid** format and render natively on GitHub.

---

## 1. User Registration & Onboarding Workflow

```mermaid
flowchart TD
    A([Visitor lands on website]) --> B[Views Landing Page]
    B --> C{New user?}
    C -- Yes --> D[Clicks Register]
    C -- No --> E[Clicks Sign In]
    D --> F[Step 1: Basic Info\nName, Email, Password]
    F --> G{Validation OK?}
    G -- No --> F
    G -- Yes --> H[Step 2: Select Risk Profile]
    H --> I[Create Account API]
    I --> J[Send verification email]
    J --> K[Redirect to Dashboard]
    K --> L[Show onboarding tour]
    L --> M[Create first portfolio]
    M --> N([User Active 🎉])
    E --> O[Login page]
    O --> P[Enter credentials]
    P --> Q{Auth OK?}
    Q -- No --> P
    Q -- Yes --> K
```

---

## 2. AI Portfolio Analysis Workflow

```mermaid
flowchart TD
    A([User clicks Analyze Portfolio]) --> B{Portfolio exists?}
    B -- No --> C[Prompt to add assets]
    B -- Yes --> D[Fetch latest prices via Finnhub]
    D --> E[Recalculate totals]
    E --> F[Build AI prompt with portfolio data]
    F --> G[Send to GPT-4 with JSON mode]
    G --> H{AI responds within 30s?}
    H -- No --> I[Timeout — return cached analysis]
    H -- Yes --> J[Parse JSON response]
    J --> K[Extract: health score, insights,\nrecommendations, risk warnings]
    K --> L[Save analysis to MongoDB]
    L --> M[Display on dashboard]
    M --> N{User action on insight?}
    N -- Chat --> O[Open AI Coach with context]
    N -- Dismiss --> P[Log dismissed]
    N -- Save --> Q[Bookmark insight]
```

---

## 3. Smart Alert Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Alert triggered or manually created

    Created --> Active: Alert enabled & watching
    Active --> Triggered: Condition met
        note right of Triggered: Price hit target,\nPortfolio dropped > threshold,\nAI generates warning

    Triggered --> Delivered: Push/Email sent
    Delivered --> Unread: In app_notifications
    Unread --> Read: User views alert
    Read --> Archived: User archives
    Archived --> [*]: Deleted

    Active --> Disabled: User turns off
    Disabled --> Active: User re-enables
    Disabled --> [*]: Deleted
```

---

## 4. CSV Portfolio Import Workflow

```mermaid
flowchart TD
    A([User uploads CSV file]) --> B[Multer receives file]
    B --> C{File type valid?\n.csv or .xlsx}
    C -- No --> D[Return 400 error\nInvalid file type]
    C -- Yes --> E{File size ≤ 10MB?}
    E -- No --> F[Return 413 Payload Too Large]
    E -- Yes --> G[Save to /uploads/]
    G --> H[PapaParse / XLSX parse]
    H --> I[Map columns to schema\nsymbol, name, qty, price]
    I --> J{At least 1 valid asset?}
    J -- No --> K[Return 400 — No valid data]
    J -- Yes --> L[Create Portfolio in MongoDB]
    L --> M[Fetch live prices for all symbols]
    M --> N[Recalculate scores]
    N --> O[Delete temp file]
    O --> P[Return success + portfolio]
    P --> Q([Portfolio ready 🎉])
```

---

## 5. Goal Planning AI Workflow

```mermaid
flowchart LR
    A([User creates goal]) --> B[Input: target, date, SIP]
    B --> C[Calculate basic SIP\nusing financial formulas]
    C --> D[Request AI plan\nPOST /goals/:id/ai-plan]
    D --> E[AI analyzes:\n- Current financial state\n- Income & expenses\n- Existing investments]
    E --> F[AI generates:\n- Optimized SIP amount\n- Asset allocation\n- Milestone schedule\n- Risk warnings]
    F --> G[Save AI suggestions to DB]
    G --> H[Display plan to user]
    H --> I{User action}
    I -- Accepts --> J[Update goal with plan]
    I -- Modifies --> B
    I -- Rejects --> K[Keep manual plan]
    J --> L[Track progress monthly]
    L --> M{On track?}
    M -- Yes --> N[🎉 Progress notification]
    M -- No --> O[⚠️ AI recalculation alert]
    O --> D
```

---

## 6. Retirement Planning Workflow

```mermaid
flowchart TD
    A([User opens Retirement Planner]) --> B[Input Parameters:\n- Current age\n- Retirement age\n- Monthly expenses\n- Inflation rate\n- Expected return\n- Current corpus\n- Monthly SIP]
    B --> C[Calculate inflation-adjusted\nexpenses at retirement]
    C --> D[Calculate corpus required\nusing real return formula]
    D --> E[Project future value of\ncurrent SIP + corpus]
    E --> F{Gap calculation}
    F --> G{Surplus or Deficit?}
    G -- Surplus --> H[✅ On Track message\nShow surplus amount]
    G -- Deficit --> I[⚠️ Gap identified\nSuggest higher SIP]
    I --> J[Calculate required SIP\nto close the gap]
    J --> K[Display adjustment needed]
    H & K --> L[Show 40-year\ngrowth projection chart]
    L --> M[AI generates retirement summary]
```

---

## 7. News Intelligence Pipeline

```mermaid
flowchart TD
    A([User opens News page]) --> B[Fetch from NewsAPI\nq=stock market India]
    B --> C{API available?}
    C -- No --> D[Load mock/cached news]
    C -- Yes --> E[Receive articles array]
    D & E --> F[Match articles against\nuser's portfolio holdings]
    F --> G[Tag articles with\naffected symbols]
    G --> H[Sort by:\n1. Relevance to holdings\n2. Impact level\n3. Publication time]
    H --> I[User clicks AI Digest button]
    I --> J[Send articles + holdings to AI]
    J --> K[AI generates:\n- Summary\n- Impact on portfolio\n- Action recommendations]
    K --> L[Display AI digest panel]
    L --> M{User action on recommendation?}
    M -- Go to portfolio --> N[Open Portfolio page]
    M -- Chat with AI --> O[Open AI Chat with context]
    M -- Dismiss --> P[Log as read]
```

---

## 8. Report Generation Workflow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API
    participant DB as MongoDB
    participant PDF as PDFKit Service
    participant FS as File System

    User->>FE: Click "Generate Report"
    FE->>API: POST /reports/generate/:portfolioId
    API->>DB: Find portfolio data
    DB-->>API: Portfolio with all assets
    API->>DB: Create Report (status: generating)
    DB-->>API: Report ID
    API-->>FE: 202 Accepted + reportId
    FE-->>User: Show "Report generating..."

    Note over API,PDF: Async generation
    API->>PDF: generatePortfolioReport(portfolio, user, aiAnalysis)
    PDF->>FS: Create PDF file
    PDF->>FS: Write: header, summary, holdings table, AI insights
    FS-->>PDF: File written
    PDF-->>API: { filePath, filename, fileSize }
    API->>DB: Update Report (status: ready, filePath)

    User->>FE: Click "Download Report"
    FE->>API: GET /reports/:id/download
    API->>DB: Find report + verify ownership
    DB-->>API: Report metadata
    API->>FS: stream file
    FS-->>FE: PDF binary stream
    FE-->>User: Download PDF 📄
```

---

## 9. CI/CD Pipeline Workflow

```mermaid
flowchart TD
    A([Developer pushes code]) --> B[GitHub Actions trigger]
    B --> C[Run: npm install]
    C --> D[Run: Lint ESLint + TypeScript]
    D --> E{Lint errors?}
    E -- Yes --> F[❌ Block merge\nNotify developer]
    E -- No --> G[Run backend unit tests\nJest]
    G --> H{Tests pass?}
    H -- No --> F
    H -- Yes --> I[Run frontend build\nvite build]
    I --> J{Build success?}
    J -- No --> F
    J -- Yes --> K[Calculate coverage]
    K --> L{Coverage ≥ 70%?}
    L -- No --> M[⚠️ Warning but continue]
    L -- Yes --> N[✅ All checks pass]
    N --> O{Branch is main?}
    O -- No --> P[PR approved — ready to merge]
    O -- Yes --> Q[Build Docker images]
    Q --> R[Push to Docker Hub]
    R --> S[Deploy to staging]
    S --> T[Run smoke tests]
    T --> U{Smoke tests pass?}
    U -- No --> V[🔴 Rollback deployment]
    U -- Yes --> W[Deploy to production 🚀]
```

---

## 10. Security & Access Control Workflow

```mermaid
flowchart TD
    A([Incoming API Request]) --> B[Helmet.js Security Headers]
    B --> C[CORS Validation]
    C --> D{Origin allowed?}
    D -- No --> E[403 Forbidden]
    D -- Yes --> F[Rate Limiter Check]
    F --> G{Within rate limit?}
    G -- No --> H[429 Too Many Requests]
    G -- Yes --> I[Extract JWT from Authorization header]
    I --> J{Token present?}
    J -- No --> K[401 No token provided]
    J -- Yes --> L[Verify JWT signature]
    L --> M{Valid & not expired?}
    M -- No --> N{Has refresh cookie?}
    N -- Yes --> O[Issue new access token]
    N -- No --> P[401 Please login again]
    M -- Yes --> Q[Load user from MongoDB]
    Q --> R[Check route permission\nRBAC middleware]
    R --> S{Role authorized?}
    S -- No --> T[403 Insufficient permissions]
    S -- Yes --> U[Check premium guard if needed]
    U --> V{Premium required?}
    V -- No --> W[Process request ✅]
    V -- Yes --> X{User is premium?}
    X -- No --> Y[402 Premium required]
    X -- Yes --> W
```
