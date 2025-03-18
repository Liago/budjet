# Finance Tracker Project Structure

This document outlines the overall project structure for the Finance Tracker application.

## Repository Structure

```
finance-tracker/
├── backend/                 # NestJS backend application
│   ├── src/                 # Source code
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management module
│   │   ├── transactions/    # Transactions module
│   │   ├── categories/      # Categories module
│   │   ├── common/          # Shared utilities
│   │   ├── config/          # Application configuration
│   │   ├── app.module.ts    # Main application module
│   │   └── main.ts          # Application entry point
│   ├── prisma/              # Prisma ORM configuration and migrations
│   ├── test/                # Test files
│   ├── .env.example         # Example environment variables
│   ├── .gitignore           # Git ignore file
│   ├── nest-cli.json        # NestJS CLI configuration
│   ├── package.json         # Node.js dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── README.md            # Backend documentation
│
├── frontend/                # Frontend applications
│   ├── web/                 # React web application
│   │   ├── src/             # Source code
│   │   │   ├── assets/      # Static assets
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── store/       # Redux store
│   │   │   ├── services/    # API services
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   ├── App.tsx      # Main application component
│   │   │   └── main.tsx     # Application entry point
│   │   ├── public/          # Public assets
│   │   ├── .env.example     # Example environment variables
│   │   ├── .gitignore       # Git ignore file
│   │   ├── package.json     # Node.js dependencies
│   │   ├── tsconfig.json    # TypeScript configuration
│   │   ├── vite.config.ts   # Vite configuration
│   │   └── README.md        # Web frontend documentation
│   │
│   └── mobile/              # React Native mobile application
│       ├── src/             # Source code
│       │   ├── assets/      # Static assets
│       │   ├── components/  # Reusable UI components
│       │   ├── screens/     # Screen components
│       │   ├── navigation/  # Navigation configuration
│       │   ├── store/       # Redux store
│       │   ├── services/    # API services
│       │   ├── hooks/       # Custom React hooks
│       │   ├── utils/       # Utility functions
│       │   ├── types/       # TypeScript type definitions
│       │   └── App.tsx      # Main application component
│       ├── .env.example     # Example environment variables
│       ├── .gitignore       # Git ignore file
│       ├── app.json         # Expo configuration
│       ├── package.json     # Node.js dependencies
│       ├── tsconfig.json    # TypeScript configuration
│       └── README.md        # Mobile frontend documentation
│
├── docs/                    # Project documentation
│   ├── api-docs.md          # API documentation
│   ├── database-schema.md   # Database schema documentation
│   └── project-structure.md # This file
│
├── .gitignore               # Git ignore file
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # Main project documentation
```

## Development Workflow

1. **Backend Development**:
   - Work in the `backend/` directory
   - Follow NestJS module structure for organizing code
   - Use Prisma for database operations

2. **Web Frontend Development**:
   - Work in the `frontend/web/` directory
   - Organize components by feature and reusability
   - Use Redux for state management

3. **Mobile Frontend Development**:
   - Work in the `frontend/mobile/` directory
   - Use React Navigation for screen navigation
   - Share business logic with web frontend where possible

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `release/*` - Release preparation branches

## Deployment

The application will be containerized using Docker and deployed using Docker Compose. Each component (backend, database) will have its own container, and the frontend will be served as static files. 