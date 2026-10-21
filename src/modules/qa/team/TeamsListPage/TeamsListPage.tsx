import { useMemo } from 'react';
import { Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import { useTeamStore, selectSupervisors } from '~/stores/qa/teamStore';
import { TEAM_CAMPAIGNS } from '../mockData';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { withRuleBurnout } from '~/modules/qa/analytics/helpers';
import type { TeamListRow } from '../types';
import { teamBasePath, teamListRows, teamsListKpis } from '../helpers';
import { TeamsKpiStrip } from './TeamsKpiStrip';
import { useTeamsColumns } from './useTeamsColumns';

export default function TeamsListPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const supervisors = useTeamStore(selectSupervisors);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const profiles = useTeamStore((s) => s.profiles);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	// At-risk counts follow the burnout rules in Triggers.
	const liveProfiles = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(profiles).map(([id, p]) => [
					id,
					withRuleBurnout(p, triggerRules),
				])
			),
		[profiles, triggerRules]
	);

	const rows = useMemo(() => {
		const campaignNamesFor = (supervisorId: string) =>
			(teamCampaignIds[supervisorId] ?? [])
				.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
				.filter((n): n is string => Boolean(n));
		return teamListRows(
			Object.values(supervisors),
			liveProfiles,
			campaignNamesFor
		);
	}, [supervisors, liveProfiles, teamCampaignIds]);
	const kpis = useMemo(
		() => teamsListKpis(rows, liveProfiles),
		[rows, liveProfiles]
	);
	const columns = useTeamsColumns(t);

	return (
		<ContentContainer
			contentWidth='full'
			title={t('teams.list.title')}
			description={t('teams.list.description')}
		>
			<Stack gap='lg'>
				<TeamsKpiStrip kpis={kpis} />
				<SectionCard
					headerActions={
						<Text size='sm' c='dimmed'>
							{t('teams.list.rowsCount', { count: kpis.teams })}
						</Text>
					}
				>
					<BaseTable<TeamListRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'averageOverall', desc: true }]}
						density='compact'
						emptyMessage={t('teams.list.empty')}
						onRowClick={(r) =>
							navigate(`${teamBasePath('qa-manager')}/${r.id}`)
						}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
