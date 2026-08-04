import { Select } from '@mantine/core';
import type { FC } from 'react';

export const EVALUATION_TYPES = [
	'QA Evaluation',
	'Sentiment Analysis',
	'Compliance',
	'Business Insight',
] as const;

export type EvaluationType = (typeof EVALUATION_TYPES)[number];

interface EvaluationTypeSelectProps {
	value?: EvaluationType;
	onChange?: (value: EvaluationType) => void;
}

const EvaluationTypeSelect: FC<EvaluationTypeSelectProps> = ({
	value = EVALUATION_TYPES[0],
	onChange,
}) => {
	return (
		<Select
			label='Evaluation Type'
			data={EVALUATION_TYPES}
			value={value}
			onChange={(val) => onChange?.(val as EvaluationType)}
			maw={280}
			allowDeselect={false}
		/>
	);
};

export default EvaluationTypeSelect;
