import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	ScrollArea,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import {
	UNASSIGNED_SUPERVISOR,
	UNASSIGNED_SUPERVISOR_ID,
} from '../../constants';
import type { RosterAgent, RosterSupervisor } from '../../types';
import styles from '../TeamConfigPage.module.css';
import { TeamRailItem } from './TeamRailItem';

interface TeamRailProps {
	supervisors: RosterSupervisor[];
	totals: Record<string, number>;
	agents: RosterAgent[];
	selectedId: string;
	onSelect: (id: string) => void;
}

/** The master list: Unassigned first, then one item per team, with a search over teams and agents. */
export const TeamRail: React.FC<TeamRailProps> = ({
	supervisors,
	totals,
	agents,
	selectedId,
	onSelect,
}) => {
	const { t } = useTranslation('qa.team');
	const [search, setSearch] = useState('');

	/** Matching agents per team while a search is active; null when there is no search. */
	const matches = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return null;
		const byTeam: Record<string, number> = {};
		for (const agent of agents) {
			if (
				agent.name.toLowerCase().includes(query) ||
				agent.id.toLowerCase().includes(query) ||
				agent.email.toLowerCase().includes(query)
			) {
				byTeam[agent.supervisorId] = (byTeam[agent.supervisorId] ?? 0) + 1;
			}
		}
		return { query, byTeam };
	}, [agents, search]);

	const teamMatches = (s: RosterSupervisor) =>
		!matches ||
		s.team.toLowerCase().includes(matches.query) ||
		s.name.toLowerCase().includes(matches.query) ||
		(matches.byTeam[s.id] ?? 0) > 0;
	const showUnassigned =
		!matches ||
		(matches.byTeam[UNASSIGNED_SUPERVISOR_ID] ?? 0) > 0 ||
		UNASSIGNED_SUPERVISOR.team.toLowerCase().includes(matches.query);
	const visibleTeams = supervisors.filter(teamMatches);

	return (
		<div className={styles.rail}>
			<SectionCard
				padding='sm'
				title={t('teamConfig.rail.title')}
				headerActions={
					<Badge variant='light' color='gray'>
						{supervisors.length}
					</Badge>
				}
			>
				<Stack gap='sm'>
					<TextInput
						size='sm'
						placeholder={t('teamConfig.rail.search')}
						aria-label={t('teamConfig.rail.search')}
						leftSection={<IconSearch size={14} />}
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
						rightSection={
							search && (
								<ActionIcon
									size='sm'
									color='gray'
									variant='transparent'
									aria-label={t('teamConfig.clearSearch')}
									onClick={() => setSearch('')}
								>
									<IconX size={14} />
								</ActionIcon>
							)
						}
					/>
					<ScrollArea.Autosize
						mah='calc(100vh - 320px)'
						type='auto'
						offsetScrollbars
					>
						<Stack gap={2}>
							{showUnassigned && (
								<TeamRailItem
									variant='unassigned'
									supervisor={UNASSIGNED_SUPERVISOR}
									count={totals[UNASSIGNED_SUPERVISOR_ID] ?? 0}
									selected={selectedId === UNASSIGNED_SUPERVISOR_ID}
									matchCount={
										matches
											? (matches.byTeam[UNASSIGNED_SUPERVISOR_ID] ?? 0)
											: undefined
									}
									onSelect={() => onSelect(UNASSIGNED_SUPERVISOR_ID)}
								/>
							)}
							{visibleTeams.map((supervisor) => (
								<TeamRailItem
									key={supervisor.id}
									supervisor={supervisor}
									count={totals[supervisor.id] ?? 0}
									selected={selectedId === supervisor.id}
									matchCount={
										matches ? (matches.byTeam[supervisor.id] ?? 0) : undefined
									}
									onSelect={() => onSelect(supervisor.id)}
								/>
							))}
							{!showUnassigned && visibleTeams.length === 0 && (
								<Text size='xs' c='dimmed' ta='center' py='md'>
									{t('teamConfig.rail.empty')}
								</Text>
							)}
						</Stack>
					</ScrollArea.Autosize>
				</Stack>
			</SectionCard>
		</div>
	);
};

export default TeamRail;
