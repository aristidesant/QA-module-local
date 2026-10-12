import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Anchor, Breadcrumbs, Button, Stack, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import RankingView from '../components/RankingView';
import { rankingEditPath, rankingPath, rankingsBasePath } from '../constants';
import { computeStandings, programsForRole } from '../helpers';

/** One ranking on its own page (route `rankings/:programId`): the same view the agents see, plus Edit. */
export default function RankingDetailPage() {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const navigate = useNavigate();
	const { programId } = useParams<{ programId: string }>();

	const role = roleFromPath(location.pathname);
	const programs = useRankingsStore(selectPrograms);
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);

	const program =
		programsForRole(programs, role).find((p) => p.id === programId) ?? null;

	// Opening a ranking is the moment its milestones are reconciled with the data.
	useEffect(() => {
		if (programId) syncMilestones(programId);
	}, [programId, syncMilestones]);

	const standings = useMemo(
		() => (program ? computeStandings(program, TEAM_CALLS) : []),
		[program]
	);

	// The list passes its filters along so going back keeps the view the manager had.
	const from = (location.state as { from?: string } | null)?.from ?? '';
	const backToRankings = () => navigate(`${rankingsBasePath(role)}${from}`);

	if (!program) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('page.notFound')} />
			</ContentContainer>
		);
	}

	// The editor brings the manager back here, with the list's filters still remembered.
	const editRanking = () =>
		navigate(rankingEditPath(role, program.id), {
			state: { returnTo: rankingPath(role, program.id), from },
		});

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={backToRankings}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={backToRankings}>
						{t('page.title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{program.name}
					</Text>
				</Breadcrumbs>

				<RankingView
					program={program}
					standings={standings}
					viewer={{ canReact: false }}
					actions={
						<Button
							variant='default'
							leftSection={<IconEdit size={16} />}
							onClick={editRanking}
						>
							{t('card.edit')}
						</Button>
					}
				/>
			</Stack>
		</ContentContainer>
	);
}
