import React from 'react';
import { SegmentedControl, SegmentedControlProps } from '@mantine/core';
import styles from './AppSegmentedControl.module.css';

type AppSegmentedControlProps = SegmentedControlProps;

const AppSegmentedControl: React.FC<AppSegmentedControlProps> = (props) => {
	return (
		<SegmentedControl
			{...props}
			classNames={{
				root: styles.segmentedRoot,
				label: styles.segmentedLabel,
				control: styles.segmentedControl,
				indicator: styles.segmentedIndicator,
				...props.classNames,
			}}
		/>
	);
};

export default AppSegmentedControl;
