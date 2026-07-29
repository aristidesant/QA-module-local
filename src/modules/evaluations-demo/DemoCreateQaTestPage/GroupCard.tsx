import React from 'react';
import { ActionIcon, Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
	IconAlertCircle,
	IconListCheck,
	IconPencil,
	IconPlus,
	IconTarget,
	IconTrash,
} from '@tabler/icons-react';
import type { EvaluationGroup } from './types';
import styles from './DemoCreateQaTestPage.module.css';

interface GroupCardProps {
	group: EvaluationGroup;
	totalPoints: number;
	onDeleteGroup: () => void;
	onAddItem: () => void;
	onDeleteItem: (itemId: string) => void;
}

const answerTypeLabel = (answerType: EvaluationGroup['items'][number]['answerType']) =>
	answerType === 'yesNoNA' ? 'Yes/No/N/A' : 'Yes/No';

const GroupCard: React.FC<GroupCardProps> = ({
	group,
	totalPoints,
	onDeleteGroup,
	onAddItem,
	onDeleteItem,
}) => {
	return (
		<div className={styles.groupCard}>
			<Group justify='space-between' align='flex-start'>
				<div>
					<Text fw={700}>{group.name}</Text>
					{group.description && (
						<Text size='sm' c='dimmed'>
							{group.description}
						</Text>
					)}
					<Badge color='blue' variant='light' size='sm' mt={6}>
						Total: {totalPoints} pts
					</Badge>
				</div>
				<Group gap='xs'>
					<ActionIcon variant='subtle' color='gray' aria-label='Edit group'>
						<IconPencil size={16} />
					</ActionIcon>
					<ActionIcon
						variant='subtle'
						color='red'
						aria-label='Delete group'
						onClick={onDeleteGroup}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Group>

			<div className={styles.groupDivider} />

			<Group justify='space-between' align='center' mb='sm'>
				<Text fw={600} size='sm'>
					Evaluation Items
				</Text>
				<Button
					variant='light'
					color='green'
					size='xs'
					leftSection={<IconPlus size={14} />}
					onClick={onAddItem}
				>
					Add Item
				</Button>
			</Group>

			{group.items.length === 0 ? (
				<Text size='sm' c='dimmed'>
					No items added yet
				</Text>
			) : (
				<Stack gap='xs'>
					{group.items.map((item) => (
						<div key={item.id} className={styles.itemRow}>
							<Group justify='space-between' align='flex-start'>
								<Text fw={600} size='sm'>
									{item.name}
								</Text>
								<Group gap='xs'>
									<ActionIcon variant='subtle' color='gray' aria-label='Edit item'>
										<IconPencil size={14} />
									</ActionIcon>
									<ActionIcon
										variant='subtle'
										color='red'
										aria-label='Delete item'
										onClick={() => onDeleteItem(item.id)}
									>
										<IconTrash size={14} />
									</ActionIcon>
								</Group>
							</Group>
							{item.description && (
								<Text size='xs' c='dimmed' mt={2}>
									{item.description}
								</Text>
							)}
							<Group gap='lg' mt='xs'>
								<Group gap={4}>
									<IconAlertCircle size={14} color='var(--mantine-color-dimmed)' />
									<Text size='xs' c='dimmed'>
										{item.severity}
									</Text>
								</Group>
								<Group gap={4}>
									<IconTarget size={14} color='var(--mantine-color-dimmed)' />
									<Text size='xs' c='dimmed'>
										Yes: {item.yesPoints}, No: {item.noPoints}
										{item.answerType === 'yesNoNA' ? `, N/A: ${item.naPoints}` : ''}
									</Text>
								</Group>
								<Group gap={4}>
									<IconListCheck size={14} color='var(--mantine-color-dimmed)' />
									<Text size='xs' c='dimmed'>
										{answerTypeLabel(item.answerType)}
									</Text>
								</Group>
							</Group>
						</div>
					))}
				</Stack>
			)}
		</div>
	);
};

export default GroupCard;
