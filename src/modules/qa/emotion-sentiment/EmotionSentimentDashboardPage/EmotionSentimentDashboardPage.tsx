import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useTranslation } from 'react-i18next';
import TimeRangeControl from './components/TimeRangeControl';
import { EmotionSentimentLayout } from './EmotionSentimentLayout';

export default function EmotionSentimentDashboardPage() {
	const { t } = useTranslation('qa.emotionSentiment');

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
