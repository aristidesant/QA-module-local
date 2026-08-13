import React from 'react';
import { Chip, Group, Stack, Text } from '@mantine/core';
import { AnalysisType } from '../../../types/analyticsTypes';

interface AnalysisTypeSelectorProps {
	value: AnalysisType;
	onChange: (value: AnalysisType) => void;
}

const ANALYSIS_TYPES = [
	{ value: 'qa' as AnalysisType, label: 'QA Analysis' },
	{ value: 'emotion' as AnalysisType, label: 'Emotion & Sentiment' },
	{ value: 'compliance' as AnalysisType, label: 'Compliance' },
	{ value: 'behavioral' as AnalysisType, label: 'Behavioral Analysis' },
];

const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
	value,
	onChange,
}) => {
	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Select Analysis Type
			</Text>
			<Chip.Group
				value={value}
				onChange={(val) => onChange(val as AnalysisType)}
				multiple={false}
			>
				<Group gap='sm'>
					{ANALYSIS_TYPES.map((type) => (
						<Chip key={type.value} value={type.value} variant='light' size='md'>
							{type.label}
						</Chip>
					))}
				</Group>
			</Chip.Group>
		</Stack>
	);
};

export default AnalysisTypeSelector;
