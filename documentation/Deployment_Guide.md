# Deployment Guide

This document outlines the procedures for deploying FinSight AI to a production environment.

## 1. Containerized Deployment (Docker)
The recommended deployment strategy for FinSight AI is via Docker and Docker Compose. This ensures environment consistency across development, staging, and production.

### 1.1 Prerequisites
*   Docker Engine
*   Docker Compose

### 1.2 Environment Variables
Ensure the `.env.production` file is securely placed on the host machine.
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongo:27017/finsight_prod
REDIS_URL=redis://redis:6379
JWT_SECRET=<strong_production_secret>
OPENAI_API_KEY=<production_openai_key>
FRONTEND_URL=https://app.finsight.ai
```

### 1.3 Deployment Execution
Run the following command in the root directory containing the `docker-compose.yml` file:
```bash
docker-compose up -d --build
```
This command will:
1. Build the Node.js backend container.
2. Spin up MongoDB and Redis instances.
3. Build the Vite frontend and serve it using Nginx (if configured in compose).

## 2. CI/CD Pipeline (GitHub Actions)
FinSight AI utilizes GitHub Actions for continuous integration and deployment.

### 2.1 Workflows
*   **`.github/workflows/ci.yml`**: Triggers on Pull Requests. Runs ESLint, Jest unit tests, and Supertest integration tests.
*   **`.github/workflows/deploy.yml`**: Triggers on pushes to the `main` branch. Builds Docker images and pushes them to a container registry, then triggers a remote server update via SSH.

## 3. Database Backups
Schedule daily cron jobs on the production server to run `mongodump` and upload the archive to an S3 bucket for disaster recovery.

## 4. Monitoring
*   Application logs are aggregated via Winston.
*   Consider integrating PM2 if running natively without Docker.
*   Monitor Redis memory usage to prevent eviction of critical cache keys.
