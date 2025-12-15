# Roles & Permissions Rules

This document outlines the current permission logic implemented in the application using the `usePermissions` hook. It serves as a reference for QA to create test cases and regression suites.

## 1. Architecture Summary

The application uses a **Module + Permission** based system.

- **Modules (`ModuleEnum`)**: Represents functional areas (e.g., `CAMPAIGNS`, `CONVERSATIONS`, `SETTINGS`).
- **Permissions (`PermissionEnum`)**: Represents actions (`CREATE`, `READ`, `UPDATE`, `DELETE`, `EXPORT`, `MANAGE`).

### Core Rules

1.  **MANAGE Override**: If a user has the `MANAGE` permission for a module, they automatically have access to **ALL** actions within that module.
2.  **Module Access (`canAccessModule`)**: Checks if the user has _any_ permission assigned for that module. Used primarily for visibility (e.g., Sidebar links).
3.  **Action Access (`canPerformAction`)**: Checks if the user has a specific permission (e.g., `UPDATE`) OR the `MANAGE` permission.

---

## 2. Navigation (Sidebar)

The sidebar menu items are filtered based on module access.

| Menu Item         | Module Required | Rule                             |
| :---------------- | :-------------- | :------------------------------- |
| **Overview**      | `DASHBOARD`     | `canAccessModule(DASHBOARD)`     |
| **Campaigns**     | `CAMPAIGNS`     | `canAccessModule(CAMPAIGNS)`     |
| **Conversations** | `CONVERSATIONS` | `canAccessModule(CONVERSATIONS)` |

---

## 3. Campaigns Module (`CAMPAIGNS`)

### Campaigns List (`/campaigns`)

| Feature                       | Permission Required | Behavior if Missing            |
| :---------------------------- | :------------------ | :----------------------------- |
| **View Page**                 | `CAMPAIGNS` (Any)   | Access Denied component shown. |
| **"Create New" Button**       | `CREATE`            | Button is hidden.              |
| **Row Action: View (Eye)**    | `CAMPAIGNS` (Any)   | Icon is hidden.                |
| **Row Action: Edit (Pencil)** | `UPDATE`            | Icon is hidden.                |
| **Row Action: Test Call**     | `CAMPAIGNS` (Any)   | Icon is hidden.                |
| **Row Action: Clone**         | `CREATE`            | Icon is hidden.                |
| **Row Action: Delete**        | `DELETE`            | Icon is hidden.                |

### Campaign Edit Page (`/campaign/:id`)

- **Access Rule**: Requires `UPDATE` permission.
- **Behavior**: If a user without `UPDATE` tries to access this URL, they see an **Access Denied** screen with a "Go Back" button.

### Campaign View Page (`/campaign/view/:id`)

- **Access Rule**: Requires `CAMPAIGNS` (Any) access.
- **"Edit Campaign" Button**: Only visible if the user has `UPDATE` permission.

---

## 4. Conversations Module (`CONVERSATIONS`)

### Conversations List (`/conversations`)

| Feature             | Permission Required   | Behavior if Missing            |
| :------------------ | :-------------------- | :----------------------------- |
| **View Page**       | `CONVERSATIONS` (Any) | Access Denied component shown. |
| **"Export" Button** | `EXPORT`              | Button is hidden.              |

### Conversation Overview

| Feature                       | Permission Required | Behavior if Missing |
| :---------------------------- | :------------------ | :------------------ |
| **Download Transcript (PDF)** | `EXPORT`            | Button is hidden.   |

---

## 5. Configurations (`SETTINGS`)

The `/configurations` page has multiple tabs with specific access rules.

| Tab                         | Access Rule            | Notes                                                      |
| :-------------------------- | :--------------------- | :--------------------------------------------------------- |
| **Global (Client Configs)** | **Master Client Only** | Checked via `useIsMasterClient`. Hidden for regular users. |
| **Campaign Params**         | `SETTINGS` (Any)       | Visible by default if user has module access.              |
| **Regional Settings**       | `SETTINGS` (Any)       | Visible by default if user has module access.              |
| **Scheduler**               | `MANAGE`               | Hidden if user does not have `MANAGE` on `SETTINGS`.       |
| **Do Not Call**             | `SETTINGS` (Any)       | Visible by default if user has module access.              |
| **Knowledge Base**          | `SETTINGS` (Any)       | Visible by default if user has module access.              |

**Redirect Logic**: If a user tries to access a restricted tab via URL (e.g., `/configurations/scheduler-predefined-params`) without permission, they are automatically redirected to an allowed tab (usually `client-configs` or `campaign-predefined-params`).

---

## 6. QA Test Scenarios

### Scenario A: Read-Only User

- **Setup**: User with `READ` permission on `CAMPAIGNS` and `CONVERSATIONS`.
- **Verify**:
  - [ ] Can view Campaign List.
  - [ ] **Cannot** see Create, Edit, Clone, or Delete buttons in Campaign List.
  - [ ] Clicking a campaign row opens the **View** page, not Edit.
  - [ ] Direct access to `/campaign/123` shows "Access Denied".
  - [ ] Can view Conversation List.
  - [ ] **Cannot** see Export buttons in Conversations.

### Scenario B: Editor User

- **Setup**: User with `READ` and `UPDATE` on `CAMPAIGNS`.
- **Verify**:
  - [ ] Can see Edit (Pencil) icon in Campaign List.
  - [ ] Can access `/campaign/123`.
  - [ ] **Cannot** see Create or Delete buttons.

### Scenario C: Manager / Admin

- **Setup**: User with `MANAGE` on all modules.
- **Verify**:
  - [ ] Has full access to all buttons and actions.
  - [ ] Can see the **Scheduler** tab in Configurations.

### Scenario D: Restricted Access (No Conversations)

- **Setup**: User with access ONLY to `CAMPAIGNS`.
- **Verify**:
  - [ ] "Conversations" link is missing from Sidebar.
  - [ ] Direct access to `/conversations` shows "Access Denied".

### Scenario E: Master Client Check

- **Setup**: Log in as a Master Client user vs. Regular Client user.
- **Verify**:
  - [ ] Master Client sees "Global" tab in Configurations.
  - [ ] Regular Client does **not** see "Global" tab.
