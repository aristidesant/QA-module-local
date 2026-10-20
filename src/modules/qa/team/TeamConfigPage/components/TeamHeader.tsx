import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Avatar,
	Badge,
	Group,
	Menu,
	Progress,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconEdit,
	IconPencil,
	IconTrash,
	IconUserOff,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import type { RosterSupervisor } from '../../types';
import { teamCapacity } from '../capacity';

interface TeamHeaderProps {
	supervisor: RosterSupervisor;
	count: number;
	variant: 'team' | 'unassigned';
	onEditSupervisor: () => void;
	onEditTeam: () => void;
	onDissolve: () => void;
}

/** The selected team: supervisor, capacity against the target and the team actions. */
export const TeamHeader: React.FC<TeamHeaderProps> = ({
	supervisor,
	count,
	variant,
	onEditSupervisor,
	onEditTeam,
	onDissolve,
}) => {
	const { t } = useTranslation('qa.team');
	const isUnassigned = variant === 'unassigned';
	const cap = teamCapacity(count, supervisor.targetSize);

	return (
		<SectionCard padding='md'>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Group gap='sm' wrap='nowrap'>
					{isUnassigned ? (
						<ThemeIcon variant='light' color='gray' size='lg' radius='xl'>
							<IconUserOff size={18} />
						</ThemeIcon>
					) : (
						<Avatar name={supervisor.name} color='gray' radius='xl' size='md' />
					)}
					<div>
						<Title order={4}>
							{isUnassigned ? t('teamConfig.rail.unassigned') : supervisor.team}
						</Title>
						<Text size='sm' c='dimmed'>
							{isUnassigned
								? t('teamConfig.header.unassignedHint')
								: `${supervisor.name} · ${supervisor.email}`}
						</Text>
					</div>
				</Group>
				{!isUnassigned && (
					<Menu position='bottom-end' withinPortal>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								aria-label={t('teamConfig.header.menu.label')}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={onEditSupervisor}
							>
								{t('teamConfig.header.menu.editSupervisor')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconPencil size={14} />}
								onClick={onEditTeam}
							>
								{t('teamConfig.header.menu.editTeam')}
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={onDissolve}
							>
								{t('teamConfig.header.menu.dissolveTeam')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				)}
			</Group>

			{isUnassigned ? (
				<Text size='sm' mt='sm'>
					{t('teamConfig.header.agents', { count })}
				</Text>
			) : (
				<Group gap='sm' wrap='wrap' mt='sm'>
					<Progress
						size='sm'
						radius='xl'
						w={180}
						value={cap.percent}
						color={cap.color}
					/>
					<Text size='sm'>
						{t('teamConfig.header.agents', { count })} ·{' '}
						{t('teamConfig.header.target', { target: cap.target })}
					</Text>
					{cap.state === 'over' && (
						<Badge variant='light' color='amber'>
							{t('teamConfig.header.overBy', { count: cap.diff })}
						</Badge>
					)}
					{cap.state === 'at' && (
						<Badge variant='light' color='green'>
							{t('teamConfig.header.atTarget')}
						</Badge>
					)}
					{cap.state === 'under' && (
						<Text size='sm' c='dimmed'>
							{t('teamConfig.header.openSeats', { count: cap.diff })}
						</Text>
					)}
				</Group>
			)}
		</SectionCard>
	);
};

export default TeamHeader;
