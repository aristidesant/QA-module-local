import React, { useState } from 'react';
import { Select } from '@mantine/core';

const EVALUATION_TYPES = [
	'QA Evaluation',
	'Sentiment Analysis',
	'Compliance',
	'Business Insight',
];

const EvaluationTypeSelect: React.FC = () => {
	const [value, setValue] = useState<string | null>(EVALUATION_TYPES[0]);

	return (
		<Select
			label='Evaluation Type'
			data={EVALUATION_TYPES}
			value={value}
			onChange={setValue}
			maw={280}
			allowDeselect={false}
		/>
	);
};

export default EvaluationTypeSelect;
