# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blood Pressure Tracker is a React Native/Expo mobile application for tracking and visualizing blood pressure readings. It's built with:
- React Native 0.76.6 + Expo 52.0.33
- TypeScript
- Expo Router for file-based routing
- React Navigation (bottom tabs)
- Axios for API communication
- react-native-chart-kit for visualizations

The app uses a PostgreSQL backend via the [bptracker-backend](https://github.com/dudeinthemirror/bptracker-backend) API running on `http://127.0.0.1:8078`.

## Development Setup

### Prerequisites
- Node.js v14+
- Expo CLI
- bptracker-backend server running on port 8078

### Common Commands

```bash
# Start development server (Expo)
npm run dev

# Lint code
npm run lint

# Build for web production
npm run build:web

# Build for iOS/Android (Expo build service)
expo build:ios
expo build:android
```

## Architecture & Code Structure

### App Navigation (Expo Router)
- **Layout**: `app/_layout.tsx` - Root layout with SafeAreaProvider and StatusBar
- **Tab Navigation**: `app/(tabs)/_layout.tsx` - Bottom tab navigation configured
- **Routes**:
  - `app/(tabs)/index.tsx` - Record screen (main screen for inputting readings)
  - `app/(tabs)/history.tsx` - History view with color-coded readings
  - `app/(tabs)/graph.tsx` - Visualization with line chart (systolic, diastolic, heart rate over time with day/week/month tabs)
  - `app/(tabs)/settings.tsx` - App settings
  - `app/+not-found.tsx` - 404 fallback

### API Layer
**File**: `app/services/api.ts`

- Axios instance pointed at `http://127.0.0.1:8078`
- Exports `BloodPressureReading` interface (id, systolic, diastolic, heart_rate, timestamp, note)
- Exports `CreateReadingDto` for POST/PUT operations
- `readingsApi` object with methods:
  - `getAll()` - Fetches readings from `/readings/` endpoint (response has `data.readings` array)
  - `getById(id)` - Get single reading
  - `create(reading)` - POST new reading
  - `update(id, reading)` - PUT to update reading
  - `delete(id)` - DELETE single reading
  - `deleteAll()` - DELETE all readings

### Hooks
- **`hooks/useFrameworkReady.ts`** - Loads fonts and handles splash screen

## Important Notes

1. **Backend Dependency**: The app requires the bptracker-backend to be running before starting the dev server. Update `API_BASE_URL` in `app/services/api.ts` if backend runs on different host/port.

2. **Multi-platform**: App builds for iOS, Android, and Web (using `expo export --platform web`).

3. **TypeScript**: Project uses TypeScript 5.3.3 with strict type checking enabled. Always use proper types.

4. **API Data Format**: The backend returns readings in snake_case (e.g., `heart_rate`, `timestamp` as string). Match this in interfaces.

5. **Linting**: Use `npm run lint` to check code before committing.

## Development Patterns

- Use `const [state, setState]` for component state (no context/redux yet)
- Import navigation from `expo-router` for routing
- Use `react-native` components (View, Text, ScrollView, etc.), not Web HTML
- Use `lucide-react-native` for icons
- API calls should handle errors and log to console
