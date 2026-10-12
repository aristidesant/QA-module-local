import type { ReactNode } from 'react';
import { Stack, Text } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { CustomerProfile } from '../types';
import { NPS_DETRACTOR_MAX } from '../constants';
import { ReceptivenessGauge } from '../components/ReceptivenessGauge';
import { npsBand, windowHours, windowLabel } from '../helpers';
import styles from './HealthStrip.module.css';

/** Red text is the only colour here, and only for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';

interface TileProps {
	label: string;
	value: string;
	alert?: boolean;
	children?: ReactNode;
}

function Tile({ label, value, alert, children }: TileProps) {
	return (
		<div className={styles.tile}>
			<Caption>{label}</Caption>
			<Text fw={700} size='xl' lh={1.1} c={alert ? ALERT : undefined}>
				{value}
			</Text>
			{children}
		</div>
	);
}

interface HealthStripProps {
	profile: CustomerProfile;
}

/** Receptiveness on the left; churn, sentiment, NPS and the best window beside it; one verdict line under. */
export function HealthStrip({ profile }: HealthStripProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, bestWindows, sentimentSeries } = profile;
	const lowSentiment =
		useSettingsStore(selectThresholds).sentiment.lowSentimentIncident;
	const nps = kpis.npsLatest !== undefined ? npsBand(kpis.npsLatest) : null;
	const best = bestWindows[0];
	const lowSentimentNow = kpis.avgCustomerSentiment < lowSentiment;

	const concerns = [
		kpis.receptivenessBand === 'resistant' &&
			t('header.verdict.items.resistant'),
		kpis.churnRisk === 'high' && t('header.verdict.items.churn'),
		nps?.label === 'detractor' && t('header.verdict.items.nps'),
		lowSentimentNow && t('header.verdict.items.sentiment'),
	].filter((x): x is string => Boolean(x));

	return (
		<Stack gap='sm'>
			<div className={styles.strip}>
				<div className={styles.gauge}>
					<ReceptivenessGauge
						score={kpis.receptivenessScore}
						band={kpis.receptivenessBand}
						size={88}
					/>
				</div>
				<div className={styles.tiles}>
					<Tile
						label={t('header.churn')}
						value={t(`churn.${kpis.churnRisk}`)}
						alert={kpis.churnRisk === 'high'}
					/>
					<Tile
						label={t('header.strip.sentiment')}
						value={`${kpis.avgCustomerSentiment.toFixed(1)}/5`}
						alert={lowSentimentNow}
					>
						<Sparkline
							h={24}
							data={sentimentSeries.map((p) => p.customer)}
							color={lowSentimentNow ? 'red.6' : 'gray.6'}
							fillOpacity={0.12}
							strokeWidth={1.5}
							curveType='monotone'
						/>
						<TrendDelta
							delta={kpis.sentimentDelta}
							trend={kpis.sentimentTrend}
							unit='/5'
							suffix={t('common.vsFirst')}
						/>
					</Tile>
					<Tile
						label={t('header.nps')}
						value={kpis.npsLatest !== undefined ? String(kpis.npsLatest) : '—'}
						alert={
							kpis.npsLatest !== undefined &&
							kpis.npsLatest <= NPS_DETRACTOR_MAX
						}
					>
						<Text size='xs' c='dimmed'>
							{nps ? t(`surveys.band.${nps.label}`) : t('header.strip.npsNone')}
						</Text>
					</Tile>
					<Tile
						label={t('header.bestWindow')}
						value={best ? windowLabel(best, t) : '—'}
					>
						{best && (
							<Text size='xs' c='dimmed'>
								{windowHours(best)} ·{' '}
								{t('header.strip.windowStats', {
									accepted: best.accepted,
									contacts: best.contacts,
								})}
							</Text>
						)}
					</Tile>
				</div>
			</div>
			<Text size='sm' c={concerns.length ? undefined : 'dimmed'}>
				{concerns.length
					? t('header.verdict.attention', { items: concerns.join(', ') })
					: t('header.verdict.ok')}
			</Text>
		</Stack>
	);
}
