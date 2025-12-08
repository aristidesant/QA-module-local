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
				newName: `Copy of ${campaignAgent.agent.name}`,
				selected: true,
				originalName: campaignAgent.agent.name,
			}));
			setAgentsToDuplicate(initialAgents);
		}
	}, [campaign.agents]);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: `Copy of ${campaign.name}`,
			description: campaign.description || '',
		},
		validate: {
			name: (value) => (value.trim().length < 2 ? 'Name is required' : null),
			description: (value) =>
				value.trim().length < 2 ? 'Description is required' : null,
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
			return 'At least one agent must be selected';
		}
		for (const agent of selectedAgents) {
			if (!agent.newName.trim()) {
				return 'All selected agents must have a name';
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
						title: 'Campaign Cloned',
						message: 'The campaign has been successfully cloned.',
						color: 'green',
					});
					if (onComplete) {
						onComplete();
					}
				},
				onError: (error) => {
					const message = getApiErrorMessage(error);
					notifications.show({
						title: 'Error',
						message: message || 'Failed to clone campaign',
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
						Clone Campaign
					</Text>
					<Text className={styles.subtitle}>
						Adjust the campaign details and select the agents you want to
						duplicate.
					</Text>
				</div>
				<Badge className={styles.agentBadge} variant='light' size='sm'>
					{selectedAgentsCount}
					{` / ${agentsToDuplicate.length}`} selected
				</Badge>
			</Group>

			<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
				<Stack gap='md' className={styles.formFields}>
					<TextInput
						label='Campaign name'
						placeholder='Enter campaign name'
						withAsterisk
						className={styles.field}
						key={form.key('name')}
						{...form.getInputProps('name')}
					/>
					<Textarea
						label='Description'
						placeholder='Describe the purpose of this campaign'
						withAsterisk
						className={styles.field}
						key={form.key('description')}
						minRows={3}
						{...form.getInputProps('description')}
					/>
				</Stack>

				<section className={styles.agentSection}>
					<Box className={styles.sectionHeader}>
						<Text className={styles.sectionTitle}>Agents to clone</Text>
						<Text className={styles.sectionHint}>
							Turn off any agents you do not want duplicated.
						</Text>
					</Box>

					{agentsToDuplicate.length === 0 ? (
						<Box className={styles.emptyAgents}>
							<Text className={styles.emptyTitle}>No agents linked yet</Text>
							<Text className={styles.emptyDescription}>
								This campaign does not have agents assigned. You can continue by
								duplicating only the campaign details.
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
										aria-label={`Toggle ${agent.originalName}`}
									/>
									<Avatar size={36} radius='xl' color='blue'>
										{agent.originalName.charAt(0).toUpperCase()}
									</Avatar>
									<Box className={styles.agentDetails}>
										<Text className={styles.agentName}>
											{agent.originalName}
										</Text>
										<Text className={styles.agentMeta} c='dimmed' size='xs'>
											Create a dedicated copy to fine-tune this agent for the
											new campaign.
										</Text>
										<TextInput
											placeholder='New agent name'
											value={agent.newName}
											onChange={(event) =>
												handleAgentNameChange(index, event.currentTarget.value)
											}
											disabled={!agent.selected}
											size='sm'
											className={styles.agentInput}
											error={
												agent.selected && !agent.newName.trim()
													? 'Name is required'
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
						title='Validation required'
						color='yellow'
						variant='light'
						className={styles.alert}
					>
						{validationError}
					</Alert>
				)}

				<Group className={styles.buttonGroup}>
					<Button type='submit' loading={cloneCampaign.isPending} size='md'>
						Clone campaign
					</Button>
				</Group>
			</form>
		</Paper>
	);
};

export default CloneCampaignForm;
