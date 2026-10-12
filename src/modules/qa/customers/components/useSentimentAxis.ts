import { useTranslation } from 'react-i18next';

/** The 1-5 sentiment scale and the dashboard band that names each step. */
const SENTIMENT_SCALE = [
	{ score: 1, band: 'veryNegative' },
	{ score: 2, band: 'negative' },
	{ score: 3, band: 'neutral' },
	{ score: 4, band: 'positive' },
	{ score: 5, band: 'veryPositive' },
] as const;

/** Y-axis props for a 1-5 sentiment chart: every step carries the name of the sentiment it stands for. */
export function useSentimentAxis() {
	const { t } = useTranslation('qa.dashboard');
	return {
		domain: [1, 5] as [number, number],
		ticks: SENTIMENT_SCALE.map((s) => s.score),
		tickFormatter: (value: number) => {
			const step = SENTIMENT_SCALE.find((s) => s.score === value);
			return step
				? `${value} · ${t(`sentimentBands.${step.band}`)}`
				: String(value);
		},
		width: 130,
	};
}
