import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
	Badge,
	Button,
	Group,
	Progress,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { roleFromPath } from '~/modules/qa/team/helpers';
import type { BurnoutDriverId } from '../../types';
import styles from '../TeamAnalyticsPage.module.css';

interface BurnoutRow {
	agentId: string;
	agentName: string;
	supervisorName: string;
	riskLevel: 'HIGH' | 'MEDIUM';
	riskScore: number;
	drivers: BurnoutDriverId[];
	lastAction?: string;
}

/** Driver rule ids map to their own label keys under `burnout.drivers`. */
const DRIVER_LABEL_KEY: Record<BurnoutDriverId, string> = {
	AGENT_SENTIMENT_TREND: 'agentSentimentTrend',
	NEGATIVE_EMOTION_7D: 'negativeEmotionShare',
	QA_TREND_14D: 'qaScoreTrend',
	AFTER_HOURS_30D: 'afterHoursShare',
	AHT_VS_TEAM_30D: 'ahtVsTeam',
};

const MAX_VISIBLE_DRIVERS = 2;

const BURNOUT_ROWS: BurnoutRow[] = [
	{
		agentId: 'AG-001',
		agentName: 'Agent Smith',
		supervisorName: 'Laura Méndez',
		riskLevel: 'HIGH',
		riskScore: 85,
		drivers: ['AGENT_SENTIMENT_TREND', 'AFTER_HOURS_30D', 'QA_TREND_14D'],
		lastAction: 'Check-in · 2 days ago',
	},
	{
		agentId: 'AG-002',
		agentName: 'Agent Johnson',
		supervisorName: 'Laura Méndez',
		riskLevel: 'MEDIUM',
		riskScore: 62,
		drivers: ['NEGATIVE_EMOTION_7D', 'QA_TREND_14D'],
		lastAction: 'Coaching · 1 week ago',
	},
	{
		agentId: 'AG-003',
		agentName: 'Agent Williams',
		supervisorName: 'Laura Méndez',
		riskLevel: 'MEDIUM',
		riskScore: 58,
		drivers: ['AHT_VS_TEAM_30D'],
	},
];

const BurnoutView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const role = roleFromPath(location.pathname);

	const rows = BURNOUT_ROWS.map((row) => {
		const visibleDrivers = row.drivers.slice(0, MAX_VISIBLE_DRIVERS);
		const hiddenCount = row.drivers.length - visibleDrivers.length;
		const riskColor = row.riskLevel === 'HIGH' ? 'red' : 'orange';

		return (
			<Table.Tr key={row.agentId}>
				<Table.Td>
					<Text fw={500} size='sm'>
						{row.agentName}
					</Text>
				</Table.Td>
				{role === 'qa-manager' && (
					<Table.Td>
						<Text size='sm' c='dimmed'>
							{row.supervisorName}
						</Text>
					</Table.Td>
				)}
				<Table.Td className={styles.levelColumn}>
					<Badge color={riskColor} variant='light' size='sm'>
						{row.riskLevel === 'HIGH'
							? t('burnout.levelHigh')
							: t('burnout.levelMedium')}
					</Badge>
				</Table.Td>
				<Table.Td className={styles.riskColumn}>
					<Group gap='xs' wrap='nowrap'>
						<Progress
							value={row.riskScore}
							color={riskColor}
							size='sm'
							className={styles.riskBar}
						/>
						<Text size='sm' fw={600}>
							{row.riskScore}%
						</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Group gap={4} wrap='wrap'>
						{visibleDrivers.map((driver) => (
							<Badge
								key={driver}
								variant='outline'
								size='sm'
								color='gray'
								tt='none'
							>
								{t(`burnout.drivers.${DRIVER_LABEL_KEY[driver]}`)}
							</Badge>
						))}
						{hiddenCount > 0 && (
							<Tooltip
								label={row.drivers
									.slice(MAX_VISIBLE_DRIVERS)
									.map((d) => t(`burnout.drivers.${DRIVER_LABEL_KEY[d]}`))
									.join(', ')}
								withArrow
							>
								<Badge variant='light' size='sm' color='gray'>
									{t('filters.chips.more', { count: hiddenCount })}
								</Badge>
							</Tooltip>
						)}
					</Group>
				</Table.Td>
				<Table.Td>
					<Text size='sm' c={row.lastAction ? undefined : 'dimmed'}>
						{row.lastAction ?? t('burnout.historyEmpty')}
					</Text>
				</Table.Td>
				<Table.Td align='right'>
					<Button size='xs' variant='light'>
						{t('actions.viewProfile')}
					</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<Stack gap='md'>
			<div>
				<Text fw={600} size='sm'>
					{t('burnout.title')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t(`burnout.listDescription.${role}`)}
				</Text>
			</div>

			<div className={styles.tableSurface}>
				<Table striped highlightOnHover verticalSpacing='sm' miw={860}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('burnout.columns.agent')}</Table.Th>
							{role === 'qa-manager' && (
								<Table.Th>{t('burnout.columns.supervisor')}</Table.Th>
							)}
							<Table.Th className={styles.levelColumn}>
								{t('burnout.columns.level')}
							</Table.Th>
							<Table.Th className={styles.riskColumn}>
								{t('burnout.columns.risk')}
							</Table.Th>
							<Table.Th>{t('burnout.columns.drivers')}</Table.Th>
							<Table.Th>{t('burnout.columns.lastAction')}</Table.Th>
							<Table.Th align='right' className={styles.actionColumn} />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</div>
		</Stack>
	);
};

export default BurnoutView;
