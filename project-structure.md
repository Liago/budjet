# Finance Tracker Project Structure

## Directory Structure

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

## Backend Structure Details

### NestJS Modules

- **Auth Module**: Handles user authentication and authorization
  - Controllers: AuthController
  - Services: AuthService
  - Guards: JwtAuthGuard, RolesGuard
  - Strategies: JwtStrategy, LocalStrategy

- **Users Module**: Manages user accounts
  - Controllers: UsersController
  - Services: UsersService
  - Entities: User

- **Transactions Module**: Manages financial transactions
  - Controllers: TransactionsController
  - Services: TransactionsService
  - Entities: Transaction

- **Categories Module**: Manages transaction categories
  - Controllers: CategoriesController
  - Services: CategoriesService
  - Entities: Category

### Database Schema

The database schema is managed using Prisma ORM with the following models:
- User
- Transaction
- Category
- Tag

## Frontend Structure Details

### Web Frontend

- **Components**: Reusable UI components organized by feature
- **Pages**: Page components that use the reusable components
- **Store**: Redux store with slices for different features
- **Services**: API service functions for communicating with the backend
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Utility functions and helpers

### Mobile Frontend

- **Components**: Reusable UI components
- **Screens**: Screen components that use the reusable components
- **Navigation**: React Navigation configuration
- **Store**: Redux store with slices for different features
- **Services**: API service functions for communicating with the backend
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Utility functions and helpers

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