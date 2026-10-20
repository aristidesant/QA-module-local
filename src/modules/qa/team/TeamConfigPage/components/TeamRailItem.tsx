import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Progress, Text, UnstyledButton } from '@mantine/core';
import { IconUserOff } from '@tabler/icons-react';
import clsx from 'clsx';
import type { RosterSupervisor } from '../../types';
import { teamCapacity } from '../capacity';
import styles from '../TeamConfigPage.module.css';

interface TeamRailItemProps {
	supervisor: RosterSupervisor;
	count: number;
	selected: boolean;
	variant?: 'team' | 'unassigned';
	/** Agents matching the rail search; shown only while a search is active. */
	matchCount?: number;
	onSelect: () => void;
}

/** One entry of the teams rail: team name, supervisor and a capacity bar (or the Unassigned pool). */
export const TeamRailItem: React.FC<TeamRailItemProps> = ({
	supervisor,
	count,
	selected,
	variant = 'team',
	matchCount,
	onSelect,
}) => {
	const { t } = useTranslation('qa.team');
	const isUnassigned = variant === 'unassigned';
	const cap = teamCapacity(count, supervisor.targetSize);

	return (
		<UnstyledButton
			className={clsx(
				styles.railItem,
				selected && styles.railItemSelected,
				isUnassigned && styles.railItemUnassigned
			)}
			aria-pressed={selected}
			onClick={onSelect}
		>
			{isUnassigned ? (
				<>
					<Group justify='space-between' wrap='nowrap'>
						<Group gap={6} wrap='nowrap'>
							<IconUserOff size={16} color='var(--mantine-color-dimmed)' />
							<Text size='sm' fw={600}>
								{t('teamConfig.rail.unassigned')}
							</Text>
						</Group>
						<Badge
							size='sm'
							variant='light'
							color={count > 0 ? 'amber' : 'gray'}
						>
							{count}
						</Badge>
					</Group>
					<Text size='xs' c='dimmed'>
						{t('teamConfig.rail.unassignedHint')}
					</Text>
				</>
			) : (
				<>
					<Group justify='space-between' wrap='nowrap' gap='xs'>
						<Text size='sm' fw={600} lineClamp={1}>
							{supervisor.team}
						</Text>
						<Text
							size='xs'
							fw={600}
							c={cap.state === 'over' ? 'amber.8' : 'dimmed'}
						>
							{t('teamConfig.rail.capacity', { count, target: cap.target })}
						</Text>
					</Group>
					<Text size='xs' c='dimmed' lineClamp={1}>
						{supervisor.name}
					</Text>
					<Progress
						size='xs'
						radius='xl'
						value={cap.percent}
						color={cap.color}
						mt={6}
					/>
				</>
			)}
			{matchCount !== undefined && (
				<Text size='xs' c='blue'>
					{t('teamConfig.rail.matches', { count: matchCount })}
				</Text>
			)}
		</UnstyledButton>
	);
};

export default TeamRailItem;
