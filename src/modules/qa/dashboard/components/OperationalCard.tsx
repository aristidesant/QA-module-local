import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Card,
	Divider,
	Stack,
	Group,
	Text,
	Progress,
	ThemeIcon,
} from '@mantine/core';
import { IconChevronRight, IconPhoneCall } from '@tabler/icons-react';
import type { DashboardMetricTrend } from '~/modules/qa/calls/agentMetrics';
import DrillRow from './DrillRow';
import { TrendIndicator } from './TrendIndicator';
import TrendTrigger from './TrendTrigger';
import styles from '../Dashboard.module.css';

interface OperationalCardProps {
	/** Total calls taken or made in the window. */
	calls: number;
	/** Calls where the intended contact was actually reached and engaged. */
	effectiveContacts: number;
	/** Calls that didn't connect with the intended contact. */
	nonEffectiveContacts: number;
	/** Product offers and the sales they produced. Omitted on roles that don't show an individual sales outcome. */
	sales?: { offered: number; sold: number };
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
	/** Opens every call in the window, when there are any. */
	onCallsClick?: () => void;
	/** Opens the non-effective calls behind the number, when there are any. */
	onNonEffectiveClick?: () => void;
	/** Effective-contacts trend vs. the prior period of equal length. Omitted when the caller has no period concept. */
	trend?: DashboardMetricTrend;
	/** Portfolio view (Operation Manager): keeps the rows but drops progress bars, call counts and drill-down. */
	compact?: boolean;
	/** Opens this aspect's trend modal from the header icon. Omitted on dashboards without the trend modal. */
	onTrendClick?: () => void;
}

const pct = (part: number, total: number) =>
	total === 0 ? 0 : Math.round((part / total) * 100);

/** Card 4 of the Performance Score row: call volume and contact effectiveness. */
export const OperationalCard: React.FC<OperationalCardProps> = ({
	calls,
	effectiveContacts,
	nonEffectiveContacts,
	sales,
	subtitle,
	onCallsClick,
	onNonEffectiveClick,
	trend,
	compact = false,
	onTrendClick,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const effectivePct = pct(effectiveContacts, calls);
	const nonEffectivePct = pct(nonEffectiveContacts, calls);
	const clickable = Boolean(onNonEffectiveClick) && nonEffectiveContacts > 0;
	const callsClickable = Boolean(onCallsClick) && calls > 0;
	const salesPct = sales ? pct(sales.sold, sales.offered) : 0;

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='none'
			h='100%'
		>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							Operational
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
						{trend && <TrendIndicator trend={trend} />}
					</div>
					<Group gap={4} wrap='nowrap'>
						{onTrendClick && <TrendTrigger onClick={onTrendClick} />}
						<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
							<IconPhoneCall size={20} />
						</ThemeIcon>
					</Group>
				</Group>

				<DrillRow
					onClick={callsClickable ? onCallsClick : undefined}
					hint={t('drill.hint')}
				>
					<Group
						gap='xs'
						align='baseline'
						justify='space-between'
						wrap='nowrap'
					>
						<Group gap='xs' align='baseline'>
							<Text className={styles.scoreValue}>{calls}</Text>
							<Text size='sm' c='dimmed'>
								calls taken or made
							</Text>
						</Group>
						{callsClickable && <IconChevronRight size={14} />}
					</Group>
				</DrillRow>

				<Stack gap='sm'>
					<DrillRow hint={t('drill.hint')}>
						<Group justify='space-between' mb={compact ? 0 : 4}>
							<Text size='sm' fw={500}>
								Effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{effectivePct}%
								</Text>
								{!compact && (
									<Text size='xs' c='dimmed'>
										{t('drill.calls', { count: effectiveContacts })}
									</Text>
								)}
							</Group>
						</Group>
						{!compact && (
							<Progress
								value={effectivePct}
								size='xs'
								color='gray'
								aria-label={`Effective contacts ${effectivePct}%`}
							/>
						)}
					</DrillRow>

					<DrillRow
						onClick={clickable ? onNonEffectiveClick : undefined}
						hint={t('drill.hint')}
					>
						<Group justify='space-between' mb={compact ? 0 : 4}>
							<Text size='sm' fw={500}>
								Non-effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{nonEffectivePct}%
								</Text>
								{!compact && (
									<Text size='xs' c='dimmed'>
										{t('drill.calls', { count: nonEffectiveContacts })}
									</Text>
								)}
								{clickable && <IconChevronRight size={14} />}
							</Group>
						</Group>
						{!compact && (
							<Progress
								value={nonEffectivePct}
								size='xs'
								color='gray'
								aria-label={`Non-effective contacts ${nonEffectivePct}%`}
							/>
						)}
					</DrillRow>

					{sales && (
						<>
							<Divider />
							<DrillRow hint={t('drill.hint')}>
								<Group justify='space-between' mb={4}>
									<Text size='sm' fw={500}>
										{t('operational.sales.label')}
									</Text>
									<Group gap={6} wrap='nowrap'>
										<Text size='sm' fw={600}>
											{salesPct}%
										</Text>
										<Text size='xs' c='dimmed'>
											{t('operational.sales.offered', {
												sold: sales.sold,
												offered: sales.offered,
											})}
										</Text>
									</Group>
								</Group>
								<Progress
									value={salesPct}
									size='xs'
									color='gray'
									aria-label={`${t('operational.sales.label')} ${salesPct}%`}
								/>
							</DrillRow>
						</>
					)}
				</Stack>
			</Stack>
		</Card>
	);
};

export default OperationalCard;
