# SectionCard

`SectionCard` is a shared layout wrapper for form and content sections.

It provides:

- a consistent card container
- optional icon, title, and description
- a content area with configurable spacing
- optional footer content
- semantic header actions through the shared card action taxonomy

## Import

```tsx
import SectionCard from '~/components/SectionCard';
```

## Basic usage

```tsx
<SectionCard title={t('general.title')} description={t('general.description')}>
	<TextInput label={t('general.name')} />
	<Textarea label={t('general.descriptionLabel')} />
</SectionCard>
```

## Props overview

### Structure

- `icon`: optional Tabler icon shown next to the title
- `title`: section heading
- `description`: helper text under the title
- `children`: main section content
- `footer`: optional footer area rendered below content
- `id`: optional DOM id
- `className`: optional extra class names

### Layout

- `padding`: Mantine card padding, defaults to `lg`
- `contentSpacing`: gap between children, defaults to `md`
- `backgroundColor`: optional card background color

### Header actions

`SectionCard` supports three header action patterns:

1. Semantic actions via shortcut props
2. Semantic actions via the `actions` object
3. Escape hatches via `headerExtras` or legacy `headerActions`

## Recommended: semantic action shortcuts

Use these when the section has a single semantic action:

- `onAdd`
- `onEdit`
- `onChange`
- `onView`
- `onConfigure`
- `onOpenSettings`
- `onExpand`
- `onCalculate`
- `onRefresh`

Example:

```tsx
<SectionCard
	title={t('workingHours.title')}
	description={t('workingHours.description')}
	onCalculate={() => {
		modals.open({
			title: t('form.schedulerCalculator.title'),
			fullScreen: true,
			children: <SchedulerCalculator />,
		});
	}}
>
	<ParametersSection />
</SectionCard>
```

These actions are rendered automatically in the header as `ActionIcon` controls with tooltips.

## Advanced: `actions` object

Use `actions` when you need explicit control over primary and secondary actions.

```tsx
<SectionCard
	title={t('form.workflow.section.title')}
	actions={{
		primary: {
			kind: 'edit',
			label: t('common:actions.edit'),
			onClick: handleEdit,
		},
		secondary: [
			{
				kind: 'openSettings',
				onClick: handleOpenSettings,
			},
		],
	}}
>
	<WorkflowCanvas />
</SectionCard>
```

Supported action kinds:

- `add`
- `edit`
- `change`
- `view`
- `configure`
- `openSettings`
- `expand`
- `calculate`
- `refresh`

Each action can define:

- `kind`
- `onClick`
- `label`
- `ariaLabel`
- `icon`
- `variant`
- `color`
- `disabled`
- `loading`

## `headerExtras`

Use `headerExtras` for non-action content in the header, such as:

- badges
- selects
- toggles
- checkboxes
- counters

Example:

```tsx
<SectionCard
	title={t('form.reportValues.title')}
	onAdd={handleAddColumn}
	headerExtras={
		<Badge variant='light' size='sm'>
			{columnCountLabel}
		</Badge>
	}
>
	<BaseTable data={rows} columns={columns} />
</SectionCard>
```

## Legacy: `headerActions`

`headerActions` is still supported as a fallback for custom header content, but new usage should prefer:

- semantic action props
- `actions`
- `headerExtras`

Use `headerActions` only when the built-in taxonomy is not enough.

## How spacing works

`contentSpacing` controls the gap between elements inside the content container.

Preset values:

- `xs` -> `0.5rem`
- `sm` -> `0.75rem`
- `md` -> `1rem`
- `lg` -> `1.5rem`
- `xl` -> `2rem`

You can also pass a number, which is converted to pixels.

```tsx
<SectionCard contentSpacing='sm'>...</SectionCard>
<SectionCard contentSpacing={12}>...</SectionCard>
```

## Footer example

```tsx
<SectionCard
	title={t('form.reportValues.title')}
	footer={
		<Group justify='flex-end'>
			<Button variant='default'>{t('common:actions.cancel')}</Button>
			<Button>{t('common:actions.save')}</Button>
		</Group>
	}
>
	<BaseTable data={rows} columns={columns} />
</SectionCard>
```

## Recommended usage rules

- Prefer `SectionCard` for form and section-level content blocks.
- Prefer semantic action props for simple cases.
- Use `actions` when you need multiple actions or custom labels.
- Use `headerExtras` for controls and metadata, not clickable semantic actions.
- Keep user-facing text translated.
- Avoid new usages of `headerActions` unless you truly need a custom header layout.
