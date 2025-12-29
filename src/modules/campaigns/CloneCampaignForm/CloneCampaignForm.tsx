import React, { useState, useEffect } from 'react';
import {
	Button,
	Group,
	TextInput,
	Textarea,
	Paper,
	Text,
	Checkbox,
	Stack,
	Avatar,
	Badge,
	Box,
	Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCloneCampaign } from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import type { Campaign } from '~/models/CampaignsModel';
import styles from './CloneCampaignForm.module.css';
import { IconCopy, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type CloneCampaignFormProps = {
	campaign: Campaign;
	onComplete?: () => void;
};

interface AgentToDuplicate {
	agentId: string;
	newName: string;
	selected: boolean;
	originalName: string;
}

const CloneCampaignForm: React.FC<CloneCampaignFormProps> = ({
	campaign,
	onComplete,
}) => {
	const { t } = useTranslation('campaigns', { keyPrefix: 'cloneCampaignForm' });
	const cloneCampaign = useCloneCampaign();

	const [agentsToDuplicate, setAgentsToDuplicate] = useState<
		AgentToDuplicate[]
	>([]);
	const [validationError, setValidationError] = useState<string | null>(null);

	// Initialize agents from campaign
	useEffect(() => {
		if (campaign.agents) {
			const initialAgents = campaign.agents.map((campaignAgent) => ({
				agentId: campaignAgent.agentId,
				newName: t('copyOf', { name: campaignAgent.agent.name }),
				selected: true,
				originalName: campaignAgent.agent.name,
			}));
			setAgentsToDuplicate(initialAgents);
		}
	}, [campaign.agents, t]);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: t('copyOf', { name: campaign.name }),
			description: campaign.description || '',
		},
		validate: {
			name: (value) => (value.trim().length < 2 ? t('nameRequired') : null),
			description: (value) =>
				value.trim().length < 2 ? t('descriptionRequired') : null,
		},
		validateInputOnChange: true,
	});

	const handleAgentToggle = (index: number, selected: boolean) => {
		setAgentsToDuplicate((prev) =>
			prev.map((agent, i) => (i === index ? { ...agent, selected } : agent))
		);
		setValidationError(null);
	};

	const handleAgentNameChange = (index: number, newName: string) => {
		setAgentsToDuplicate((prev) =>
			prev.map((agent, i) => (i === index ? { ...agent, newName } : agent))
		);
		setValidationError(null);
	};

	const validateAgents = (): string | null => {
		const selectedAgents = agentsToDuplicate.filter((agent) => agent.selected);
		if (selectedAgents.length === 0) {
			return t('atLeastOneAgent');
		}
		for (const agent of selectedAgents) {
			if (!agent.newName.trim()) {
				return t('allAgentsMustHaveName');
			}
		}
		return null;
	};

	/**
	 * Try to extract a human-friendly error message from different error shapes.
	 * Supports Axios-like { response: { data: { message } } } and plain Error objects.
	 */
	const getApiErrorMessage = (error: unknown): string => {
		// Axios-style response body: error.response?.data?.message
		const asAny = error as any;
		if (asAny?.response?.data) {
			// If server returns { message } or { error, message }
			const data = asAny.response.data;
			if (typeof data === 'string') return data;
			if (typeof data.message === 'string') return data.message;
			if (typeof data.error === 'string') return data.error;
			// fallback to JSON string of body
			try {
				return JSON.stringify(data);
			} catch {
				return String(data);
			}
		}

		// Some libraries place body directly: error.data?.message
		if (asAny?.data?.message) return String(asAny.data.message);

		// Default Error instance
		if (error instanceof Error) return error.message;

		// Fallback to string conversion
		return String(error ?? 'Unknown error');
	};

	const selectedAgentsCount = agentsToDuplicate.filter(
		(agent) => agent.selected
	).length;

	const handleSubmit = (values: typeof form.values) => {
		const agentValidationError = validateAgents();
		if (agentValidationError) {
			setValidationError(agentValidationError);
			return;
		}
		setValidationError(null);

		const selectedAgents = agentsToDuplicate
			.filter((agent) => agent.selected)
			.map((agent) => ({
				agentId: agent.agentId,
				newName: agent.newName,
			}));

		cloneCampaign.mutate(
			{
				campaignId: campaign.id.toString(),
				data: {
					name: values.name,
					description: values.description,
					agentsToDuplicate: selectedAgents,
				},
			},
			{
				onSuccess: () => {
					notifications.show({
						title: t('success'),
						message: t('successMessage'),
						color: 'green',
					});
					if (onComplete) {
						onComplete();
					}
				},
				onError: (error) => {
					const message = getApiErrorMessage(error);
					notifications.show({
						title: t('error'),
						message: message || t('errorMessage'),
						color: 'red',
					});
				},
			}
		);
	};

	return (
		<Paper className={styles.formContainer} radius='md' withBorder>
			<Group className={styles.header} gap='xs'>
				<Box className={styles.headerIcon}>
					<IconCopy size={18} stroke={1.7} />
				</Box>
				<div className={styles.headerContent}>
					<Text className={styles.title} fw={600}>
						{t('title')}
					</Text>
					<Text className={styles.subtitle}>{t('adjustDetails')}</Text>
				</div>
				<Badge className={styles.agentBadge} variant='light' size='sm'>
					{selectedAgentsCount}
					{` / ${agentsToDuplicate.length}`} {t('selectedCount')}
				</Badge>
			</Group>

			<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
				<Stack gap='md' className={styles.formFields}>
					<TextInput
						label={t('campaignName')}
						placeholder={t('enterCampaignName')}
						withAsterisk
						className={styles.field}
						key={form.key('name')}
						{...form.getInputProps('name')}
					/>
					<Textarea
						label={t('description')}
						placeholder={t('describeYourCampaign')}
						withAsterisk
						className={styles.field}
						key={form.key('description')}
						minRows={3}
						{...form.getInputProps('description')}
					/>
				</Stack>

				<section className={styles.agentSection}>
					<Box className={styles.sectionHeader}>
						<Text className={styles.sectionTitle}>{t('agentsToClone')}</Text>
						<Text className={styles.sectionHint}>{t('turnOffAgents')}</Text>
					</Box>

					{agentsToDuplicate.length === 0 ? (
						<Box className={styles.emptyAgents}>
							<Text className={styles.emptyTitle}>{t('noAgentsLinked')}</Text>
							<Text className={styles.emptyDescription}>
								{t('noAgentsDescription')}
							</Text>
						</Box>
					) : (
						<Stack gap='sm'>
							{agentsToDuplicate.map((agent, index) => (
								<Group
									key={agent.agentId}
									align='flex-start'
									gap='sm'
									wrap='nowrap'
									className={styles.agentRow}
								>
									<Checkbox
										checked={agent.selected}
										onChange={(event) =>
											handleAgentToggle(index, event.currentTarget.checked)
										}
										aria-label={t('toggleAgent', { name: agent.originalName })}
									/>
									<Avatar size={36} radius='xl' color='blue'>
										{agent.originalName.charAt(0).toUpperCase()}
									</Avatar>
									<Box className={styles.agentDetails}>
										<Text className={styles.agentName}>
											{agent.originalName}
										</Text>
										<Text className={styles.agentMeta} c='dimmed' size='xs'>
											{t('createDedicatedCopy')}
										</Text>
										<TextInput
											placeholder={t('newAgentName')}
											value={agent.newName}
											onChange={(event) =>
												handleAgentNameChange(index, event.currentTarget.value)
											}
											disabled={!agent.selected}
											size='sm'
											className={styles.agentInput}
											error={
												agent.selected && !agent.newName.trim()
													? t('nameRequired')
													: null
											}
										/>
									</Box>
								</Group>
							))}
						</Stack>
					)}
				</section>

				{validationError && (
					<Alert
						icon={<IconInfoCircle size={18} />}
						title={t('validationRequired')}
						color='yellow'
						variant='light'
						className={styles.alert}
					>
						{validationError}
					</Alert>
				)}

				<Group className={styles.buttonGroup}>
					<Button type='submit' loading={cloneCampaign.isPending} size='md'>
						{t('cloneButton')}
					</Button>
				</Group>
			</form>
		</Paper>
	);
};

export default CloneCampaignForm;
