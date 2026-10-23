import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAward, IconCheck } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { PRIZE_ICON } from '~/modules/qa/rankings/constants';
import { formatScore } from '~/modules/qa/rankings/helpers';

interface RankingAsideProps {
	program: RankingProgram;
	/** Milestones the viewing agent has already reached. */
	reachedIds: string[];
}

/** What the ranking pays out: the prize and the milestone badges, in the same quiet grey as the rest of the page. */
export const RankingAside: React.FC<RankingAsideProps> = ({
	program,
	reachedIds,
}) => {
	const { t } = useTranslation('qa.rankings');
	const PrizeIcon = PRIZE_ICON[program.prize.kind];

	return (
		<Stack gap='md'>
			<SectionCard title={t('drawer.prize')}>
				<Group gap='md' wrap='nowrap' align='flex-start'>
					<ThemeIcon size='lg' variant='light' color='gray'>
						<PrizeIcon size={20} />
					</ThemeIcon>
					<div>
						<Text size='sm' fw={600}>
							{program.prize.title}
						</Text>
						<Text size='xs' c='dimmed'>
							{program.prize.description}
						</Text>
						<Badge size='xs' variant='outline' color='gray' mt='xs'>
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
							const reached = reachedIds.includes(milestone.id);
							return (
								<Group key={milestone.id} justify='space-between' wrap='nowrap'>
									<Group gap='xs' wrap='nowrap'>
										<ThemeIcon size='sm' variant='light' color='gray'>
											<IconAward size={14} />
										</ThemeIcon>
										<Text size='sm' fw={reached ? 600 : 400}>
											{milestone.label}
										</Text>
									</Group>
									<Group gap={6} wrap='nowrap'>
										{reached && (
											<Group gap={2} wrap='nowrap'>
												<IconCheck size={14} />
												<Text size='xs'>{t('agent.milestones.reached')}</Text>
											</Group>
										)}
										<Badge size='xs' variant='outline' color='gray'>
											{formatScore(program, milestone.threshold)}
										</Badge>
									</Group>
								</Group>
							);
						})}
					</Stack>
				)}
			</SectionCard>
		</Stack>
	);
};

export default RankingAside;
