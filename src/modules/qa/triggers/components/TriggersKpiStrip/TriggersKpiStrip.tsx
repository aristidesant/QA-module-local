import { SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconAward, IconBell, IconSparkles } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '~/components/StatCard';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

export const TriggersKpiStrip = () => {
	const { t } = useTranslation('qa.triggers');
	const { rules, badges } = useTriggerRulesStore();

	const stats = useMemo(() => {
		const active = rules.filter((r) => r.status === 'ACTIVE').length;
		const paused = rules.filter((r) => r.status === 'PAUSED').length;
		const drafts = rules.filter((r) => r.status === 'DRAFT').length;
		const alertsFired7d = rules
			.filter((r) => r.kind === 'ALERT' && r.status === 'ACTIVE')
			.reduce((sum, r) => sum + r.stats.firedLast7Days, 0);
		const recognitionsSent7d = rules
			.filter((r) => r.kind === 'RECOGNITION' && r.status === 'ACTIVE')
			.reduce((sum, r) => sum + r.stats.firedLast7Days, 0);

		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const badgesAwarded30d = badges.reduce((sum, b) => {
			const awardedInPeriod = b.holders.filter((h) => new Date(h.earnedAt) >= thirtyDaysAgo).length;
			return sum + awardedInPeriod;
		}, 0);

		return { active, paused, drafts, alertsFired7d, recognitionsSent7d, badgesAwarded30d };
	}, [rules, badges]);

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='lg'>
			<StatCard
				title={t('kpis.activeRules')}
				value={stats.active}
				subtitle={t('kpis.activeRulesSubtitle', {
					paused: stats.paused,
					drafts: stats.drafts,
				})}
				icon={
					<ThemeIcon variant='light' size='lg' color='blue' radius='md'>
						<IconBell size={18} />
					</ThemeIcon>
				}
			/>
			<StatCard
				title={t('kpis.alertsFired')}
				value={stats.alertsFired7d}
				icon={
					<ThemeIcon variant='light' size='lg' color='orange' radius='md'>
						<IconAlertTriangle size={18} />
					</ThemeIcon>
				}
			/>
			<StatCard
				title={t('kpis.recognitionsSent')}
				value={stats.recognitionsSent7d}
				icon={
					<ThemeIcon variant='light' size='lg' color='green' radius='md'>
						<IconSparkles size={18} />
					</ThemeIcon>
				}
			/>
			<StatCard
				title={t('kpis.badgesAwarded')}
				value={stats.badgesAwarded30d}
				icon={
					<ThemeIcon variant='light' size='lg' color='grape' radius='md'>
						<IconAward size={18} />
					</ThemeIcon>
				}
			/>
		</SimpleGrid>
	);
};

export default TriggersKpiStrip;
