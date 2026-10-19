import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { ESG_PILLARS } from '~/views/Campaigns/constants';
import type { OperationManagerEsg } from '../mockData';
import styles from '../Dashboard.module.css';

interface EsgScoreCardProps {
	esg: OperationManagerEsg;
}

/** Exceptions only: a good score reads as neutral, watch / at risk keep the status hues. */
const STATUS_COLOR: Record<OperationManagerEsg['status'], string> = {
	good: 'gray',
	watch: 'amber',
	atRisk: 'danger',
};

/** Overall ESG score for the client and its three pillars. */
export const EsgScoreCard: React.FC<EsgScoreCardProps> = ({ esg }) => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<Stack gap='md'>
			<Group gap='xs' align='baseline'>
				<Text className={styles.scoreValue}>{esg.overall}</Text>
				<Text size='sm' c='dimmed'>
					{t('operationManager.esg.score')}
				</Text>
				<Badge size='xs' variant='light' color={STATUS_COLOR[esg.status]}>
					{t(`operationManager.esg.status.${esg.status}`)}
				</Badge>
			</Group>

			<Stack gap='sm'>
				{esg.pillars.map((pillar) => {
					const Icon = ESG_PILLARS[pillar.key].icon;
					const label = t(`operationManager.esg.pillar.${pillar.key}`);
					return (
						<div key={pillar.key}>
							<Group justify='space-between' mb={4} wrap='nowrap'>
								<Group gap='xs' wrap='nowrap'>
									<ThemeIcon size='sm' variant='light' color='gray' radius='md'>
										<Icon size={14} />
									</ThemeIcon>
									<Text size='sm' fw={500}>
										{label}
									</Text>
								</Group>
								<Text size='sm' fw={600}>
									{pillar.score}
								</Text>
							</Group>
							<Progress
								value={pillar.score}
								size='xs'
								color='gray'
								aria-label={`${label} ${pillar.score}`}
							/>
						</div>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default EsgScoreCard;
