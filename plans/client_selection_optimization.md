# Client Selection Optimization Plan

This document outlines the optimizations implemented in the `ClientSelectionModal` to handle both small (2) and large (500+) client lists efficiently while maintaining a modern, compact SaaS design.

## 1. Search and Filtering

- **Conditional Search**: A search bar is automatically displayed when the user has access to more than 5 organizations. This keeps the UI clean for simple cases while providing necessary tools for power users.
- **Real-time Filtering**: The list filters organizations by `clientName` as the user types.
- **Autofocus**: The search input is automatically focused when the modal opens, allowing for immediate interaction.
- **Simplified View**: Removed technical identifiers to focus purely on the organization name and user roles, providing a cleaner interface.
- **Empty State**: If no organizations match the search query, a clear `EmptyState` component is shown with instructions to adjust the search.

## 2. Performance and Scalability

- **Stable Height**: The modal now maintains a consistent height of `450px` for the content area when many clients are present. This prevents the modal from "jumping" or resizing dynamically during search or step transitions, providing a much smoother UX.
- **Scrollable Area**: The client list is wrapped in a `ScrollArea` with a fixed height for stability.
- **Grid Layout**: For larger screens, organizations are displayed in a 2-column grid (`SimpleGrid`), making better use of the wider modal space.
- **Memoized Filtering**: The filtering logic is wrapped in `useMemo` to prevent unnecessary recalculations during re-renders.

## 3. Compact & Modern Design (Mantine v8)

Following the project's design guidelines in `AGENTS.md`, the following adjustments were made:

- **Sizing**: Switched to `size="lg"` for the Modal to provide a wider, more modern feel. All Text and Input components strictly use `size="sm"`. Buttons and PinInput use `size="sm"` or `size="md"` appropriately for focus.
- **Spacing**: Reduced gaps between elements to `xs` (`gap="xs"`) and updated padding to `md` for the modal and `sm` for cards.
- **Radii**: Standardized on `radius="sm"` for the Modal, Cards, and Alerts.
- **Icons**:
  - Used an `iconWrapper` with a subtle background for organization icons.
  - Icons change color on hover/selection for better visual feedback without shifting elements.
- **Typography**: Focused on a clean hierarchy with `fw={500}` for organization names and subtle, non-intrusive role labels using dot-variant badges.
- **Selection Accent**: Selected cards now feature a subtle blue background and border, removing the heavy left-border accent for a cleaner SaaS look.
- **OTP Entry**: Implemented `PinInput` for a specialized, centered verification code entry experience.
- **Flat Design Adherence**:
  - **NO shadows**: Removed all external shadows from cards and hover states.
  - **NO 3D effects**: Removed `transform` and `translateY` from hover states to keep the UI stable and flat.
  - **Scale Feedback**: Added a subtle scale-down effect (`0.98`) only on active click to provide tactile feedback.
  - **Stable Hover**: Hover states only change background and border colors, ensuring no element movement.

## 4. Code Quality & Guidelines

- **TypeScript**: Removed all `any` types from catch blocks, using standard error handling with `getErrorMessage`.
- **Hooks Discipline**: All hooks are called unconditionally at the top of the component.
- **Language**: All code and comments are in English.

## 4. User Experience (UX)

- **Visual Feedback**: Selected clients show a check icon and a subtle blue background.
- **Loading States**: Clear loading indicators are shown during organization selection and MFA verification.
- **MFA Integration**: A seamless transition between organization selection and two-factor authentication steps.

## 5. Implementation Details

- **File**: `src/modules/auth/LoginForm/ClientSelectionModal/ClientSelectionModal.tsx`
- **Components Used**: `Modal`, `ScrollArea`, `TextInput`, `Card`, `EmptyState`, `Badge`, `Stack`, `Group`.
- **Icons**: `IconSearch`, `IconBuilding`, `IconShieldCheck`, `IconCheck`, `IconAlertCircle`.
