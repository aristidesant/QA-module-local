import { useState } from 'react';
import { Button, Group, NumberInput, Stack, Text, Title } from '@mantine/core';

interface ExtendWavesModalProps {
	onSubmit: (wavesToAdd: number) => void | Promise<void>;
	onCancel: () => void;
	loading?: boolean;
	initialValue?: number;
}

const ExtendWavesModal = ({
	onSubmit,
	onCancel,
	loading = false,
	initialValue = 1,
}: ExtendWavesModalProps) => {
	const [waves, setWaves] = useState<number>(initialValue);

	return (
		<Stack gap='md' px='xs' py='sm'>
			<Title order={5} fw={700} size='sm'>
				Add More Waves
			</Title>
			<Text size='sm' c='dimmed'>
				Enter how many additional waves you want to run for this contact list.
			</Text>
			<NumberInput
				label='Additional Waves'
				placeholder='Enter additional waves'
				value={waves}
				onChange={(value) => setWaves(typeof value === 'number' ? value : 1)}
				min={1}
				step={1}
				clampBehavior='strict'
				allowNegative={false}
				allowDecimal={false}
				size='sm'
				withAsterisk
				data-testid='extend-waves-input'
			/>
			<Group justify='flex-end' gap='sm'>
				<Button
					variant='outline'
					size='sm'
					onClick={onCancel}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					size='sm'
					onClick={() => onSubmit(waves)}
					loading={loading}
					disabled={waves < 1}
				>
					Add Waves
				</Button>
			</Group>
		</Stack>
	);
};

export default ExtendWavesModal;
