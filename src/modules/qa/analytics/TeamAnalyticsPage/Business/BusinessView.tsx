import { useTranslation } from 'react-i18next';
import {
	Badge,
	Card,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconUsers,
	IconAlertCircle,
} from '@tabler/icons-react';
import type { NonConversionReasonKey } from '~/modules/qa/team/types';
import styles from '../TeamAnalyticsPage.module.css';

const CONVERSION_SUMMARY = { offered: 642, converted: 119, rate: 18.5 };

const NON_CONVERSION_REASONS: {
	key: NonConversionReasonKey;
	count: number;
	percentage: number;
}[] = [
	{ key: 'priceTooHigh', count: 156, percentage: 34 },
	{ key: 'noNeed', count: 142, percentage: 31 },
	{ key: 'distrustQuality', count: 98, percentage: 21 },
	{ key: 'thirdPartyDecision', count: 68, percentage: 14 },
];

const COMPETITORS: {
	name: string;
	mentions: number;
	share: number;
	sentiment: 'positive' | 'negative' | 'neutral';
}[] = [
	{ name: 'CompetitorA', mentions: 87, share: 12, sentiment: 'positive' },
	{ name: 'CompetitorB', mentions: 62, share: 9, sentiment: 'negative' },
	{ name: 'CompetitorC', mentions: 45, share: 6, sentiment: 'neutral' },
];

const BusinessView = () => {
	const { t } = useTranslation('qa.teamAnalytics');

	return (
		<Stack gap='xl'>
			<section>
				<Text fw={600} size='sm'>
					{t('business.conversionTrend')}
				</Text>
				<Text size='sm' c='dimmed' mb='md'>
					{t('business.conversionTrendDescription')}
				</Text>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('business.offered')}
						</Text>
						<Text fw={700} size='lg'>
							{CONVERSION_SUMMARY.offered}
						</Text>
					</Card>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('business.converted')}
						</Text>
						<Text fw={700} size='lg'>
							{CONVERSION_SUMMARY.converted}
						</Text>
					</Card>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('kpis.conversionRate')}
						</Text>
						<Group gap='xs' align='baseline'>
							<Text fw={700} size='lg'>
								{t('business.overallRate', { rate: CONVERSION_SUMMARY.rate })}
							</Text>
							<ThemeIcon size='sm' variant='light' color='green'>
								<IconTrendingUp size={14} />
							</ThemeIcon>
						</Group>
					</Card>
				</SimpleGrid>
			</section>

			<section>
				<Text fw={600} size='sm' mb='md'>
					{t('business.reasons')}
				</Text>
				<Stack gap='sm'>
					{NON_CONVERSION_REASONS.map((reason) => (
						<Card key={reason.key} withBorder p='md'>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									{t(`business.reasonLabels.${reason.key}`)}
								</Text>
								<Badge size='sm' variant='light'>
									{t('business.signalCalls', { count: reason.count })}
								</Badge>
							</Group>
							<Group gap='sm' wrap='nowrap'>
								<Progress value={reason.percentage} size='sm' flex={1} />
								<Text size='sm' fw={500} className={styles.percentValue}>
									{reason.percentage}%
								</Text>
							</Group>
						</Card>
					))}
				</Stack>
			</section>

			<section>
				<Text fw={600} size='sm' mb='md'>
					{t('business.competitors')}
				</Text>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					{COMPETITORS.map((competitor) => (
						<Card key={competitor.name} withBorder p='md'>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									{competitor.name}
								</Text>
								<ThemeIcon
									size='sm'
									variant='light'
									color={
										competitor.sentiment === 'positive'
											? 'green'
											: competitor.sentiment === 'negative'
												? 'red'
												: 'gray'
									}
								>
									{competitor.sentiment === 'positive' ? (
										<IconTrendingUp size={14} />
									) : competitor.sentiment === 'negative' ? (
										<IconAlertCircle size={14} />
									) : (
										<IconUsers size={14} />
									)}
								</ThemeIcon>
							</Group>
							<Text fw={700} size='lg'>
								{competitor.mentions}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('business.competitorShare', { share: competitor.share })}
							</Text>
						</Card>
					))}
				</SimpleGrid>
			</section>
		</Stack>
	);
};

export default BusinessView;
