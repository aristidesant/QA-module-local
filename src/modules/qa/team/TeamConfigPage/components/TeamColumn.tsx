import React from 'react';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import {
	ActionIcon,
	Avatar,
	Badge,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconEdit,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import clsx from 'clsx';
import type { RosterAgent, RosterSupervisor } from '../../types';
import styles from '../TeamConfigPage.module.css';
import { AgentCard, type MoveTarget } from './AgentCard';

interface TeamColumnProps {
	supervisor: RosterSupervisor;
	/** Agents shown in the column (after the search). */
	agents: RosterAgent[];
	/** Everyone in the team, shown in the count even while a search hides some cards. */
	memberCount: number;
	variant?: 'team' | 'unassigned';
	targets: MoveTarget[];
	onMove: (agentId: string, targetId: string) => void;
	onEditSupervisor?: () => void;
	onRename?: () => void;
	onDissolve?: () => void;
}

/** One team on the board: its supervisor on top and a drop zone with the team's agents. */
export const TeamColumn: React.FC<TeamColumnProps> = ({
	supervisor,
	agents,
	memberCount,
	variant = 'team',
	targets,
	onMove,
	onEditSupervisor,
	onRename,
	onDissolve,
}) => {
	const { t } = useTranslation('qa.team');
	const isUnassigned = variant === 'unassigned';

	return (
		<Paper
			withBorder
			radius='md'
			className={clsx(styles.column, isUnassigned && styles.columnUnassigned)}
		>
			<Stack gap={6} className={styles.columnHeader}>
				<Group justify='space-between' wrap='nowrap' gap='xs'>
					<Title order={4} lineClamp={1}>
						{isUnassigned ? t('teamConfig.board.unassigned') : supervisor.team}
					</Title>
					{!isUnassigned && (
						<Menu position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									color='gray'
									aria-label={t('teamConfig.column.menu.label')}
								>
									<IconDotsVertical size={16} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEdit size={14} />}
									onClick={onEditSupervisor}
								>
									{t('teamConfig.column.menu.editSupervisor')}
								</Menu.Item>
								<Menu.Item
									leftSection={<IconPencil size={14} />}
									onClick={onRename}
								>
									{t('teamConfig.column.menu.renameTeam')}
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									color='red'
									leftSection={<IconTrash size={14} />}
									onClick={onDissolve}
								>
									{t('teamConfig.column.menu.dissolveTeam')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					)}
				</Group>

				{isUnassigned ? (
					<Text size='xs' c='dimmed'>
						{t('teamConfig.board.unassignedHint')}
					</Text>
				) : (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={supervisor.name} color='gray' radius='xl' size='md' />
						<div className={styles.cardBody}>
							<Text size='sm' fw={600} lineClamp={1}>
								{supervisor.name}
							</Text>
							<Text size='xs' c='dimmed' lineClamp={1}>
								{supervisor.email}
							</Text>
						</div>
					</Group>
				)}

				<div>
					<Badge
						variant='light'
						size='sm'
						color={isUnassigned && memberCount > 0 ? 'amber' : 'gray'}
					>
						{t('teamConfig.column.members', { count: memberCount })}
					</Badge>
				</div>
			</Stack>

			<Droppable droppableId={`team:${supervisor.id}`} type='AGENT'>
				{(drop, snapshot) => (
					<div
						ref={drop.innerRef}
						{...drop.droppableProps}
						className={clsx(
							styles.list,
							snapshot.isDraggingOver && styles.dropActive
						)}
					>
						{agents.length === 0 && !snapshot.isDraggingOver && (
							<div className={styles.dropHint}>
								<Text size='xs' c='dimmed'>
									{t('teamConfig.board.dropHint')}
								</Text>
							</div>
						)}
						{agents.map((agent, index) => (
							<Draggable
								key={agent.id}
								draggableId={`agent:${agent.id}`}
								index={index}
							>
								{(drag, dragSnapshot) => (
									<AgentCard
										agent={agent}
										targets={targets}
										currentTargetId={supervisor.id}
										onMove={onMove}
										provided={drag}
										isDragging={dragSnapshot.isDragging}
									/>
								)}
							</Draggable>
						))}
						{drop.placeholder}
					</div>
				)}
			</Droppable>
		</Paper>
	);
};

export default TeamColumn;
