import { useTranslation } from 'react-i18next';
import {
	Group,
	Stack,
	ThemeIcon,
	Text,
	Tooltip,
	Skeleton,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import styles from './TeamAnalyticsPage.module.css';

interface KPIMetricProps {
	label: string;
	value: number | string;
	unit?: string;
	trend?: 'up' | 'down' | null;
	trendValue?: number;
	loading?: boolean;
}

function KPIMetric({
	label,
	value,
	unit,
	trend,
	trendValue,
	loading,
}: KPIMetricProps) {
	if (loading) {
		return (
			<Stack gap={4} flex={1}>
				<Skeleton height={12} width='60%' />
				<Skeleton height={20} width='40%' />
			</Stack>
		);
	}

	return (
		<Stack gap={2} flex={1}>
			<Text size='xs' fw={500} c='dimmed'>
				{label}
			</Text>
			<Group gap='xs' align='flex-end'>
				<Text size='lg' fw={700}>
					{value}
					{unit && <span className={styles.unit}>{unit}</span>}
				</Text>
				{trend && trendValue !== undefined && (
					<Tooltip
						label={`${trend === 'up' ? '+' : '-'}${Math.abs(trendValue).toFixed(1)}%`}
						withArrow
					>
						<ThemeIcon
							size='xs'
							variant='light'
							color={trend === 'up' ? 'green' : 'red'}
						>
							{trend === 'up' ? (
								<IconTrendingUp size={12} />
							) : (
								<IconTrendingDown size={12} />
							)}
						</ThemeIcon>
					</Tooltip>
				)}
			</Group>
		</Stack>
	);
}

interface KPIStripProps {
	loading?: boolean;
}

export default function KPIStrip({ loading }: KPIStripProps) {
	const { t } = useTranslation('qa.teamAnalytics');

	return (
		<div className={styles.kpiStrip}>
			<Group gap='xl' grow>
				<KPIMetric
					label={t('kpis.qaScore')}
					value={85}
					unit='%'
					trend='up'
					trendValue={2.3}
					loading={loading}
				/>
				<KPIMetric
					label={t('kpis.compliance')}
					value={92}
					unit='%'
					trend='up'
					trendValue={1.1}
					loading={loading}
				/>
				<KPIMetric
					label={t('kpis.customerSentiment')}
					value={4.2}
					unit='/5'
					trend='down'
					trendValue={0.3}
					loading={loading}
				/>
				<KPIMetric
					label={t('kpis.conversionRate')}
					value={18}
					unit='%'
					trend='up'
					trendValue={4.5}
					loading={loading}
				/>
				<KPIMetric label={t('kpis.calls')} value={1243} loading={loading} />
			</Group>
		</div>
	);
}
