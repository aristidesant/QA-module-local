import { ActionIcon, Tooltip } from '@mantine/core';
import {
	IconCalculator,
	IconEye,
	IconPlus,
	IconRefresh,
	IconSettings,
	IconArrowsMaximize,
	IconAdjustments,
	IconPencil,
	IconTool,
} from '@tabler/icons-react';
import type {
	CardActionDefinition,
	CardActionKind,
	CardActionProps,
	CardActionsConfig,
} from './CardHeaderActions.types';

const PRIMARY_ACTION_ORDER: CardActionKind[] = [
	'add',
	'edit',
	'change',
	'view',
	'configure',
	'calculate',
	'expand',
	'refresh',
	'openSettings',
];

const SECONDARY_ACTION_ORDER: CardActionKind[] = [
	'openSettings',
	'refresh',
	'view',
	'expand',
	'configure',
	'change',
	'edit',
	'calculate',
	'add',
];

export const ACTION_ICON_MAP = {
	add: IconPlus,
	edit: IconPencil,
	change: IconAdjustments,
	view: IconEye,
	configure: IconTool,
	openSettings: IconSettings,
	expand: IconArrowsMaximize,
	calculate: IconCalculator,
	refresh: IconRefresh,
} satisfies Record<CardActionKind, typeof IconPlus>;

export const getDefaultActionLabel = (
	kind: CardActionKind,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const keyMap: Record<CardActionKind, string> = {
		add: 'actions.add',
		edit: 'actions.edit',
		change: 'actions.change',
		view: 'actions.view',
		configure: 'actions.configure',
		openSettings: 'actions.settings',
		expand: 'actions.expand',
		calculate: 'actions.calculate',
		refresh: 'actions.refresh',
	};

	return t(keyMap[kind], { ns: 'common' });
};

export const getDefaultActionVariant = (
	action: CardActionDefinition,
	placement: 'primary' | 'secondary'
) => {
	if (action.variant) {
		return action.variant;
	}

	if (placement === 'primary') {
		return 'light';
	}

	if (action.kind === 'openSettings' || action.kind === 'refresh') {
		return 'subtle';
	}

	return 'light';
};

export const resolveCardActions = (
	props: CardActionProps
): CardActionsConfig | undefined => {
	if (props.actions) {
		return props.actions;
	}

	const semanticActions: Partial<Record<CardActionKind, () => void>> = {
		add: props.onAdd,
		edit: props.onEdit,
		change: props.onChange,
		view: props.onView,
		configure: props.onConfigure,
		openSettings: props.onOpenSettings,
		expand: props.onExpand,
		calculate: props.onCalculate,
		refresh: props.onRefresh,
	};

	const availableKinds = Object.entries(semanticActions)
		.filter((entry): entry is [CardActionKind, () => void] => Boolean(entry[1]))
		.map(([kind]) => kind as CardActionKind);

	if (availableKinds.length === 0) {
		return undefined;
	}

	const primaryKind = PRIMARY_ACTION_ORDER.find((kind) =>
		availableKinds.includes(kind)
	);

	if (!primaryKind) {
		return undefined;
	}

	const secondaryKinds = SECONDARY_ACTION_ORDER.filter(
		(kind) => kind !== primaryKind && availableKinds.includes(kind)
	);

	return {
		primary: {
			kind: primaryKind,
			onClick: semanticActions[primaryKind] as () => void,
		},
		secondary: secondaryKinds.map((kind) => ({
			kind,
			onClick: semanticActions[kind] as () => void,
		})),
	};
};

export const renderCardActionButton = (
	action: CardActionDefinition,
	placement: 'primary' | 'secondary',
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const Icon = action.icon || ACTION_ICON_MAP[action.kind];
	const label = action.label || getDefaultActionLabel(action.kind, t);

	return (
		<Tooltip
			key={`${placement}-${action.kind}-${label}`}
			label={label}
			withArrow
		>
			<ActionIcon
				size='sm'
				variant={getDefaultActionVariant(action, placement)}
				onClick={action.onClick}
				aria-label={action.ariaLabel || label}
				disabled={action.disabled}
				loading={action.loading}
				color={action.color}
			>
				{Icon ? <Icon size={16} /> : null}
			</ActionIcon>
		</Tooltip>
	);
};
