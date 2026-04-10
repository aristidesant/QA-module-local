import { Badge, Box, Group, HoverCard, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FooterMetricItem } from '../../helpers/types';
import {
	formatFooterLatency,
	getFooterMetricColor,
} from '../../helpers/formatUtils';
import styles from './FooterMetrics.module.css';

interface MessageFooterMetricsProps {
	metrics: FooterMetricItem[];
}

export const MessageFooterMetrics = ({
	metrics,
}: MessageFooterMetricsProps) => (
	<Group gap={6} mt='xs' className={styles.messageFooterMetrics}>
		{metrics.map((metric) => (
			<FooterMetricChip key={metric.kind} metric={metric} />
		))}
	</Group>
);

interface FooterMetricChipProps {
	metric: FooterMetricItem;
}

function FooterMetricChip({ metric }: FooterMetricChipProps) {
	const { t } = useTranslation(['conversations', 'common']);

	const metricColor = getFooterMetricColor(metric.kind);
	const dotClass = `hoverCardDot--${metricColor}`;

	return (
		<HoverCard width={300} position='top' radius='lg' openDelay={100}>
			<HoverCard.Target>
				<Badge
					size='sm'
					variant='light'
					color={metricColor}
					className={styles.metricChip}
				>
					{metric.label}: {formatFooterLatency(metric.latencySeconds)}
				</Badge>
			</HoverCard.Target>
			<HoverCard.Dropdown className={styles.metricHoverCard}>
				<div className={styles.hoverCardHeader}>
					<Box className={`${styles.hoverCardDot} ${styles[dotClass]}`} />
					<Text size='xs' fw={600} c='gray.8'>
						{metric.label}
					</Text>
					<span className={styles.hoverCardLatency}>
						{formatFooterLatency(metric.latencySeconds)}
					</span>
				</div>
				<Stack gap={8}>
					<DetailRow
						label={
							metric.kind === 'asr'
								? t('transcript.footer.provider')
								: t('transcript.footer.model')
						}
						value={<Text size='xs'>{metric.modelLabel}</Text>}
					/>
					<DetailRow
						label={t('transcript.footer.cost')}
						value={
							<Text size='xs' className={styles.monoText}>
								{metric.costLabel}
							</Text>
						}
					/>
				</Stack>
				{metric.details && metric.details.length > 0 && (
					<Box className={styles.breakdownBlock}>
						<span className={styles.breakdownLabel}>
							{t('transcript.footer.breakdown')}
						</span>
						<Stack gap={4}>
							{metric.details.map((detail) => (
								<Group key={detail.name} justify='space-between' gap='xs'>
									<Text size='10px' className={styles.footerMetricName}>
										{detail.name}
									</Text>
									<Text size='10px' className={styles.monoText}>
										{detail.cost}
									</Text>
								</Group>
							))}
						</Stack>
					</Box>
				)}
			</HoverCard.Dropdown>
		</HoverCard>
	);
}

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
	return (
		<Box className={styles.detailRow}>
			<span className={styles.detailLabel}>{label}</span>
			<Box className={styles.detailValue}>{value}</Box>
		</Box>
	);
}
