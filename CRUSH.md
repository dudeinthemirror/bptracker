# CRUSH.md
# Configuration for Agentic Coding Assistants

## Build/Lint/Test Commands
- Start app: `npm run dev`
- Build web: `npm run build:web`
- Lint: `npm run lint`
- Note: No test scripts found in package.json, no test files discovered in the codebase

## Code Style Guidelines
- TypeScript: All files use .ts or .tsx extensions
- Formatting: 2-space indentation, single quotes, bracket spacing (from .prettierrc)
- Imports: Use @/* path aliases for absolute imports (from tsconfig.json)
- Naming: Use PascalCase for components, camelCase for functions/variables
- Types: Prefer explicit type annotations, especially for function parameters and return values
- Components: Organize code in app/ directory using Expo Router's file-based routing
- Error handling: Not explicitly defined in codebase, use try/catch for async operations and proper error boundaries
- File structure: Use (group) directories for route grouping without affecting URL structure
- React patterns: Use modern React patterns with hooks, function components
- Expo: Follow Expo best practices, use Expo SDK components when available

## Project Structure
- Main components in app/ directory
- Assets in assets/ directory
- Environment-specific configuration in app.json
- Type configuration in tsconfig.json

## Notes
- No dedicated test framework currently implemented
- No Cursor or Copilot rules found in the repository