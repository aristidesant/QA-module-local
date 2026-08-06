import { Stack, Flex, Box } from '@mantine/core';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';
import { EmotionSentimentSidebar } from './EmotionSentimentSidebar';
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

	return (
		<Flex gap='md' align='flex-start' direction={{ base: 'column', sm: 'row' }}>
			{/* inline-style-allow: */}
			<Box w={{ base: '100%', sm: 250 }} style={{ flexShrink: 0 }}>
				<EmotionSentimentSidebar />
			</Box>
			{/* inline-style-allow: */}
			<Stack gap='md' style={{ flex: 1, minWidth: 0 }}>
				{renderContent()}
			</Stack>
		</Flex>
	);
}
