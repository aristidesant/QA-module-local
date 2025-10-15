# Client Configs Module

A complete CRUD module for managing client configurations.

## Files Created

### Page Component

- `/src/modules/client-configs/ClientConfigsPage/ClientConfigsPage.tsx`
- `/src/modules/client-configs/ClientConfigsPage/ClientConfigsPage.module.css`
- `/src/modules/client-configs/ClientConfigsPage/index.ts`

### Content Component (Table View)

- `/src/modules/client-configs/ClientConfigsContent/ClientConfigsContent.tsx`
- `/src/modules/client-configs/ClientConfigsContent/ClientConfigsContent.module.css`
- `/src/modules/client-configs/ClientConfigsContent/index.ts`

### Form Component (Create/Edit)

- `/src/modules/client-configs/ClientConfigsForm/ClientConfigsForm.tsx`
- `/src/modules/client-configs/ClientConfigsForm/ClientConfigsForm.module.css`
- `/src/modules/client-configs/ClientConfigsForm/index.ts`

## Integration

### Route Added

- Path: `/client-configs`
- Component: `ClientConfigsPage`
- Added to `/src/routes.tsx`

### Sidebar Menu Item

- Label: "Client Configs"
- Icon: IconSettings
- Section: Maintenance
- Added to `/src/components/Sidebar/menuItems.tsx`

## Features

### Table View

- Display all client configurations
- Columns: Name, Description, Type, Value, Last Updated, Actions
- Edit and Delete actions per row
- Empty state when no configurations exist
- Loading states

### Create/Edit Form

- Fields:
  - Name (required, immutable in edit mode, lowercase/numbers/underscores only)
  - Description (required)
  - Type (required, select from: string, number, boolean, json, array)
  - Value (required, textarea for longer values)
- Validation on all fields
- Success/Error notifications
- Loading states during submission

### CRUD Operations

- ✅ List all configurations (`GET /client-configs`)
- ✅ Create configuration (`POST /client-configs`)
- ✅ Update configuration (`PATCH /client-configs/{name}`)
- ✅ Delete configuration (`DELETE /client-configs/{name}`)

## Usage

Navigate to `/client-configs` in the application or click "Client Configs" in the sidebar under the Maintenance section.

## Tech Stack

- React with TypeScript
- Mantine v8 UI components
- TanStack Query for data fetching
- TanStack Table for table rendering
- Mantine Forms for form handling
- CSS Modules for styling
