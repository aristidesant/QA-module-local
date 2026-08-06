import { Stack, Button, Text } from '@mantine/core';
import type { FC } from 'react';
import {
	EVALUATION_TYPES,
	type EvaluationType,
} from '../EvaluationTypeSelect/EvaluationTypeSelect';
import styles from './EvaluationTypeSidebar.module.css';

interface EvaluationTypeSidebarProps {
	value?: EvaluationType;
	onChange?: (value: EvaluationType) => void;
}

const EvaluationTypeSidebar: FC<EvaluationTypeSidebarProps> = ({
	value = EVALUATION_TYPES[0],
	onChange,
}) => {
	return (
		<Stack gap='xs' className={styles.sidebar}>
			{EVALUATION_TYPES.map((type) => (
				<Button
					key={type}
					onClick={() => onChange?.(type)}
					className={styles.sidebarButton}
					data-active={value === type}
					variant={value === type ? 'filled' : 'light'}
					justify='flex-start'
					fullWidth
				>
					<Text size='sm' fw={500}>
						{type}
					</Text>
				</Button>
			))}
		</Stack>
	);
};

export default EvaluationTypeSidebar;
