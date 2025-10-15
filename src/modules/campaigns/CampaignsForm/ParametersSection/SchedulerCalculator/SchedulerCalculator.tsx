import React from 'react';
import { Flex } from '@mantine/core';
import SchedulerForm from './SchedulerForm';
import SchedulerResults from './SchedulerResults';

const SchedulerCalculator: React.FC = () => {
	return (
		<Flex gap='xl'>
			<SchedulerForm />
			<SchedulerResults />
		</Flex>
	);
};

export default SchedulerCalculator;
