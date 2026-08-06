import { Group, Button } from '@mantine/core';
import type { FC } from 'react';
import {
	EVALUATION_TYPES,
	type EvaluationType,
} from '../EvaluationTypeSelect/EvaluationTypeSelect';
import styles from './EvaluationTypePillGroup.module.css';

interface EvaluationTypePillGroupProps {
	value?: EvaluationType;
	onChange?: (value: EvaluationType) => void;
}

const EvaluationTypePillGroup: FC<EvaluationTypePillGroupProps> = ({
	value = EVALUATION_TYPES[0],
	onChange,
}) => {
	return (
		<Group gap='xs' wrap='wrap'>
			{EVALUATION_TYPES.map((type) => (
				<Button
					key={type}
					onClick={() => onChange?.(type)}
					className={styles.pill}
					data-active={value === type}
					variant={value === type ? 'filled' : 'light'}
				>
					{type}
				</Button>
			))}
		</Group>
	);
};

export default EvaluationTypePillGroup;
