import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface ChartCardProps {
	title: ReactNode;
	description?: ReactNode;
	/** Selects and toggles that scope this card. */
	controls?: ReactNode;
	footer?: ReactNode;
	/** Shows the empty message instead of the content. */
	empty?: boolean;
	children: ReactNode;
}

/** One chart or table on a quiet card: title, optional controls, footer and an empty state. */
export default function ChartCard({
	title,
	description,
	controls,
	footer,
	empty = false,
	children,
}: ChartCardProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	return (
		<SectionCard
			padding='md'
			title={title}
			description={description}
			headerActions={controls}
			footer={footer}
			fullHeight
		>
			{empty ? (
				<Text size='sm' c='dimmed' ta='center' py='xl'>
					{t('charts.empty')}
				</Text>
			) : (
				children
			)}
		</SectionCard>
	);
}
