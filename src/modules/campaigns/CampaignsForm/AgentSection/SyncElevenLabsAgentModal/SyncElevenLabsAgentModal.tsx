import React, { useState } from 'react';
import { Button, Group, Radio, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useSyncAgent } from '~/queries/agentQueries';
import type { AgentType } from '~/models/SyncAgentModel';
import classes from './SyncElevenLabsAgentModal.module.css';

export const SYNC_ELEVENLABS_AGENT_MODAL_ID = 'sync-elevenlabs-agent-modal';

interface SyncElevenLabsAgentModalProps {
	campaignId: number;
	onSuccess: () => void;
}

const resolveSyncAgentErrorMessage = (
	error: unknown,
	t: TFunction
) => {
	if (!isAxiosError(error)) {
		return t('form.agent.sync.errors.generic');
	}

	const responseMessage =
		typeof error.response?.data === 'object' && error.response?.data !== null
			? (() => {
					const message = (error.response.data as { message?: unknown }).message;
					return typeof message === 'string' ? message : null;
				})()
			: null;

	switch (error.response?.status) {
		case 400:
			return t('form.agent.sync.errors.nameExists');
		case 409:
			return t('form.agent.sync.errors.alreadySynced');
		case 502:
			return t('form.agent.sync.errors.externalService');
		default:
			return responseMessage || t('form.agent.sync.errors.generic');
	}
};

const SyncElevenLabsAgentModal: React.FC<SyncElevenLabsAgentModalProps> = ({
	campaignId,
	onSuccess,
}) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const syncMutation = useSyncAgent();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isLoading = isSubmitting || syncMutation.isPending;

	const form = useForm({
		initialValues: {
			agentId: '',
			type: 'OUTBOUND' as AgentType,
		},
		validate: {
			agentId: (value) =>
				value.trim().length === 0
					? t('form.agent.sync.validation.agentIdRequired')
					: null,
			type: (value) =>
				value ? null : t('form.agent.sync.validation.typeRequired'),
		},
	});

	const handleSubmit = async (values: {
		agentId: string;
		type: AgentType;
	}) => {
		setIsSubmitting(true);
		try {
			await syncMutation.mutateAsync({
				agentId: values.agentId.trim(),
				campaignId,
				type: values.type,
			});
			modals.close(SYNC_ELEVENLABS_AGENT_MODAL_ID);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('form.agent.sync.successMessage'),
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: resolveSyncAgentErrorMessage(error, t),
				color: 'red',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap='md' className={classes.root}>
				<Text size='sm' c='dimmed' className={classes.description}>
					{t('form.agent.sync.description')}
				</Text>

				<TextInput
					label={t('form.agent.sync.agentId.label')}
					placeholder={t('form.agent.sync.agentId.placeholder')}
					description={t('form.agent.sync.agentId.description')}
					size='sm'
					disabled={isLoading}
					{...form.getInputProps('agentId')}
				/>

				<Radio.Group
					label={t('form.agent.sync.type.label')}
					description={t('form.agent.sync.type.description')}
					size='sm'
					disabled={isLoading}
					{...form.getInputProps('type')}
				>
					<Stack gap={6} className={classes.radioGroup}>
						<Radio
							value='OUTBOUND'
							label={t('form.agent.sync.type.outbound')}
						/>
						<Radio value='INBOUND' label={t('form.agent.sync.type.inbound')} />
					</Stack>
				</Radio.Group>

				<Group justify='flex-end' gap='xs' className={classes.actions}>
					<Button
						variant='default'
						type='button'
						onClick={() => modals.close(SYNC_ELEVENLABS_AGENT_MODAL_ID)}
						disabled={isLoading}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button type='submit' loading={isLoading}>
						{t('form.agent.sync.submit')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default SyncElevenLabsAgentModal;
