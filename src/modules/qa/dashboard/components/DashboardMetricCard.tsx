import React from 'react';
import { Paper, Stack, Text, Group, ThemeIcon } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

interface DashboardMetricCardProps {
	label: string;
	value: string | number;
	unit?: string;
	trend?: 'up' | 'down';
	trendValue?: string;
	color?: string;
	progress?: number;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
	label,
	value,
	unit,
	trend,
	trendValue,
	color = 'blue',
	progress,
}) => {
	return (
		<Paper p='md' radius='md' withBorder>
			<Stack gap='xs'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='sm' c='dimmed' fw={500}>
							{label}
						</Text>
						<Group gap='xs' align='baseline' mt='xs'>
							<Text fw={700} size='lg'>
								{value}
							</Text>
							{unit && (
								<Text size='sm' c='dimmed'>
									{unit}
								</Text>
							)}
						</Group>
					</div>
					{progress !== undefined && (
						<div
							style={{
								width: 60,
								height: 60,
								borderRadius: '50%',
								background: `conic-gradient(var(--mantine-color-${color}-5) ${progress * 3.6}deg, var(--mantine-color-gray-2) 0deg)`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Text size='xs' fw={600}>
								{progress}%
							</Text>
						</div>
					)}
				</Group>
				{trend && (
					<Group gap='xs'>
						<ThemeIcon
							color={trend === 'up' ? 'teal' : 'red'}
							variant='light'
							size='sm'
						>
							{trend === 'up' ? (
								<IconTrendingUp size={14} />
							) : (
								<IconTrendingDown size={14} />
							)}
						</ThemeIcon>
						<Text size='xs' c={trend === 'up' ? 'teal' : 'red'}>
							{trendValue}
						</Text>
					</Group>
				)}
			</Stack>
		</Paper>
	);
};
