# Finance Tracker

A comprehensive finance tracking application with web and mobile interfaces.

## Project Overview

This application helps users track their income and expenses, categorize transactions, and visualize their financial data through charts and reports.

## Tech Stack

### Backend
- NestJS with TypeScript
- PostgreSQL database with Prisma ORM
- JWT Authentication with Passport.js

### Web Frontend
- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Chart.js for data visualization

### Mobile Frontend
- React Native with Expo
- TypeScript
- Redux Toolkit for state management
- React Navigation

## Project Structure

- `/backend` - NestJS backend with TypeScript
- `/frontend/web` - React web application with TypeScript
- `/frontend/mobile` - React Native mobile application with TypeScript
- `/docs` - Project documentation

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Docker and Docker Compose (optional)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/finance-tracker.git
   cd finance-tracker
   ```

2. Backend setup:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run start:dev
   ```

3. Web frontend setup:
   ```bash
   cd frontend/web
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

4. Mobile frontend setup:
   ```bash
   cd frontend/mobile
   npm install
   cp .env.example .env  # Configure your environment variables
   npx expo start
   ```

### Docker Setup

To run the entire application using Docker:

```bash
docker-compose up -d
```

This will start the backend API, PostgreSQL database, and web frontend.

## Documentation

- [API Documentation](./docs/api-docs.md)
- [Database Schema](./docs/database-schema.md)
- [Project Structure](./docs/project-structure.md)

## Features

- User authentication and account management
- Income and expense tracking
- Transaction categorization
- Tagging system for transactions
- Monthly and annual financial reports
- Data visualization with charts
- Mobile app for on-the-go tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details.