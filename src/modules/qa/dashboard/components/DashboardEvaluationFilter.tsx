import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';

export type DashboardEvaluationType =
	| 'all'
	| 'qa'
	| 'sentiment'
	| 'compliance'
	| 'business';

const OPTION_ORDER: DashboardEvaluationType[] = [
	'all',
	'qa',
	'sentiment',
	'compliance',
	'business',
];

/** A card stays at full opacity when the active filter covers any of its aspects. */
export const isCardVisible = (
	filter: DashboardEvaluationType,
	cardTypes: DashboardEvaluationType | DashboardEvaluationType[]
): boolean => {
	if (filter === 'all') return true;
	const types = Array.isArray(cardTypes) ? cardTypes : [cardTypes];
	return types.includes(filter);
};

interface DashboardEvaluationFilterProps {
	value: DashboardEvaluationType;
	onChange: (value: DashboardEvaluationType) => void;
}

/**
 * Shared evaluation-type filter for the four role dashboards. Selecting an
 * aspect dims the widgets that do not speak to it instead of unmounting them,
 * so the grid never collapses.
 */
export const DashboardEvaluationFilter: React.FC<
	DashboardEvaluationFilterProps
> = ({ value, onChange }) => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<div>
			<Text size='sm' fw={500} mb='xs'>
				{t('evaluationFilter.label')}
			</Text>
			<AppSegmentedControl
				value={value}
				onChange={(next) => onChange(next as DashboardEvaluationType)}
				data={OPTION_ORDER.map((option) => ({
					label: t(`evaluationFilter.options.${option}`),
					value: option,
				}))}
			/>
		</div>
	);
};

export default DashboardEvaluationFilter;
