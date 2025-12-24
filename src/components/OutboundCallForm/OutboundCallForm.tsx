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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
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
			agentId: (value) =>
				!value ? t('outboundCallForm.validation.agentRequired') : null,
			phoneNumber: (value) => {
				// Must start with +1, then 809, 829, or 849, then 7 digits
				if (!/^\+1(809|829|849)\d{7}$/.test(value)) {
					return t('outboundCallForm.validation.phoneInvalid');
				}
				return null;
			},
			...(campaignId && {
				campaignId: (value: number | undefined) =>
					!value ? t('outboundCallForm.validation.campaignRequired') : null,
			}),
			dynamicVariables: {
				customerName: (value: string) =>
					!value ? t('outboundCallForm.validation.customerNameRequired') : null,
				customerId: (value: string) =>
					!value ? t('outboundCallForm.validation.customerIdRequired') : null,
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
				title: t('outboundCallForm.testCallSentTitle'),
				message: t('outboundCallForm.testCallSentMsg', {
					phone: values.phoneNumber,
				}),
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('outboundCallForm.startDemoErrorTitle'),
				message: t('outboundCallForm.startDemoErrorMsg'),
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
					<Title order={5}>{t('outboundCallForm.agentCallTitle')}</Title>
					<Text ta={'center'} c='dimmed' size='sm'>
						{t('outboundCallForm.agentCallDesc')}
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
					label={t('outboundCallForm.customerName')}
					placeholder='Lucas'
					size='lg'
					variant='filled'
					radius={'md'}
					{...form.getInputProps('dynamicVariables.customerName')}
				/>
				<TextInput
					label={t('outboundCallForm.customerId')}
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
					{isSubmitting
						? t('outboundCallForm.calling')
						: t('outboundCallForm.requestDemo')}
				</Button>
				<Button
					variant='transparent'
					color='blue'
					size='lg'
					leftSection={<IconX size={18} />}
					onClick={onClose}
					type='button'
				>
					{t('common.cancel')}
				</Button>
			</Stack>
		</form>
	);
};
