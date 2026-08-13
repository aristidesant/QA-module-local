import React from 'react';
import { NumberInput, Group, Stack, Text } from '@mantine/core';

interface ScoreRangeFilterProps {
	minScore: number | '';
	maxScore: number | '';
	onMinScoreChange: (value: number | '') => void;
	onMaxScoreChange: (value: number | '') => void;
}

const ScoreRangeFilter: React.FC<ScoreRangeFilterProps> = ({
	minScore,
	maxScore,
	onMinScoreChange,
	onMaxScoreChange,
}) => {
	const handleMinChange = (val: number | string | null) => {
		if (val === null || val === '') {
			onMinScoreChange('');
		} else if (typeof val === 'number') {
			onMinScoreChange(val);
		}
	};

	const handleMaxChange = (val: number | string | null) => {
		if (val === null || val === '') {
			onMaxScoreChange('');
		} else if (typeof val === 'number') {
			onMaxScoreChange(val);
		}
	};

	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Score Range
			</Text>
			<Group grow>
				<NumberInput
					label='Minimum'
					placeholder='Start value'
					value={minScore}
					onChange={handleMinChange}
					min={0}
					max={100}
				/>
				<NumberInput
					label='Maximum'
					placeholder='Limit value'
					value={maxScore}
					onChange={handleMaxChange}
					min={0}
					max={100}
				/>
			</Group>
		</Stack>
	);
};

export default ScoreRangeFilter;
