# Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for **FinSight AI**, an AI-Driven Financial Portfolio Advisor. It provides a comprehensive overview of the system, its features, and constraints.

### 1.2 Scope
FinSight AI is a comprehensive Wealth Management platform merging FinTech and Artificial Intelligence. The system allows users to manage their financial portfolios, receive AI-powered stock recommendations, and assess portfolio risk.

## 2. Overall Description
### 2.1 Product Perspective
FinSight AI operates as a client-server web application. The frontend is built with React and TypeScript, and the backend utilizes Node.js, Express, and MongoDB.

### 2.2 User Classes and Characteristics
*   **Standard Users**: Individuals tracking their investments, seeking AI advice.
*   **Administrators**: System maintainers managing users and overall platform health.

## 3. Functional Requirements
### 3.1 Authentication & Authorization
*   **FR-1**: The system shall allow users to register and log in securely (JWT-based).
*   **FR-2**: The system shall support Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) for data privacy.
*   **FR-3**: The system shall support secure password resets via email.

### 3.2 Portfolio Management
*   **FR-4**: Users shall be able to create, view, update, and delete financial portfolios.
*   **FR-5**: Users shall be able to track individual asset transactions (buy/sell).

### 3.3 AI Advisor
*   **FR-6**: The system shall analyze user portfolios and return a health score and risk assessment.
*   **FR-7**: The system shall provide stock recommendations via an AI conversational interface.

### 3.4 Notifications
*   **FR-8**: The system shall dispatch multi-channel notifications (In-App, Email, Push).

## 4. Non-Functional Requirements
### 4.1 Security
*   **NFR-1**: All passwords must be hashed using bcrypt.
*   **NFR-2**: APIs must implement rate limiting, helmet security headers, and XSS protection.

### 4.2 Performance
*   **NFR-3**: AI responses must be cached using Redis to minimize latency and API costs.
*   **NFR-4**: Database queries shall utilize appropriate indexing.

### 4.3 Availability
*   **NFR-5**: The system shall aim for 99.9% uptime, utilizing Docker containerization for reliable deployments.
