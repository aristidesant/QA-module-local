import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Avatar,
	Button,
	Group,
	Menu,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconPencil,
	IconTrash,
	IconUserEdit,
	IconUserOff,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import type { AgentStatus, RosterSupervisor } from '../../types';
import { StatusMenu } from './StatusMenu';

interface TeamHeaderProps {
	supervisor: RosterSupervisor;
	variant: 'team' | 'unassigned';
	onEditSupervisor: () => void;
	onSupervisorStatusChange: (status: AgentStatus) => void;
	onEditTeam: () => void;
	onDissolve: () => void;
}

/** The selected team: its supervisor and the team actions. */
export const TeamHeader: React.FC<TeamHeaderProps> = ({
	supervisor,
	variant,
	onEditSupervisor,
	onSupervisorStatusChange,
	onEditTeam,
	onDissolve,
}) => {
	const { t } = useTranslation('qa.team');
	const isUnassigned = variant === 'unassigned';

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
						<Group gap='xs' wrap='wrap'>
							<Text size='sm' c='dimmed'>
								{isUnassigned
									? t('teamConfig.header.unassignedHint')
									: `${supervisor.name} · ${supervisor.email}`}
							</Text>
							{!isUnassigned && (
								<StatusMenu
									status={supervisor.status ?? 'active'}
									onChange={onSupervisorStatusChange}
								/>
							)}
						</Group>
					</div>
				</Group>
				{!isUnassigned && (
					<Group gap='xs' wrap='nowrap'>
						<Button
							size='xs'
							variant='default'
							leftSection={<IconUserEdit size={14} />}
							onClick={onEditSupervisor}
						>
							{t('teamConfig.header.changeSupervisor')}
						</Button>
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
					</Group>
				)}
			</Group>
		</SectionCard>
	);
};

export default TeamHeader;
