import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import {
	formatScore,
	formatTarget,
	higherIsBetterOf,
	ownStanding,
} from '~/modules/qa/rankings/helpers';

interface YourStandingStripProps {
	program: RankingProgram;
	standings: RankingStanding[];
	agentId: string;
}

function Cell({
	label,
	value,
	hint,
	extra,
}: {
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	extra?: React.ReactNode;
}) {
	return (
		<Stack gap={2}>
			<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
				{label}
			</Text>
			<Text size='xl' fw={700} lh={1.2}>
				{value}
			</Text>
			{extra}
			{hint && (
				<Text size='xs' c='dimmed'>
					{hint}
				</Text>
			)}
		</Stack>
	);
}

/** The agent's own numbers in a ranking: where they are, how close to the target, how they moved, and what separates them from the next place. */
export const YourStandingStrip: React.FC<YourStandingStripProps> = ({
	program,
	standings,
	agentId,
}) => {
	const { t } = useTranslation('qa.rankings');
	const own = ownStanding(program, standings, agentId);
	const mine = own.standing;
	const ranked = mine?.rank != null;
	const delta = mine?.delta ?? null;

	const deltaIcon =
		delta === null || delta === 0
			? IconMinus
			: delta > 0
				? IconArrowUpRight
				: IconArrowDownRight;
	const DeltaIcon = deltaIcon;
	const deltaColor =
		delta === null || delta === 0 ? 'gray' : delta > 0 ? 'green' : 'red';
	const deltaHint =
		delta === null || delta === 0
			? t('agent.you.held')
			: delta > 0
				? t('agent.you.up', { count: delta })
				: t('agent.you.down', { count: Math.abs(delta) });

	const progress =
		ranked && mine?.score != null && higherIsBetterOf(program)
			? Math.min(100, (mine.score / program.targetScore) * 100)
			: null;

	return (
		<SectionCard padding='lg'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='lg'>
				<Cell
					label={t('agent.you.place')}
					value={ranked ? `#${mine!.rank}` : '—'}
					hint={
						ranked
							? t('agent.you.ofRanked', { count: own.rankedCount })
							: t('agent.you.callsToQualify', { count: own.callsToQualify })
					}
				/>
				<Cell
					label={t('agent.you.score')}
					value={ranked ? formatScore(program, mine!.score) : '—'}
					extra={
						progress !== null ? (
							<Progress value={progress} size='xs' color='gray' />
						) : undefined
					}
					hint={
						!ranked
							? t('agent.you.noScore')
							: mine!.reachedTarget
								? t('agent.you.targetReached')
								: t('agent.you.target', { value: formatTarget(program) })
					}
				/>
				<Cell
					label={t('agent.you.sinceWeek')}
					value={
						ranked && delta !== null ? (
							<Group gap={6} wrap='nowrap' align='center'>
								<ThemeIcon size='sm' variant='light' color={deltaColor}>
									<DeltaIcon size={14} />
								</ThemeIcon>
								<Text span inherit>
									{Math.abs(delta)}
								</Text>
							</Group>
						) : (
							'—'
						)
					}
					hint={ranked && delta !== null ? deltaHint : undefined}
				/>
				<Cell
					label={t('agent.you.next')}
					value={
						ranked
							? mine!.rank === 1
								? own.leadOverNext !== null
									? `+${own.leadOverNext}`
									: '—'
								: own.gapToNext !== null
									? own.gapToNext === 0
										? '0'
										: `−${own.gapToNext}`
									: '—'
							: '—'
					}
					hint={
						ranked
							? mine!.rank === 1
								? own.leadOverNext !== null
									? t('agent.you.leading', { points: own.leadOverNext })
									: undefined
								: own.gapToNext !== null
									? own.gapToNext === 0
										? t('drawer.signals.tied')
										: t('agent.you.behind', {
												points: own.gapToNext,
												rank: mine!.rank! - 1,
											})
									: undefined
							: undefined
					}
				/>
			</SimpleGrid>
		</SectionCard>
	);
};

export default YourStandingStrip;
