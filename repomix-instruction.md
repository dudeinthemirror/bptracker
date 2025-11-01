# Blood Pressure Tracker - AI Assistant Instructions

## Project Overview
This is a React Native mobile application built with Expo for tracking and visualizing blood pressure readings. The app connects to a separate backend API (bptracker-backend) that stores data in PostgreSQL.

## Key Architecture Points
- **Frontend**: React Native + Expo with tab-based navigation
- **Backend**: Separate Node.js API server (bptracker-backend repository)
- **Database**: PostgreSQL (managed by backend)
- **API Communication**: Axios for HTTP requests to backend at `http://127.0.0.1:8078`

## Important Dependencies
- React Native & Expo ecosystem
- React Navigation for tab navigation
- react-native-chart-kit for data visualization
- Lucide Icons for UI icons
- Expo Linear Gradient for styling

## Development Workflow
1. Backend server must be running before starting the app
2. Use `npm run dev` to start development server
3. Test on device via Expo Go app or simulators

## Code Conventions
- TypeScript throughout the project
- Functional components with hooks
- Tab-based navigation structure in `app/(tabs)/`
- API service layer in `app/services/api.ts`
- Custom hooks in `hooks/` directory

## Key Features to Understand
- Blood pressure recording with systolic/diastolic/heart rate
- Historical data viewing with color-coded status indicators
- Trend visualization with line charts
- Data persistence via backend API
- Cross-platform support (iOS, Android, Web)

## When Making Changes
- Maintain existing TypeScript patterns
- Follow React Native/Expo best practices
- Ensure backend API compatibility
- Test on multiple platforms when possible
- Keep UI consistent with existing design patterns