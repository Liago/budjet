# Finance Tracker Web App

This is the web frontend for the Finance Tracker application, built with React, TypeScript, Redux Toolkit, and Tailwind CSS.

## Features

- User authentication (login/register)
- Dashboard with financial overview and charts
- Transaction management (add, edit, delete, filter, sort)
- Category management (add, edit, delete, filter)
- Responsive design for desktop and mobile

## Tech Stack

- **Framework:** React with TypeScript
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Charts:** Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API running (default: http://localhost:3000)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173.

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── store/          # Redux store and slices
│   └── slices/     # Redux slices for different features
├── utils/          # Utility functions
├── App.tsx         # Main application component with routing
└── main.tsx        # Entry point
```

## API Configuration

The application is configured to connect to the backend API at http://localhost:3000. You can change this in the `src/utils/api.ts` file and in the `vite.config.ts` file for the development proxy.

## Authentication

The application uses JWT for authentication. The token is stored in localStorage and included in API requests via an Axios interceptor.

## Development

### Adding New Features

1. Create new Redux slices in the `src/store/slices` directory
2. Add new components in the `src/components` directory
3. Create new pages in the `src/pages` directory
4. Update the routing in `App.tsx`

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Use Redux Toolkit for state management
- Style components with Tailwind CSS 