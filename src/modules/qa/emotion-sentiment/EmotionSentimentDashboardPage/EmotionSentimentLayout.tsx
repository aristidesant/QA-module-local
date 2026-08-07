import { Stack } from '@mantine/core';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';
import { PredictiveAndPrescriptive } from './subsections/PredictiveAndPrescriptive';
import { Reports } from './subsections/Reports';
import { ComparativeAndBenchmarking } from './subsections/ComparativeAndBenchmarking';
import { Notifications } from './subsections/Notifications';
import GeneralTab from './components/GeneralTab';

export function EmotionSentimentLayout() {
	const activeSubsection = useEmotionSentimentFilterStore(
		(state) => state.activeSubsection
	);

	const renderContent = () => {
		switch (activeSubsection) {
			case 'general':
				return <GeneralTab />;
			case 'predictive':
				return <PredictiveAndPrescriptive />;
			case 'reports':
				return <Reports />;
			case 'benchmarking':
				return <ComparativeAndBenchmarking />;
			case 'notifications':
				return <Notifications />;
			default:
				return <GeneralTab />;
		}
	};

	return <Stack gap='md'>{renderContent()}</Stack>;
}
