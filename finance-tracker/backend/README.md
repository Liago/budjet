# Finance Tracker Backend

NestJS backend for the Finance Tracker application.

## Features

- User authentication with JWT
- User profile management
- Category management
- Transaction tracking with filtering and pagination
- Tag management for additional transaction categorization
- Financial reporting with monthly and annual summaries
- Notification system with preferences management
- Recurrent payments automation

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Create a `.env` file based on `.env.example`
   - Configure your database connection string

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Environment Configuration

This project supports both development and production environments:

### Development Environment (Local SQLite)

To run the application in development mode using SQLite:

```bash
# Run with development environment
npm run start:dev

# Or manually configure and run
NODE_ENV=development node config-env.js
npm run start
```

### Production Environment (PostgreSQL)

To run the application in production mode using PostgreSQL:

```bash
# Run with production environment
npm run start:prod

# Or manually configure and run
NODE_ENV=production node config-env.js
npm run start
```

### Data Migration

To migrate data from SQLite (development) to PostgreSQL (production):

1. Extract data from SQLite:

   ```bash
   node migrate-data.js
   ```

2. This creates a `sqlite-data.json` file with all your data.

3. Update your `.env.production` file with PostgreSQL connection string.

4. Create PostgreSQL migrations:

   ```bash
   node recreate-migrations.js
   ```

5. Import data to PostgreSQL:
   ```bash
   node import-pg-data.js
   ```

## API Documentation

The API documentation is available at `/api/docs` when the server is running.

### Main Endpoints

- **Authentication**

  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get JWT token

- **Users**

  - `GET /api/users/me` - Get current user profile
  - `PATCH /api/users/me` - Update current user profile

- **Categories**

  - `GET /api/categories` - Get all categories
  - `POST /api/categories` - Create a new category
  - `GET /api/categories/:id` - Get a specific category
  - `PATCH /api/categories/:id` - Update a category
  - `DELETE /api/categories/:id` - Delete a category

- **Transactions**

  - `GET /api/transactions` - Get all transactions with filtering and pagination
  - `POST /api/transactions` - Create a new transaction
  - `GET /api/transactions/:id` - Get a specific transaction
  - `PATCH /api/transactions/:id` - Update a transaction
  - `DELETE /api/transactions/:id` - Delete a transaction

- **Tags**

  - `GET /api/tags` - Get all tags
  - `POST /api/tags` - Create a new tag
  - `GET /api/tags/:id` - Get a specific tag
  - `PATCH /api/tags/:id` - Update a tag
  - `DELETE /api/tags/:id` - Delete a tag

- **Reports**

  - `GET /api/reports/monthly` - Get monthly financial report
  - `GET /api/reports/annual` - Get annual financial report

- **Notifications**

  - `GET /api/notifications` - Get all notifications for current user
  - `GET /api/notifications/unread/count` - Get count of unread notifications
  - `PATCH /api/notifications/:id/read` - Mark a notification as read
  - `POST /api/notifications/read-all` - Mark all notifications as read
  - `DELETE /api/notifications/:id` - Delete a notification
  - `GET /api/notifications/preferences` - Get user notification preferences
  - `POST /api/notifications/preferences` - Update user notification preferences
  - `GET /api/notifications/preferences/default` - Get default notification preferences

- **Recurrent Payments**
  - `GET /api/recurrent-payments` - Get all recurrent payments
  - `POST /api/recurrent-payments` - Create a new recurrent payment
  - `GET /api/recurrent-payments/:id` - Get a specific recurrent payment
  - `PATCH /api/recurrent-payments/:id` - Update a recurrent payment
  - `DELETE /api/recurrent-payments/:id` - Delete a recurrent payment
  - `GET /api/recurrent-payments/last-execution` - Get info about last automatic execution

## Project Structure

- `src/`
  - `auth/` - Authentication module (JWT, Passport)
  - `users/` - User management
  - `transactions/` - Transaction CRUD operations
  - `categories/` - Category management
  - `tags/` - Tag management
  - `reports/` - Financial reporting
  - `notifications/` - Notification system and preferences
  - `recurrent-payments/` - Recurrent payments automation
  - `common/` - Shared utilities, guards, and decorators
  - `prisma/` - Prisma ORM service
  - `app.module.ts` - Main application module
  - `main.ts` - Application entry point
