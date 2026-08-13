import React from 'react';
import { MultiSelect, Stack, Text } from '@mantine/core';

interface AutofailFilterProps {
	selectedAutofail: string[];
	onAutofailChange: (autofail: string[]) => void;
}

const AUTOFAIL_OPTIONS = ['All', 'Global autofail', 'Section autofail'];

const AutofailFilter: React.FC<AutofailFilterProps> = ({
	selectedAutofail,
	onAutofailChange,
}) => {
	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Include Autofail
			</Text>
			<MultiSelect
				placeholder='Select autofail options'
				data={AUTOFAIL_OPTIONS.map((option) => ({
					value: option,
					label: option,
				}))}
				value={selectedAutofail}
				onChange={onAutofailChange}
				searchable
				clearable
			/>
		</Stack>
	);
};

export default AutofailFilter;
