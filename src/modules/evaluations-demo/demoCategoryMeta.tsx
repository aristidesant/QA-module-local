import type { ReactNode } from 'react';
import { IconMoodSmile, IconShield, IconTrendingUp } from '@tabler/icons-react';
import type { DemoCategory } from './mockData';

export const DEMO_CATEGORY_ICONS: Record<DemoCategory, ReactNode> = {
	'Business Insight': <IconTrendingUp size={16} />,
	Sentiment: <IconMoodSmile size={16} />,
	Compliance: <IconShield size={16} />,
};

export const DEMO_CATEGORY_COLORS: Record<DemoCategory, string> = {
	'Business Insight': 'blue',
	Sentiment: 'grape',
	Compliance: 'teal',
};

export const DEMO_CATEGORY_LABELS: Record<DemoCategory, string> = {
	'Business Insight': 'Business Insights',
	Sentiment: 'Sentiment Analysis',
	Compliance: 'Compliance',
};
