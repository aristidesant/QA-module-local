import React from 'react';
import {
	Modal,
	Stack,
	TextInput,
	Textarea,
	Button,
	Group,
	Select,
	Text,
	Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { usePromptHistoryStore } from '../usePromptHistoryStore';
import { useUpdatePrompt } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import type { Prompt } from '~/models/PromptModel';
import styles from './EditPromptModal.module.css';

interface EditPromptFormValues {
	name: string;
	status: string;
	agent_goal: string;
	agent_role: string;
	key_messages: string;
	target_audience: string;
	communication_tone: string;
	financial_product_type: string;
}

export const EditPromptModal: React.FC = () => {
	const { editModalOpened, selectedPrompt, closeEditModal } =
		usePromptHistoryStore();
	const { mutateAsync: updatePrompt, isPending } = useUpdatePrompt();

	const form = useForm<EditPromptFormValues>({
		initialValues: {
			name: '',
			status: 'ACTIVE',
			agent_goal: '',
			agent_role: '',
			key_messages: '',
			target_audience: '',
			communication_tone: '',
			financial_product_type: '',
		},
		validate: {
			name: (value) => (!value.trim() ? 'Name is required' : null),
			agent_goal: (value) => (!value.trim() ? 'Agent goal is required' : null),
			agent_role: (value) => (!value.trim() ? 'Agent role is required' : null),
		},
	});

	// Update form when selectedPrompt changes
	React.useEffect(() => {
		if (selectedPrompt) {
			form.setValues({
				name: selectedPrompt.name || '',
				status: selectedPrompt.status || 'ACTIVE',
				agent_goal: selectedPrompt.generationInput?.agent_goal || '',
				agent_role: selectedPrompt.generationInput?.agent_role || '',
				key_messages: selectedPrompt.generationInput?.key_messages || '',
				target_audience: selectedPrompt.generationInput?.target_audience || '',
				communication_tone:
					selectedPrompt.generationInput?.communication_tone || '',
				financial_product_type:
					selectedPrompt.generationInput?.financial_product_type || '',
			});
		}
	}, [selectedPrompt]);

	const handleSubmit = async (values: EditPromptFormValues) => {
		if (!selectedPrompt) return;

		try {
			const updateData: Partial<Prompt> = {
				name: values.name,
				status: values.status,
				generationInput: {
					agent_goal: values.agent_goal,
					agent_role: values.agent_role,
					key_messages: values.key_messages,
					target_audience: values.target_audience,
					communication_tone: values.communication_tone,
					financial_product_type: values.financial_product_type,
				},
			};

			await updatePrompt({
				id: String(selectedPrompt.id),
				data: updateData,
			});

			notifications.show({
				title: 'Success!',
				message: 'Prompt updated successfully',
				color: 'green',
			});

			closeEditModal();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to update prompt',
				color: 'red',
			});
		}
	};

	const handleClose = () => {
		form.reset();
		closeEditModal();
	};

	if (!selectedPrompt) return null;

	return (
		<Modal
			opened={editModalOpened}
			onClose={handleClose}
			title={`Edit Prompt: ${selectedPrompt.name}`}
			size='lg'
			closeOnClickOutside={!isPending}
			closeOnEscape={!isPending}
		>
			<div className={styles.formContainer}>
				<Text size='sm' c='dimmed' mb='md'>
					Update the prompt details and generation input parameters below.
				</Text>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap='md'>
						{/* Basic Information */}
						<TextInput
							label='Name'
							required
							{...form.getInputProps('name')}
							disabled={isPending}
						/>

						<Select
							label='Status'
							required
							data={[
								{ value: 'ACTIVE', label: 'Active' },
								{ value: 'INACTIVE', label: 'Inactive' },
							]}
							{...form.getInputProps('status')}
							disabled={isPending}
						/>

						<Divider
							label='Generation Input Parameters'
							labelPosition='center'
							my='md'
						/>

						{/* Generation Input Fields */}
						<TextInput
							label='Agent Goal'
							required
							{...form.getInputProps('agent_goal')}
							disabled={isPending}
						/>

						<TextInput
							label='Agent Role'
							required
							{...form.getInputProps('agent_role')}
							disabled={isPending}
						/>

						<Textarea
							label='Key Messages'
							rows={3}
							{...form.getInputProps('key_messages')}
							disabled={isPending}
						/>

						<TextInput
							label='Target Audience'
							{...form.getInputProps('target_audience')}
							disabled={isPending}
						/>

						<TextInput
							label='Communication Tone'
							{...form.getInputProps('communication_tone')}
							disabled={isPending}
						/>

						<TextInput
							label='Financial Product Type'
							{...form.getInputProps('financial_product_type')}
							disabled={isPending}
						/>

						<Group justify='flex-end' mt='md' className={styles.buttonGroup}>
							<Button
								variant='subtle'
								onClick={handleClose}
								disabled={isPending}
								leftSection={<IconX size={16} />}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								loading={isPending}
								leftSection={<IconDeviceFloppy size={16} />}
								className={styles.submitButton}
							>
								Update Prompt
							</Button>
						</Group>
					</Stack>
				</form>
			</div>
		</Modal>
	);
};
