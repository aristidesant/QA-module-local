# Permissions & Hooks Discipline

## Permission Architecture

- Determine active client from impersonation target or current user client.
- Build permissions only from roles that belong to the active client.
- Merge permissions per module.
- Treat `MANAGE` as elevated permission for that module.
- Module mapping:
  - `ModuleEnum.SETTINGS`: setup/configuration/taxonomy areas
  - `ModuleEnum.CAMPAIGNS`: campaign operations and campaign screens

## Permission Usage

Always use `usePermissions` helpers — do not bypass them:

- `canAccessModule(module)`
- `canPerformAction(module, permission)`
- `hasAnyPermission(module, permissions)`
- `hasAllPermissions(module, permissions)`

## Hooks Discipline

- Call hooks unconditionally at the top of the component.
- Do not place hooks inside branches, loops, or after early returns.
