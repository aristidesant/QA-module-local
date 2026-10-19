import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DraggableProvided } from '@hello-pangea/dnd';
import { ActionIcon, Avatar, Badge, Menu, Text } from '@mantine/core';
import { IconArrowsExchange, IconGripVertical } from '@tabler/icons-react';
import clsx from 'clsx';
import type { RosterAgent } from '../../types';
import styles from '../TeamConfigPage.module.css';

export interface MoveTarget {
	id: string;
	label: string;
}

interface AgentCardProps {
	agent: RosterAgent;
	/** Where the agent can go; the column they are in is left out. */
	targets: MoveTarget[];
	currentTargetId: string;
	onMove: (agentId: string, targetId: string) => void;
	provided: DraggableProvided;
	isDragging: boolean;
}

/** One agent on the board: drag handle, name with shift, and a menu to move without dragging. */
export const AgentCard: React.FC<AgentCardProps> = ({
	agent,
	targets,
	currentTargetId,
	onMove,
	provided,
	isDragging,
}) => {
	const { t } = useTranslation('qa.team');

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			className={clsx(styles.card, isDragging && styles.dragging)}
		>
			<span
				className={styles.grip}
				{...provided.dragHandleProps}
				aria-label={t('teamConfig.card.dragHandle')}
			>
				<IconGripVertical size={16} />
			</span>
			<Avatar name={agent.name} color='gray' radius='xl' size='sm' />
			<div className={styles.cardBody}>
				<Text size='sm' fw={500} lineClamp={1}>
					{agent.name}
				</Text>
				<Text size='xs' c='dimmed' lineClamp={1}>
					{agent.id} · {t(`shift.${agent.shift}`)}
				</Text>
			</div>
			{agent.status !== 'active' && (
				<Badge size='xs' variant='light' color='gray'>
					{t(`status.${agent.status}`)}
				</Badge>
			)}
			<Menu position='bottom-end' withinPortal>
				<Menu.Target>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='sm'
						aria-label={t('teamConfig.card.moveTo')}
					>
						<IconArrowsExchange size={14} />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>{t('teamConfig.card.moveTo')}</Menu.Label>
					{targets
						.filter((target) => target.id !== currentTargetId)
						.map((target) => (
							<Menu.Item
								key={target.id}
								onClick={() => onMove(agent.id, target.id)}
							>
								{target.label}
							</Menu.Item>
						))}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

export default AgentCard;
