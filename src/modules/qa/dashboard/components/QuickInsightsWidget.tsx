import React from 'react';
import { Stack, Group, Text, ThemeIcon, Box } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

/**
 * Insight type for Quick Insights Widget
 */
export interface Insight {
	/** Title/heading of the insight */
	title: string;
	/** Description/details of the insight */
	description: string;
	/** Type of insight: positive (green), warning (yellow), or neutral (blue) */
	type: 'positive' | 'warning' | 'neutral';
}

interface QuickInsightsWidgetProps {
	/** Optional array of insights to display. Uses defaults if not provided. */
	insights?: Insight[];
	/** Optional title for the widget */
	title?: string;
}

/**
 * Default insights to use if none are provided
 */
const DEFAULT_INSIGHTS: Insight[] = [
	{
		title: 'Performance',
		description: 'Your performance is trending positively this week. Keep up the great work!',
		type: 'positive',
	},
	{
		title: 'Efficiency',
		description: 'Focus on improving call handling efficiency.',
		type: 'neutral',
	},
	{
		title: 'Compliance',
		description: 'Consider reviewing compliance procedures.',
		type: 'warning',
	},
];

/**
 * Map insight type to icon
 */
const getIconForType = (type: 'positive' | 'warning' | 'neutral') => {
	switch (type) {
		case 'positive':
			return <IconCheck size={20} />;
		case 'warning':
			return <IconAlertTriangle size={20} />;
		case 'neutral':
			return <IconInfoCircle size={20} />;
	}
};

/**
 * Map insight type to Mantine color
 */
const getColorForType = (type: 'positive' | 'warning' | 'neutral') => {
	switch (type) {
		case 'positive':
			return 'green';
		case 'warning':
			return 'yellow';
		case 'neutral':
			return 'blue';
	}
};

/**
 * QuickInsightsWidget
 *
 * Displays performance recommendations and insights in a list format.
 * Each insight has:
 * - An icon (checkmark for positive, alert for warning, info for neutral)
 * - Color-coded styling (green/yellow/blue)
 * - Title and description
 *
 * If no insights are provided, displays default recommendations.
 *
 * @example
 * <QuickInsightsWidget
 *   insights={[
 *     { title: 'Performance', description: 'Trending up this week', type: 'positive' },
 *     { title: 'Compliance', description: 'Review Q3 procedures', type: 'warning' }
 *   ]}
 * />
 *
 * @example
 * // Without props, uses default insights
 * <QuickInsightsWidget />
 */
export const QuickInsightsWidget: React.FC<QuickInsightsWidgetProps> = ({
	insights = DEFAULT_INSIGHTS,
	title,
}) => {
	return (
		<Stack gap="md">
			{title && (
				<Text fw={600} size="lg">
					{title}
				</Text>
			)}
			<Stack gap="sm">
				{insights.map((insight, index) => {
					const color = getColorForType(insight.type);
					const borderColor = `var(--mantine-color-${color}-6)`;

					return (
						<Box
							key={index}
							style={{
								borderLeft: `4px solid ${borderColor}`,
								paddingLeft: 'var(--mantine-spacing-md)',
			}}
						>
							<Group gap="md" align="flex-start">
								<ThemeIcon
									size="lg"
									color={color}
									radius="md"
									variant="light"
									style={{ marginTop: '2px', flexShrink: 0 }}
								>
									{getIconForType(insight.type)}
								</ThemeIcon>
								<Stack gap="xs" style={{ flex: 1 }}>
									<Text fw={600} size="sm">
										{insight.title}
									</Text>
									<Text size="sm" c="dimmed">
										{insight.description}
									</Text>
								</Stack>
							</Group>
						</Box>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default QuickInsightsWidget;
