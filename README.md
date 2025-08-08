# Newtech AI Frontend

This project is the frontend for the Newtech AI platform, a system focused on building and managing AI-powered customer service agents.

## Overview

The application serves as the user interface for creating, configuring, and deploying virtual agents. It offers a seamless development and management experience for client-side users by integrating a modern React-based stack with modular design components.

## Features

- Create and configure AI agents.
- Manage existing agents via an intuitive UI.
- Preview agent responses and interaction behavior.

## Tech Stack

- **Framework**: [React Router v7](https://reactrouter.com/) — Used for routing; configured for SPA mode (ssr: false).
- **UI Components**: [Mantine v8](https://mantine.dev/) — A modern React UI component library used for layout, forms, modals, notifications, and theming.
- **HTTP Client**: [Axios](https://axios-http.com/) — Used for making REST API requests throughout the application.
- **Date Management**: [Day.js](https://day.js.org/) — Lightweight library for parsing, validating, and formatting dates, used mainly in API request handling.
- **TypeScript**: Ensures type safety across the codebase.
- **Vite**: For fast development builds and hot module replacement.
- **React Router Devtools**: Included for debugging and inspecting routes during development.

## Scripts

- `npm run dev` – Start development server using React Router Dev mode.
- `npm run build` – Create a production-ready build.
- `npm run start` – Serve the production client build with SPA fallback.
- `npm run typecheck` – Generate type definitions and run TypeScript checks.

## Environment Variables

The application requires the following environment variables to run:

- `API_URL`: URL of the backend server used for API communication.
- `SESSION_SECRET_KEY`: Secret key used for managing session cookies via React Router.

## Authentication

The frontend uses JWT (JSON Web Tokens) for authenticating users and securing routes.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/NewtechGlobalAI/nai-agent-service-front.git
   cd nai-agent-service-front
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This app runs as a Single Page Application (SPA). You can host the `build/client` directory on any static file host. Ensure deep-links route to the SPA entry:

For hosts that support Netlify-style redirects, add a `_redirects` file with:

```
/*    /index.html   200
```

If you pre-render `/`, React Router may emit `__spa-fallback.html`; point your host to that instead.

DigitalOcean App Platform: serve `build/client` and enable SPA fallback to `index.html`.

## License

This project is proprietary and maintained by Newtech AI. All rights reserved.

Main admin/deployment user: `rmena28`
