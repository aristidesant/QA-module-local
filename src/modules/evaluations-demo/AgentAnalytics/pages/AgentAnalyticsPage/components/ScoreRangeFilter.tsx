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
					onChange={(val) => onMinScoreChange(val || '')}
					min={0}
					max={100}
				/>
				<NumberInput
					label='Maximum'
					placeholder='Limit value'
					value={maxScore}
					onChange={(val) => onMaxScoreChange(val || '')}
					min={0}
					max={100}
				/>
			</Group>
		</Stack>
	);
};

export default ScoreRangeFilter;
