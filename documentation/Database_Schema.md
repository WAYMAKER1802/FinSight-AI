# Database Schema

InvestIQ AI uses MongoDB, a NoSQL document database. Mongoose is used as the Object Data Modeling (ODM) library.

## 1. User Collection
Stores authentication, authorization, and profile preferences.
*   `_id`: ObjectId
*   `name`: String (Required)
*   `email`: String (Required, Unique, Indexed)
*   `password`: String (Hashed)
*   `role`: String (Enum: 'user', 'admin' - Default: 'user')
*   `riskProfile`: String (Enum: 'conservative', 'moderate', 'aggressive')
*   `notifications`: Object (Preferences for email, push)
*   `passwordResetToken`: String
*   `passwordResetExpires`: Date
*   `timestamps`: createdAt, updatedAt

## 2. Portfolio Collection
Stores user investment portfolios.
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: 'User', Indexed)
*   `name`: String (Required)
*   `description`: String
*   `assets`: Array of Objects
    *   `symbol`: String
    *   `quantity`: Number
    *   `averagePrice`: Number
*   `timestamps`: createdAt, updatedAt

## 3. Transaction Collection
Audit log of all buy/sell activities.
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: 'User', Indexed)
*   `portfolioId`: ObjectId (Ref: 'Portfolio', Indexed)
*   `assetSymbol`: String
*   `assetName`: String
*   `type`: String (Enum: 'buy', 'sell')
*   `quantity`: Number
*   `price`: Number
*   `totalAmount`: Number
*   `date`: Date (Indexed)
*   `timestamps`: createdAt, updatedAt

## 4. Alert Collection
In-App notifications for users.
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: 'User', Indexed)
*   `title`: String
*   `message`: String
*   `type`: String (e.g., 'system', 'portfolio')
*   `severity`: String (e.g., 'info', 'warning')
*   `isRead`: Boolean (Default: false)
*   `timestamps`: createdAt, updatedAt
