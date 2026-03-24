import type { ReactNode } from 'react';
import { ActionIcon, Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import styles from '../ToolForm.module.css';

interface ToolFormRepeaterRowProps {
	title: string;
	description?: string;
	children: ReactNode;
	onRemove: () => void;
	removeLabel: string;
	statusLabel?: string;
	statusColor?: string;
	compact?: boolean;
}

export default function ToolFormRepeaterRow({
	title,
	description,
	children,
	onRemove,
	removeLabel,
	statusLabel,
	statusColor = 'gray',
	compact = false,
}: ToolFormRepeaterRowProps) {
	return (
		<Paper
			withBorder
			radius='md'
			p={compact ? 'sm' : 'md'}
			className={styles.repeaterRow}
		>
			<Group justify='space-between' align='flex-start' gap='xs' wrap='nowrap'>
				<Group
					gap='xs'
					align='flex-start'
					wrap='nowrap'
					className={styles.repeaterRowLead}
				>
					<IconGripVertical size={16} className={styles.repeaterRowGrip} />
					<Stack gap={3} className={styles.repeaterRowHeading}>
						<Group gap='xs' align='center' wrap='wrap'>
							<Text size='sm' fw={600} className={styles.repeaterRowTitle}>
								{title}
							</Text>
							{statusLabel && (
								<Badge
									size='xs'
									variant='light'
									color={statusColor}
									radius='sm'
								>
									{statusLabel}
								</Badge>
							)}
						</Group>
						{description && (
							<Text
								size='xs'
								c='dimmed'
								className={styles.repeaterRowDescription}
							>
								{description}
							</Text>
						)}
					</Stack>
				</Group>
				<ActionIcon
					variant='subtle'
					color='red'
					size='sm'
					aria-label={removeLabel}
					onClick={onRemove}
					className={styles.repeaterRowRemove}
				>
					<IconTrash size={14} />
				</ActionIcon>
			</Group>
			<div className={styles.repeaterRowBody}>{children}</div>
		</Paper>
	);
}
