import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconChartLine } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface TrendTriggerProps {
	onClick: () => void;
}

/** Header affordance of a Performance Score card: opens that aspect's trend modal. */
export const TrendTrigger: React.FC<TrendTriggerProps> = ({ onClick }) => {
	const { t } = useTranslation('qa.dashboard');
	return (
		<Tooltip label={t('metricTrend.view')} withArrow>
			<ActionIcon
				variant='subtle'
				color='gray'
				size='lg'
				radius='md'
				aria-label={t('metricTrend.view')}
				onClick={onClick}
			>
				<IconChartLine size={18} />
			</ActionIcon>
		</Tooltip>
	);
};

export default TrendTrigger;
