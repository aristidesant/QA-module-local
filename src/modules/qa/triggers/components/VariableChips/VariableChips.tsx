import { Badge, Group } from '@mantine/core';
import { TEMPLATE_VARIABLES } from '~/modules/qa/triggers/constants';

interface VariableChipsProps {
	onInsert: (variable: string) => void;
}

export function VariableChips({ onInsert }: VariableChipsProps) {

	return (
		<Group gap={4}>
			{TEMPLATE_VARIABLES.map((variable) => (
				<Badge
					key={variable}
					variant='outline'
					component='button'
					type='button'
					onClick={() => onInsert(variable)}
					style={{ cursor: 'pointer' }}
				>
					{`{{${variable}}}`}
				</Badge>
			))}
		</Group>
	);
}
