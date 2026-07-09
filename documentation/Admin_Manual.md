# Administrator Manual

This document outlines the capabilities and responsibilities of InvestIQ AI System Administrators.

## 1. Accessing the Admin Panel
To access admin features, your user account must have the `role` attribute set to `admin` in the database.
1. Log in with your admin credentials.
2. Navigate to the "Admin Dashboard" link in the sidebar.

## 2. User Management
*   **View Users**: See a paginated list of all registered users on the platform.
*   **Deactivate Accounts**: Temporarily suspend user access in cases of TOS violations.
*   **Role Management**: Promote users to administrators or demote them. (Exercise caution).

## 3. System Monitoring
*   **API Usage**: Monitor the volume of calls being made to the OpenAI API to track costs.
*   **Cache Status**: View Redis cache hit/miss ratios to ensure performance optimization is functioning correctly.

## 4. Global Alerts
Administrators can use the notification system to broadcast messages to all users (e.g., scheduled maintenance warnings or platform updates).

## 5. Security & Auditing
Administrators should regularly review the server logs (`logs/app.log`) for any unusual spike in 401 (Unauthorized) or 429 (Too Many Requests) HTTP errors, which may indicate attempted attacks.
