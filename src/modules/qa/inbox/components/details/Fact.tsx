import React from 'react';
import { Group, Text, ThemeIcon } from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';

/** Small label/value pair used by most detail bodies. */
export const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({
	label,
	children,
}) => (
	<div>
		<Text size='xs' c='dimmed'>
			{label}
		</Text>
		<Text fw={600} size='sm'>
			{children}
		</Text>
	</div>
);

/** Signed change with an arrow: green up, red down, gray flat. */
export const DeltaText: React.FC<{
	value: number | null;
	suffix?: string;
	size?: 'sm' | 'lg';
}> = ({ value, suffix = '', size = 'sm' }) => {
	if (value === null) return <Text size={size}>—</Text>;
	const Icon =
		value > 0 ? IconArrowUpRight : value < 0 ? IconArrowDownRight : IconMinus;
	const color = value > 0 ? 'green' : value < 0 ? 'red' : 'gray';
	return (
		<Group gap={4} wrap='nowrap'>
			<Text fw={600} size={size} c={color}>
				{value > 0 ? '+' : ''}
				{value}
				{suffix}
			</Text>
			<ThemeIcon
				size={size === 'lg' ? 'sm' : 'xs'}
				variant='light'
				color={color}
			>
				<Icon size={size === 'lg' ? 14 : 12} />
			</ThemeIcon>
		</Group>
	);
};
