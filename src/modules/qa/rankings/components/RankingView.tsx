import type { ReactNode } from 'react';
import { Badge, Grid, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { formatScore } from '../helpers';
import PodiumStrip from './PodiumStrip';
import RankingHeader from './RankingHeader';
import RankingStandings from './RankingStandings';
import RankingStats from './RankingStats';
import type { ReactionsMode } from './StandingsTable';

interface RankingViewProps {
	program: RankingProgram;
	standings: RankingStanding[];
	/** Who is looking: their own row is highlighted and, if they are an agent, they can react. */
	viewer: { currentAgentId?: string; canReact: boolean };
	/** Page-level actions shown beside the title (for example Edit). */
	actions?: ReactNode;
	onRowClick?: (standing: RankingStanding) => void;
}

/**
 * One ranking as everyone sees it: header, stats, podium, standings, and the
 * prize and milestone badges. Only the viewer changes what they can do on it.
 */
export function RankingView({
	program,
	standings,
	viewer,
	actions,
	onRowClick,
}: RankingViewProps) {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);
	const reactions: ReactionsMode = !program.allowReactions
		? 'off'
		: viewer.canReact
			? 'interactive'
			: 'readonly';

	return (
		<Stack gap='lg'>
			<RankingHeader program={program} actions={actions} />
			<RankingStats program={program} standings={standings} />
			<PodiumStrip program={program} standings={standings} />

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<RankingStandings
						program={program}
						standings={standings}
						currentAgentId={viewer.currentAgentId}
						onRowClick={onRowClick}
						reactions={reactions}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Stack gap='md'>
						<SectionCard title={t('drawer.prize')}>
							<Group gap='md' wrap='nowrap' align='flex-start'>
								<Text size='32px'>{program.prize.icon}</Text>
								<div>
									<Text size='sm' fw={600}>
										{program.prize.title}
									</Text>
									<Text size='xs' c='dimmed'>
										{program.prize.description}
									</Text>
									<Badge size='sm' variant='light' mt='xs'>
										{t(`prizeKinds.${program.prize.kind}`)}
									</Badge>
								</div>
							</Group>
						</SectionCard>

						<SectionCard title={t('drawer.milestones')}>
							{program.milestones.length === 0 ? (
								<Text size='sm' c='dimmed'>
									{t('editor.noBadge')}
								</Text>
							) : (
								<Stack gap='xs'>
									{program.milestones.map((milestone) => {
										const badge = badges.find(
											(b) => b.id === milestone.badgeId
										);
										return (
											<Group key={milestone.id} justify='space-between'>
												<Group gap='xs'>
													<Text size='lg'>{badge?.icon ?? '🏅'}</Text>
													<div>
														<Text size='sm' fw={500}>
															{milestone.label || badge?.name}
														</Text>
														<Text size='xs' c='dimmed'>
															{badge?.name}
														</Text>
													</div>
												</Group>
												<Badge size='sm' variant='light'>
													{formatScore(program, milestone.threshold)}
												</Badge>
											</Group>
										);
									})}
								</Stack>
							)}
						</SectionCard>
					</Stack>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

export default RankingView;
