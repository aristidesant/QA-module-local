import { Avatar, Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RosterSupervisor } from '../types';
import { getScoreColor } from '../helpers';
import styles from './TeamsListPage.module.css';

interface TeamCardProps {
	supervisor: RosterSupervisor;
	memberCount: number;
	averageOverall: number;
	atRisk: number;
	campaignNames: string[];
	onClick: () => void;
}

export function TeamCard({
	supervisor,
	memberCount,
	averageOverall,
	atRisk,
	campaignNames,
	onClick,
}: TeamCardProps) {
	const { t } = useTranslation('qa.team');

	return (
		<Card
			withBorder
			padding='lg'
			radius='md'
			className={styles.clickableCard}
			onClick={onClick}
		>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Group gap='sm' wrap='nowrap'>
					<Avatar name={supervisor.name} radius='xl' size='md' />
					<Stack gap={0}>
						<Title order={5}>{supervisor.team}</Title>
						<Text size='sm' c='dimmed'>
							{supervisor.name}
						</Text>
					</Stack>
				</Group>
				{memberCount > 0 && (
					<Badge
						size='lg'
						variant='filled'
						color={getScoreColor(averageOverall)}
					>
						{averageOverall}
					</Badge>
				)}
			</Group>
			<Group gap='xs' mt='md'>
				<Badge variant='light'>
					{t('teams.list.membersCount', { count: memberCount })}
				</Badge>
				{atRisk > 0 && (
					<Badge variant='light' color='red'>
						{t('teams.list.atRisk', { count: atRisk })}
					</Badge>
				)}
			</Group>
			{campaignNames.length > 0 && (
				<Group gap={6} mt='sm'>
					{campaignNames.map((name) => (
						<Badge key={name} variant='outline' size='xs'>
							{name}
						</Badge>
					))}
				</Group>
			)}
		</Card>
	);
}
