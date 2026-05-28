import React, { useState } from 'react';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDuplicateAgent } from '~/queries/agentQueries';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import { useTranslation } from 'react-i18next';

interface CloneAgentModalProps {
	agent: AgentWithCampaignListItem;
	campaignId: number;
	onSuccess: () => void;
}

const CloneAgentModal: React.FC<CloneAgentModalProps> = ({
	agent,
	campaignId,
	onSuccess,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const duplicateMutation = useDuplicateAgent();

	const isLoading = isSubmitting || duplicateMutation.isPending;

	const form = useForm({
		initialValues: {
			name: `${agent.name} ${t('form.agent.add.copySuffix')}`,
		},
		validate: {
			name: (value) => {
				const trimmed = value.trim();
				if (trimmed.length < 1) return t('form.agent.add.cloneNameRequired');
				if (trimmed === agent.name)
					return t('form.agent.add.cloneNameDifferent');
				return null;
			},
		},
	});

	const handleSubmit = async (values: { name: string }) => {
		setIsSubmitting(true);
		try {
			await duplicateMutation.mutateAsync({
				agentId: agent.id,
				data: {
					name: values.name.trim(),
					campaignId,
				},
			});
			modals.close('clone-agent-modal');
			notifications.show({
				title: t('common:status.success'),
				message: t('form.agent.add.cloneSuccess'),
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			let apiMessage = t('form.agent.add.cloneError');
			if (isAxiosError(error)) {
				apiMessage = error.response?.data?.message || apiMessage;
			}
			notifications.show({
				title: t('form.agent.add.error'),
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
					{t('form.agent.add.cloneDesc')}
				</Text>
				<TextInput
					label={t('form.agent.add.cloneNameLabel')}
					placeholder={t('form.agent.add.cloneNamePlaceholder')}
					{...form.getInputProps('name')}
					disabled={isLoading}
				/>
				{duplicateMutation.error && (
					<Text size='sm' c='red'>
						{isAxiosError(duplicateMutation.error)
							? duplicateMutation.error.response?.data?.message ||
								t('form.agent.add.cloneError')
							: t('form.agent.add.cloneError')}
					</Text>
				)}
				<div
					style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
				>
					<Button
						variant='default'
						onClick={() => modals.close('clone-agent-modal')}
						disabled={isLoading}
					>
						{t('form.agent.add.cancel')}
					</Button>
					<Button type='submit' loading={isLoading}>
						{t('form.agent.add.cloneAction')}
					</Button>
				</div>
			</Stack>
		</form>
	);
};

export default CloneAgentModal;
