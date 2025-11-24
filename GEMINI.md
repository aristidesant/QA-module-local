# Core Commands

- `npm run dev` - Start development server with React Router v7 dev mode (port 8080)
- `npm run build` - Create production build with SSR support
- `npm run start` - Serve production build with React Router serve
- `npm run typecheck` - Generate type definitions and run TypeScript checks
- `npm run test` - Run unit and integration tests with Vitest
- `npm run coverage` - Run tests and generate coverage report

# General Code Style & Formatting

- Follow the Airbnb Style Guide for all code formatting.
- Name React component files using PascalCase (e.g., `UserCard.tsx`, not `user-card.tsx`).
- Export components as default exports (e.g., `export default UserCard`).
- Each component must be isolated in its own folder. The folder and the main component file should both use the component name. Include an `index.ts` file in the folder to export the component as the default export. This is a MUST all the time (e.g., `export { default } from './UserCard'`).
- No matter the prompt language used by the user, the code should be written in English.
- When asked to split a component, unless we explicitly provide a path, create the component in the same folder as the main component file.
- When you consider a new component is needed, create it in the same folder as the main component file.
- This project has a FLAT design, Don't use shadows, gradients, animations, or any other 3D effects unless explicitly requested.
- IMPORTANT!! No matter the language in which the request is being provided by the user, we write code in English as well as comments when needed. DO NOT WRITE CODE OR COMMENTS IN SPANISH

# Project Structure & Architecture

- **Frontend Framework**: React Router v7 with SSR enabled by default
- **Build Tool**: Vite with React Router dev plugin and TypeScript paths
- **Major Dependencies**:
  - Mantine v8 for UI components and theming
  - Tanstack Query for data fetching and caching
  - Zustand for state management
  - Axios for HTTP requests
  - ElevenLabs SDK for voice integration
  - JWT for authentication

- **External Services**:
  - Backend API (configured via `API_URL` env var)
  - ElevenLabs API for voice synthesis and conversational AI
  - Session management with secure cookies

- The project uses React Router v7.
  We MUST use them over anything else of custom components. If a core component does not exist, they need to be created in a file inside that folder.

- This project is using Tanstack Query for data fetching and caching.
- Current structure follows `app/` directory (actual structure) vs documented `src/` structure:
  ```
  app/
  ├── api/          # HTTP client functions for backend services
  ├── components/   # Reusable UI components
  ├── modules/      # Feature-specific modules (agent, campaigns, etc.)
  ├── queries/      # Tanstack Query hooks
  ├── routes/       # React Router v7 route components
  ├── store/        # Zustand stores
  ├── models/       # TypeScript types and interfaces
  ├── hooks/        # Custom React hooks
  ├── utils/        # Utility functions
  └── styles/       # Global CSS styles
  ```

# Styling & UI

- Use Mantine UI, V8. Search on internet whenever is required to get the latest implementation without breaking changes. component.
- Every style should be place within a .module.css with the name of the component.
- Prefer light mode for anything.
- When asked in anyways to improve a component, always go with flat design, no shadows and no animnations that moves the component. Color highlights are preferred for animations.
- Css Style MUST be preferred vs inline styling or component props.
- Use `@tabler/icons-react` for all icons.
- Use var(--mantine-xxx) to apply all the mantine properties in CSS files instead of defining your own styles/colors, etc..
- Use the shared `BaseTable` component for list and table UIs by default. When creating new list or table views, prefer `src/components/BaseTable/BaseTable` (a generic TanStack Table wrapper using Mantine styling). Only deviate from `BaseTable` when there is a clear, documented reason (for example: very custom markup or performance-critical virtualization). Ensure new list components accept the same column/data shapes and use the generic `ColumnDef<T>` typing from `@tanstack/react-table`.
- Make sure the columns are in a separated files and we create a hook for that particular columns of that list.

# Data Fetching & Forms

- Use Mantine Form for form handling.

# State Management & Logic

- Use Zustand for state management.
- Use Tanstack React Query for data fetching and caching.
- Use Action/Loader and Fetcher for data fetching in some cases.

# TypeScript & Imports

- Use strict TypeScript configuration with `verbatimModuleSyntax` enabled
- Path mapping configured: use `~/` for `./app/` imports
- All TypeScript types should be properly defined in `models/` directory
- Use proper type exports/imports and avoid `any` types

# Environment & Configuration

- Required environment variables:
  - `API_URL` - Backend API endpoint
  - `SESSION_SECRET_KEY` - Session management secret
- Development server runs on port 8080
- SSR enabled by default in React Router config
- Authentication uses JWT tokens with secure session cookies

# Error Handling & API Integration

- Use Axios for HTTP requests with consistent error handling
- API functions should be organized by feature in `api/` directory
- Follow established patterns for API client initialization
- Handle authentication state consistently across the application

# Testing

- Use Vitest as the test runner.
- Use React Testing Library for component testing.
- Test files must be co-located with the component they test, named `[Component].test.tsx`.
- Use `vi` from `vitest` for mocking.
- Ensure to mock external dependencies like `react-router-dom` hooks or API calls if necessary.
- Use `screen` from `@testing-library/react` for querying elements.
- Use `userEvent` from `@testing-library/user-event` for interactions.
