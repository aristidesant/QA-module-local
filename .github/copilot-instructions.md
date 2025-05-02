# General Code Style & Formatting
- Follow the Airbnb Style Guide for all code formatting.
- Name React component files using PascalCase (e.g., `UserCard.tsx`, not `user-card.tsx`).
- Use named exports for all components.
- Each component must be isolated in its own folder. The folder and the main component file should both use the component name. Include an `index.ts` file in the folder to export the component as the default export.

# Project Structure & Architecture
- The project uses React Router v7.
- The core compoents (input, textarea, select, etc..) they are located in the /components/ui. 
We MUST use them over anything else of custom compoennts. If a core component does not exist, they need to be created in a file inside that folder. 

# Styling & UI
- Use Mantine UI component.
- Every style should be place within a .module.css with the name of the component.
- Prefer light mode for anything.
- Css Style MUST be preferred vs inline styling or component props.
- Use `@tabler/icons-react` for all icons.

# Data Fetching & Forms
- Use React Hook Form for form handling.

# State Management & Logic
- Use Zustand for state management.
