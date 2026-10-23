import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { daysLeft, isPermanent } from '~/modules/qa/rankings/helpers';
import MetricChips from '~/modules/qa/rankings/components/MetricChips';
import RankingStandings from '~/modules/qa/rankings/components/RankingStandings';
import { formatTarget } from '~/modules/qa/rankings/helpers';
import RankingAside from './RankingAside';
import YourStandingStrip from './YourStandingStrip';

interface AgentRankingViewProps {
	program: RankingProgram;
	standings: RankingStanding[];
	agentId: string;
	onRowClick: (standing: RankingStanding) => void;
}

/** One ranking from the agent's side: their own numbers first, then the team standings and what is at stake. */
export const AgentRankingView: React.FC<AgentRankingViewProps> = ({
	program,
	standings,
	agentId,
	onRowClick,
}) => {
	const { t } = useTranslation('qa.rankings');
	const mine = standings.find((s) => s.agentId === agentId);
	const timeLabel = isPermanent(program)
		? t('card.alwaysOn')
		: `${t('card.daysLeft', { count: daysLeft(program) ?? 0 })} · ${t('card.endsOn', { date: dayjs(program.endDate).format('DD MMM') })}`;

	return (
		<Stack gap='lg'>
			<Stack gap={6}>
				<Title order={2} size='h3'>
					{program.name}
				</Title>
				{program.description && (
					<Text size='sm' c='dimmed'>
						{program.description}
					</Text>
				)}
				<Text size='xs' c='dimmed'>
					{t('agent.meta', {
						name: program.createdBy,
						target: formatTarget(program),
					})}{' '}
					· {timeLabel}
				</Text>
				<MetricChips program={program} size='sm' />
			</Stack>

			<YourStandingStrip
				program={program}
				standings={standings}
				agentId={agentId}
			/>

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<RankingStandings
						title={t('agent.standingsTitle')}
						program={program}
						standings={standings}
						currentAgentId={agentId}
						onRowClick={onRowClick}
						reactions={program.allowReactions ? 'interactive' : 'off'}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<RankingAside
						program={program}
						reachedIds={mine?.milestoneIds ?? []}
					/>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default AgentRankingView;
