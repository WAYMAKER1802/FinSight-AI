# Installation Guide

This guide provides step-by-step instructions to set up the FinSight AI development environment on your local machine.

## Prerequisites
Ensure you have the following installed:
*   **Node.js**: v18.0.0 or higher
*   **npm**: v9.0.0 or higher
*   **MongoDB**: v6.0 or higher (Local or MongoDB Atlas)
*   **Redis**: v7.0 or higher
*   **Git**

## 1. Clone the Repository
```bash
git clone <repository_url>
cd XEBIA
```

## 2. Backend Setup
```bash
cd backend
npm install
```

### Configure Backend Environment
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finsight
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_user
EMAIL_PASS=your_pass
```

### Start the Backend Server
```bash
npm run dev
```
*The server will start on http://localhost:5000*

## 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### Configure Frontend Environment
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Start the Frontend Server
```bash
npm run dev
```
*The application will be available at http://localhost:5173*

## 4. Verify Installation
1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new user account.
3. Check the backend terminal to ensure MongoDB and Redis connected successfully.
