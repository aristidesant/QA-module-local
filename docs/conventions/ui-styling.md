# UI & Styling Standards

Design quality is mandatory: clean, modern, production-ready, light mode first.

## General

- Use Mantine components by default.
- Use CSS Modules (`*.module.css`) for component styles.
- Do not create inline styles in application code. Use CSS Modules, Mantine props, or shared classes instead.
- Allow inline styles only as rare exceptions when there is no practical alternative — document with an `inline-style-allow:` comment immediately above, kept as narrow as possible.
- Avoid flat, boring forms: group related fields into clear visual sections (e.g. Basic Info, Configuration, Advanced).

## Color Scheme (mandatory)

Every new or updated component must work in light, dark, and auto mode.

- Use theme tokens and semantic colors — do not hardcode colors.
- Check hover, focus, borders, surfaces, shadows, and overlays in both modes.
- Dark mode gaps may be fixed incrementally in legacy areas; no new component may depend on light-only styling.

## Layout

- Prefer `size="sm"` for controls and text.
- Prefer `gap="xs"` in `Stack`/`Group`.
- Use Mantine CSS variables for consistent spacing.
- Keep hover states stable (no layout shift).
- Provide clear loading and error states.

## Elevation

- Avoid heavy shadows, gradients, and 3D effects.
- Use Mantine shadow tokens — not custom `box-shadow` values.
- Default elevation for cards, forms, section containers: `shadow="md"` / `var(--mantine-shadow-md)`.
- Custom shadow only with a documented, component-specific exception.

## Shared UI Primitives

- `SectionCard` (`src/components/SectionCard`) — form/page sections.
- `AppDrawer` (`src/components/AppDrawer`) — drawers. Do not use Mantine `Drawer` directly.
- `BaseTable` (`src/components/BaseTable/BaseTable`) — data tables.
