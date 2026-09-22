import { SimpleGrid } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import {
	useTeamStore,
	selectSupervisors,
	selectUnassignedAgents,
} from '~/stores/qa/teamStore';
import { TEAM_CAMPAIGNS } from '../mockData';
import { UNASSIGNED_SUPERVISOR } from '../constants';
import { teamCardStats } from '../helpers';
import { TeamCard } from './TeamCard';

export default function TeamsListPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const supervisors = useTeamStore(selectSupervisors);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const profiles = useTeamStore((s) => s.profiles);
	const unassignedAgents = useTeamStore(selectUnassignedAgents);

	const campaignNamesFor = (supervisorId: string) =>
		(teamCampaignIds[supervisorId] ?? [])
			.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
			.filter((n): n is string => Boolean(n));

	return (
		<ContentContainer
			contentWidth='full'
			title={t('teams.list.title')}
			description={t('teams.list.description')}
		>
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
				{Object.values(supervisors).map((supervisor) => {
					const stats = teamCardStats(supervisor.id, profiles);
					return (
						<TeamCard
							key={supervisor.id}
							supervisor={supervisor}
							memberCount={stats.memberCount}
							averageOverall={stats.averageOverall}
							atRisk={stats.atRisk}
							campaignNames={campaignNamesFor(supervisor.id)}
							onClick={() => navigate(`/qa/qa-manager/teams/${supervisor.id}`)}
						/>
					);
				})}
				{unassignedAgents.length > 0 && (
					<TeamCard
						supervisor={UNASSIGNED_SUPERVISOR}
						memberCount={unassignedAgents.length}
						averageOverall={0}
						atRisk={0}
						campaignNames={[]}
						onClick={() =>
							navigate(`/qa/qa-manager/teams/${UNASSIGNED_SUPERVISOR.id}`)
						}
					/>
				)}
			</SimpleGrid>
		</ContentContainer>
	);
}
