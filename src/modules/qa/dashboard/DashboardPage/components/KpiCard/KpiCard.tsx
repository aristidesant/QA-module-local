import { Group, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

import classes from './KpiCard.module.css';

export type KpiAccent = 'green' | 'blue' | 'yellow' | 'red';

export interface KpiCardProps {
	icon: Icon;
	label: string;
	value: string;
	hint?: string;
	accent?: KpiAccent;
	loading?: boolean;
	className?: string;
}

export default function KpiCard({
	icon: Icon,
	label,
	value,
	hint,
	accent = 'green',
	loading = false,
	className,
}: KpiCardProps) {
	return (
		<Paper
			className={[classes.card, className].filter(Boolean).join(' ')}
			data-accent={accent}
			p='lg'
			radius='md'
			shadow='md'
			withBorder
		>
			<Group align='flex-start' gap='xs' justify='space-between' wrap='nowrap'>
				<Stack gap={4}>
					<Text c='dimmed' fw={600} size='xs' tt='uppercase'>
						{label}
					</Text>
					{loading ? (
						<Skeleton height={30} width={88} />
					) : (
						<Text className={classes.value}>{value}</Text>
					)}
					{loading ? (
						<Skeleton height={14} width={120} />
					) : hint ? (
						<Text c='dimmed' size='xs'>
							{hint}
						</Text>
					) : null}
				</Stack>
				<ThemeIcon className={classes.icon} radius='md' size='lg'>
					<Icon size={20} />
				</ThemeIcon>
			</Group>
		</Paper>
	);
}
