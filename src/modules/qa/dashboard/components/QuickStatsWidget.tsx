import React from 'react';
import { Stack, SimpleGrid, Text, Paper } from '@mantine/core';

/**
 * Convert camelCase to Title Case
 * Example: totalCalls -> Total Calls
 */
const camelCaseToTitle = (str: string): string => {
	return str
		.replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
		.replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
		.trim();
};

interface QuickStatsWidgetProps {
	/**
	 * Generic data object with string keys and string/number values
	 * Keys will be auto-formatted from camelCase to Title Case
	 */
	data: Record<string, string | number>;
	/** Optional title for the widget */
	title?: string;
}

/**
 * QuickStatsWidget
 *
 * Displays key metrics in a responsive grid format.
 * - 2 columns on base
 * - 3 columns on sm (640px)
 * - 4 columns on md (768px)
 *
 * Keys are auto-formatted from camelCase to readable labels.
 * Numeric values are displayed in bold.
 *
 * @example
 * <QuickStatsWidget
 *   data={AGENT_QUICK_STATS}
 *   title="Quick Stats"
 * />
 */
export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ data, title }) => {
	const entries = Object.entries(data);

	return (
		<Stack gap="md">
			{title && (
				<Text fw={600} size="lg">
					{title}
				</Text>
			)}
			<SimpleGrid
				cols={{ base: 2, sm: 3, md: 4 }}
				spacing="md"
			>
				{entries.map(([key, value]) => (
					<Paper key={key} p="md" radius="md" withBorder>
						<Stack gap="xs">
							<Text size="sm" c="dimmed" fw={500}>
								{camelCaseToTitle(key)}
							</Text>
							<Text fw={700} size="lg">
								{value}
							</Text>
						</Stack>
					</Paper>
				))}
			</SimpleGrid>
		</Stack>
	);
};

export default QuickStatsWidget;
