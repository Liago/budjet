# Finance Tracker Mobile App

React Native mobile application for the Finance Tracker using Expo.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Configure the API endpoint

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `src/`
  - `assets/` - Static assets (images, fonts)
  - `components/` - Reusable UI components
    - `common/` - Shared components (buttons, inputs, etc.)
    - `dashboard/` - Dashboard-specific components
    - `transactions/` - Transaction-related components
    - `categories/` - Category-related components
  - `screens/` - Screen components
    - `auth/` - Authentication screens (login, register)
    - `dashboard/` - Main dashboard screen
    - `transactions/` - Transaction management screens
    - `categories/` - Category management screens
    - `settings/` - User settings screen
  - `navigation/` - Navigation configuration
  - `store/` - Redux store configuration and slices
  - `services/` - API service functions
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions
  - `App.tsx` - Main application component 