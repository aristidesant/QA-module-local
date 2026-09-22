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
			<Group align='flex-end' gap='md' grow>
				{top.map((standing, index) => (
					<div
						key={standing.agentId}
						className={styles.podiumStep}
						data-place={index + 1}
					>
						<Avatar
							size={index === 0 ? 'xl' : 'lg'}
							radius='xl'
							color={PODIUM_COLORS[index]}
							className={styles.podiumAvatar}
						>
							{initials(standing.agentName)}
						</Avatar>
						<Stack gap={0} align='center'>
							<Text
								size={index === 0 ? 'sm' : 'xs'}
								fw={700}
								c={PODIUM_COLORS[index]}
							>
								{places[index]}
							</Text>
							<Text
								size={index === 0 ? 'md' : 'sm'}
								fw={index === 0 ? 700 : 500}
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
