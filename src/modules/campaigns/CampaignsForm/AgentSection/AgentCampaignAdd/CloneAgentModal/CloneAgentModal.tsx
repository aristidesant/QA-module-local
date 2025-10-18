import React, { useState } from 'react';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDuplicateAgent } from '~/queries/agentQueries';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';

interface CloneAgentModalProps {
	agent: AgentWithCampaignListItem;
	onSuccess: () => void;
}

const CloneAgentModal: React.FC<CloneAgentModalProps> = ({
	agent,
	onSuccess,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const duplicateMutation = useDuplicateAgent();

	const form = useForm({
		initialValues: {
			name: `${agent.name} Copy`,
		},
		validate: {
			name: (value) => {
				const trimmed = value.trim();
				if (trimmed.length < 1) return 'Name is required';
				if (trimmed === agent.name)
					return 'The new name must be different from the original agent name';
				return null;
			},
		},
	});

	const handleSubmit = async (values: { name: string }) => {
		setIsSubmitting(true);
		try {
			await duplicateMutation.mutateAsync({
				agentId: agent.id,
				data: { name: values.name.trim() },
			});
			modals.close('clone-agent-modal');
			notifications.show({
				title: 'Success',
				message: 'Agent cloned successfully',
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			let apiMessage = 'Failed to clone agent';
			if (isAxiosError(error)) {
				apiMessage = error.response?.data?.message || apiMessage;
			}
			notifications.show({
				title: 'Error',
				message: apiMessage,
				color: 'red',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					Enter a new name for the cloned agent.
				</Text>
				<TextInput
					label='Agent Name'
					placeholder='Enter agent name'
					{...form.getInputProps('name')}
					disabled={isSubmitting}
				/>
				{duplicateMutation.error && (
					<Text size='sm' c='red'>
						{isAxiosError(duplicateMutation.error)
							? duplicateMutation.error.response?.data?.message ||
								'Failed to clone agent'
							: 'Failed to clone agent'}
					</Text>
				)}
				<div
					style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
				>
					<Button
						variant='default'
						onClick={() => modals.close('clone-agent-modal')}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type='submit' loading={isSubmitting}>
						Clone
					</Button>
				</div>
			</Stack>
		</form>
	);
};

export default CloneAgentModal;
