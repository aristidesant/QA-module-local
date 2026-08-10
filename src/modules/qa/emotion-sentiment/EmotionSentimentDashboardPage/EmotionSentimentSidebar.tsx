import { Stack, NavLink } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconTrendingUp,
	IconFileText,
	IconChartBar,
	IconBell,
	IconMicrophone,
} from '@tabler/icons-react';
import {
	useEmotionSentimentFilterStore,
	type EmotionSentimentSubsection,
} from '~/stores/emotionSentimentFilterStore';

const subsectionConfig: Array<{
	id: EmotionSentimentSubsection;
	icon: React.ReactNode;
	labelKey: string;
}> = [
	{
		id: 'general',
		icon: <IconTrendingUp size={18} />,
		labelKey: 'sidebar.general',
	},
	{
		id: 'predictive',
		icon: <IconTrendingUp size={18} />,
		labelKey: 'sidebar.predictive',
	},
	{
		id: 'reports',
		icon: <IconFileText size={18} />,
		labelKey: 'sidebar.reports',
	},
	{
		id: 'benchmarking',
		icon: <IconChartBar size={18} />,
		labelKey: 'sidebar.benchmarking',
	},
	{
		id: 'notifications',
		icon: <IconBell size={18} />,
		labelKey: 'sidebar.notifications',
	},
	{
		id: 'calls',
		icon: <IconMicrophone size={18} />,
		labelKey: 'sidebar.calls',
	},
];

export function EmotionSentimentSidebar() {
	const { t } = useTranslation('qa.emotionSentiment');
	const activeSubsection = useEmotionSentimentFilterStore(
		(state) => state.activeSubsection
	);
	const setActiveSubsection = useEmotionSentimentFilterStore(
		(state) => state.setActiveSubsection
	);

	return (
		<Stack gap={0}>
			{subsectionConfig.map((item) => (
				<NavLink
					key={item.id}
					label={t(item.labelKey)}
					leftSection={item.icon}
					active={activeSubsection === item.id}
					onClick={() => setActiveSubsection(item.id)}
					variant='light'
				/>
			))}
		</Stack>
	);
}
