import { Badge, Group, Select, Tabs } from '@mantine/core';
import {
	IconCalendarClock,
	IconHistory,
	IconTrophy,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TeamRole } from '~/modules/qa/team/types';
import { RANKING_TABS, TEAMS, type RankingTab } from '../constants';

const TAB_ICON = {
	current: IconTrophy,
	upcoming: IconCalendarClock,
	past: IconHistory,
} as const;

interface RankingTabsProps {
	role: TeamRole;
	tab: RankingTab;
	onTabChange: (tab: RankingTab) => void;
	counts: Record<RankingTab, number>;
	/** The QA manager can narrow every tab to one team. */
	team: string | null;
	onTeamChange: (team: string | null) => void;
}

/** Current / Upcoming & drafts / Past, with how many rankings each holds. */
export function RankingTabs({
	role,
	tab,
	onTabChange,
	counts,
	team,
	onTeamChange,
}: RankingTabsProps) {
	const { t } = useTranslation('qa.rankings');

	return (
		<Group justify='space-between' align='flex-end' wrap='wrap' gap='sm'>
			<Tabs value={tab} onChange={(v) => v && onTabChange(v as RankingTab)}>
				<Tabs.List>
					{RANKING_TABS.map((key) => {
						const Icon = TAB_ICON[key];
						return (
							<Tabs.Tab
								key={key}
								value={key}
								leftSection={<Icon size={16} />}
								rightSection={
									<Badge size='xs' variant='light' color='gray'>
										{counts[key]}
									</Badge>
								}
							>
								{t(`tabs.${key}`)}
							</Tabs.Tab>
						);
					})}
				</Tabs.List>
			</Tabs>
			{role === 'qa-manager' && (
				<Select
					size='sm'
					w={160}
					aria-label={t('tabs.team')}
					placeholder={t('tabs.team')}
					data={TEAMS}
					value={team}
					onChange={onTeamChange}
					clearable
				/>
			)}
		</Group>
	);
}

export default RankingTabs;
