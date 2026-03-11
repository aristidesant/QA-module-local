import type { ReactNode } from 'react';
import type { ActionIconProps } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

export type CardActionKind =
	| 'add'
	| 'delete'
	| 'edit'
	| 'change'
	| 'view'
	| 'configure'
	| 'openSettings'
	| 'expand'
	| 'calculate'
	| 'refresh';

export interface CardActionDefinition {
	kind: CardActionKind;
	onClick: () => void;
	label?: string;
	ariaLabel?: string;
	icon?: TablerIcon;
	variant?: ActionIconProps['variant'];
	color?: ActionIconProps['color'];
	disabled?: boolean;
	loading?: boolean;
}

export interface CardActionsConfig {
	primary?: CardActionDefinition;
	secondary?: CardActionDefinition[];
}

export interface CardActionProps {
	actions?: CardActionsConfig;
	headerExtras?: ReactNode;
	headerActions?: ReactNode;
	onAdd?: () => void;
	onDelete?: () => void;
	onEdit?: () => void;
	onChange?: () => void;
	onView?: () => void;
	onConfigure?: () => void;
	onOpenSettings?: () => void;
	onExpand?: () => void;
	onCalculate?: () => void;
	onRefresh?: () => void;
}
