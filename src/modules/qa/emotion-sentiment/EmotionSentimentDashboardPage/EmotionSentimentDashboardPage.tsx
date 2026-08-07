import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useTranslation } from 'react-i18next';
import TimeRangeControl from './components/TimeRangeControl';
import { EmotionSentimentLayout } from './EmotionSentimentLayout';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';
import type { EmotionSentimentSubsection } from '~/stores/emotionSentimentFilterStore';

export default function EmotionSentimentDashboardPage() {
	const { t } = useTranslation('qa.emotionSentiment');
	const location = useLocation();
	const setActiveSubsection = useEmotionSentimentFilterStore(
		(state) => state.setActiveSubsection
	);

	// Sync URL path with store state: /workspace/emotion-sentiment/predictive -> 'predictive'
	useEffect(() => {
		const pathParts = location.pathname.split('/');
		const subsectionFromUrl = pathParts[pathParts.length - 1];

		const validSubsections: EmotionSentimentSubsection[] = [
			'general',
			'predictive',
			'reports',
			'benchmarking',
			'notifications',
		];

		if (validSubsections.includes(subsectionFromUrl as EmotionSentimentSubsection)) {
			setActiveSubsection(subsectionFromUrl as EmotionSentimentSubsection);
		} else {
			setActiveSubsection('general');
		}
	}, [location.pathname, setActiveSubsection]);

	return (
		<ContentContainer
			contentWidth='full'
			description={t('description')}
			title={t('title')}
			titleRight={<TimeRangeControl />}
		>
			<EmotionSentimentLayout />
		</ContentContainer>
	);
}
