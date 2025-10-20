import React from 'react';
import { useForm } from '@mantine/form';
import {
	Button,
	TextInput,
	Text,
	Stack,
	ThemeIcon,
	Title,
} from '@mantine/core';
import { IconPhone, IconX, IconStars } from '@tabler/icons-react';
import type AgentListObject from '~/models/AgentListObject';
import { useStartDemoConversation } from '~/queries/conversationsQueries';
import { notifications } from '@mantine/notifications';

export type OutboundCallFormValues = {
	agentId: string;
	phoneNumber: string;
	campaignId?: number;
	dynamicVariables: {
		customerName: string;
		customerId: string;
	};
};

export type OutboundCallFormProps = {
	agent: AgentListObject;
	onSuccess: () => void;
	onClose: () => void;
	loading?: boolean;
	campaignId?: number;
};

export const OutboundCallForm: React.FC<OutboundCallFormProps> = ({
	agent,
	campaignId,
	onSuccess,
	onClose,
	loading = false,
}) => {
	const startDemoConversation = useStartDemoConversation();
	const isSubmitting = startDemoConversation.isPending || loading;
	const form = useForm<OutboundCallFormValues>({
		initialValues: {
			agentId: agent?.id,
			phoneNumber: '',
			campaignId: campaignId,
			dynamicVariables: {
				customerName: '',
				customerId: '',
			},
		},
		validate: {
			agentId: (value) => (!value ? 'Agent is required' : null),
			phoneNumber: (value) => {
				// Must start with +1, then 809, 829, or 849, then 7 digits
				if (!/^\+1(809|829|849)\d{7}$/.test(value)) {
					return 'Enter a valid number: +1 followed by 809, 829, or 849 and 7 digits (e.g., +18093336600)';
				}
				return null;
			},
			...(campaignId && {
				campaignId: (value: number | undefined) =>
					!value ? 'Campaign is required' : null,
			}),
			dynamicVariables: {
				customerName: (value: string) =>
					!value ? 'Customer name is required' : null,
				customerId: (value: string) =>
					!value ? 'Customer identifier is required' : null,
			},
		},
	});

	const handleSubmit = async (values: OutboundCallFormValues) => {
		try {
			await startDemoConversation.mutateAsync({
				agentId: agent.id,
				phoneNumber: `${values.phoneNumber}`,
				...(values.campaignId && { campaignId: values.campaignId }),
				dynamicVariables: {
					customerName: values.dynamicVariables.customerName,
					customerId: values.dynamicVariables.customerId,
				},
			});
			notifications.show({
				title: 'Test Call Sent',
				message: `A test call has been sent to ${values.phoneNumber}.`,
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to start demo conversation. Please try again.',
				color: 'red',
			});
			console.error('Error starting demo conversation:', error);
		}
	};

	const isValid = form.isValid();

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} autoComplete='off'>
			<Stack justify='center'>
				<Stack align='center'>
					<ThemeIcon radius={'lg'} variant='light' size={100}>
						<IconStars size={60} />
					</ThemeIcon>
					<Title order={5}>Agent Call</Title>
					<Text ta={'center'} c='dimmed' size='sm'>
						Experience a live call from your AI agent. Enter your phone number
						and receive a demo to hear how your setup sounds in real
						conversation.
					</Text>
				</Stack>
				<TextInput
					placeholder='+18093336600'
					size='lg'
					variant='filled'
					radius={'md'}
					maxLength={13}
					type='tel'
					flex={1}
					inputMode='numeric'
					autoComplete='off'
					{...form.getInputProps('phoneNumber')}
				/>
				<TextInput
					label='Customer Name'
					placeholder='Lucas'
					size='lg'
					variant='filled'
					radius={'md'}
					{...form.getInputProps('dynamicVariables.customerName')}
				/>
				<TextInput
					label='Customer ID'
					placeholder='1234'
					size='lg'
					variant='filled'
					radius={'md'}
					{...form.getInputProps('dynamicVariables.customerId')}
				/>
				<Button
					type='submit'
					size='lg'
					radius='md'
					leftSection={<IconPhone size={20} />}
					fullWidth
					disabled={!isValid || isSubmitting}
					loading={isSubmitting}
				>
					{isSubmitting ? 'Calling...' : 'Request Demo Call'}
				</Button>
				<Button
					variant='transparent'
					color='blue'
					size='lg'
					leftSection={<IconX size={18} />}
					onClick={onClose}
					type='button'
				>
					Cancel
				</Button>
			</Stack>
		</form>
	);
};
