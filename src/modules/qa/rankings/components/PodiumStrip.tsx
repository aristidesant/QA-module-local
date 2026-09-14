import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Group, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { formatScore } from '../helpers';
import { PODIUM_COLORS } from '../constants';
import styles from '../Rankings.module.css';

interface PodiumStripProps {
	program: RankingProgram;
	standings: RankingStanding[];
}

const initials = (name: string) =>
	name
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('');

/** Top three of the ranking, gold / silver / bronze. */
export const PodiumStrip: React.FC<PodiumStripProps> = ({
	program,
	standings,
}) => {
	const { t } = useTranslation('qa.rankings');
	const top = standings.filter((s) => s.rank !== null).slice(0, 3);
	const places = [
		t('agent.podium.first'),
		t('agent.podium.second'),
		t('agent.podium.third'),
	];

	return (
		<SectionCard fullHeight title={t('agent.podium.title')}>
			<Group align='flex-start' gap='md' grow>
				{top.map((standing, index) => (
					<div key={standing.agentId} className={styles.podiumStep}>
						<Avatar size='lg' radius='xl' color={PODIUM_COLORS[index]}>
							{initials(standing.agentName)}
						</Avatar>
						<Stack gap={0} align='center'>
							<Text size='xs' fw={700} c={PODIUM_COLORS[index]}>
								{places[index]}
							</Text>
							<Text
								size='sm'
								fw={500}
								className={styles.podiumName}
								lineClamp={1}
							>
								{standing.agentName}
							</Text>
							<Text size='sm' c='dimmed'>
								{formatScore(program, standing.score)}
							</Text>
						</Stack>
					</div>
				))}
			</Group>
		</SectionCard>
	);
};

export default PodiumStrip;
