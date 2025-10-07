import React from 'react';
import { Modal, TextInput, Button, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDuplicateAgent } from '~/queries/agentQueries';

interface DuplicateAgentModalProps {
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
	originalName: string;
	agentId: string;
}

const DuplicateAgentModal: React.FC<DuplicateAgentModalProps> = ({
	opened,
	onClose,
	onSuccess,
	originalName,
	agentId,
}) => {
	const duplicateMutation = useDuplicateAgent();

	const form = useForm({
		initialValues: {
			name: `${originalName} Copy`,
		},
		validate: {
			name: (value) => {
				const trimmed = value.trim();
				if (trimmed.length < 1) return 'Name is required';
				if (trimmed === originalName)
					return 'The new name must be different from the original agent name';
				return null;
			},
		},
	});

	const getErrorMessage = () => {
		if (!duplicateMutation.error) return null;

		// Handle Axios error
		const error = duplicateMutation.error as any;
		if (error.response?.data?.message) {
			return error.response.data.message;
		}

		// Fallback to generic message
		return 'Failed to duplicate agent. Please try again.';
	};

	const handleSubmit = async (values: { name: string }) => {
		try {
			await duplicateMutation.mutateAsync({
				agentId,
				data: { name: values.name.trim() },
			});
			onSuccess();
			handleClose();
		} catch (error) {
			// Error is handled by displaying it in the modal
			console.error('Duplicate agent error:', error);
		}
	};

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title='Duplicate Agent'
			size='md'
			centered
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						Enter a new name for the duplicated agent.
					</Text>
					<TextInput
						label='Agent Name'
						placeholder='Enter agent name'
						{...form.getInputProps('name')}
						disabled={duplicateMutation.isPending}
					/>
					{getErrorMessage() && (
						<Text size='sm' c='red'>
							{getErrorMessage()}
						</Text>
					)}
					<Group justify='flex-end' gap='sm'>
						<Button
							variant='default'
							onClick={handleClose}
							disabled={duplicateMutation.isPending}
						>
							Cancel
						</Button>
						<Button type='submit' loading={duplicateMutation.isPending}>
							Duplicate
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default DuplicateAgentModal;
