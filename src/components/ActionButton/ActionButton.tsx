import { forwardRef } from 'react';
import { ActionIcon, type ActionIconProps } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

export type ActionButtonProps = Omit<ActionIconProps, 'children'> & {
	icon: TablerIcon;
	label: string;
	iconSize?: number;
};

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
	(
		{
			icon: Icon,
			label,
			iconSize = 16,
			variant = 'light',
			radius = 'md',
			color = 'blue',
			...actionIconProps
		},
		ref
	) => (
		<ActionIcon
			ref={ref}
			aria-label={label}
			variant={variant}
			radius={radius}
			color={color}
			{...actionIconProps}
		>
			<Icon size={iconSize} />
		</ActionIcon>
	)
);

ActionButton.displayName = 'ActionButton';

export default ActionButton;
