import { useState, useEffect } from 'react';
import {
	Button,
	Group,
	TextInput,
	Textarea,
	Text,
	Switch,
	Stack,
	Divider,
	Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCloneCampaign } from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import type { Campaign } from '~/models/CampaignsModel';
import styles from './CloneCampaignForm.module.css';
import { IconInfoCircle } from '@tabler/icons-react';
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
	const { t } = useTranslation('campaigns.clone-form', {
		keyPrefix: 'cloneCampaignForm',
	});
	const { t: commonT } = useTranslation('common', {
		keyPrefix: 'actions',
	});
	const cloneCampaign = useCloneCampaign();

	const [agentsToDuplicate, setAgentsToDuplicate] = useState<
		AgentToDuplicate[]
	>([]);
	const [validationError, setValidationError] = useState<string | null>(null);

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

	const getApiErrorMessage = (error: unknown): string => {
		const asAny = error as any;
		if (asAny?.response?.data) {
			const data = asAny.response.data;
			if (typeof data === 'string') return data;
			if (typeof data.message === 'string') return data.message;
			if (typeof data.error === 'string') return data.error;
			try {
				return JSON.stringify(data);
			} catch {
				return String(data);
			}
		}
		if (asAny?.data?.message) return String(asAny.data.message);
		if (error instanceof Error) return error.message;
		return String(error ?? 'Unknown error');
	};

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
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap='md'>
				<TextInput
					label={t('campaignName')}
					placeholder={t('enterCampaignName')}
					withAsterisk
					key={form.key('name')}
					{...form.getInputProps('name')}
				/>
				<Textarea
					label={t('description')}
					placeholder={t('describeYourCampaign')}
					withAsterisk
					minRows={3}
					key={form.key('description')}
					{...form.getInputProps('description')}
				/>

				{campaign.type === 'INBOUND' && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						color='blue'
						variant='light'
					>
						{t('inboundPhoneNotice')}
					</Alert>
				)}

				{agentsToDuplicate.length > 0 && (
					<>
						<Divider
							label={t('agentsCount', { count: agentsToDuplicate.length })}
							labelPosition='center'
						/>

						<div className={styles.agentTable}>
							<div className={styles.agentTableHead}>
								<div />
								<Text className={styles.agentTableHeadLabel}>
									{t('originalName')}
								</Text>
								<Text className={styles.agentTableHeadLabel}>
									{t('newAgentName')}
								</Text>
							</div>

							{agentsToDuplicate.map((agent, index) => (
								<div
									key={agent.agentId}
									className={`${styles.agentRow} ${!agent.selected ? styles.agentRowOff : ''}`}
								>
									<Switch
										checked={agent.selected}
										onChange={(e) =>
											handleAgentToggle(index, e.currentTarget.checked)
										}
										aria-label={t('toggleAgent', { name: agent.originalName })}
										size='sm'
									/>
									<Text
										size='sm'
										fw={500}
										className={
											!agent.selected ? styles.agentNameOff : undefined
										}
										truncate
									>
										{agent.originalName}
									</Text>
									<TextInput
										value={agent.newName}
										onChange={(e) =>
											handleAgentNameChange(index, e.currentTarget.value)
										}
										disabled={!agent.selected}
										size='xs'
										error={
											agent.selected && !agent.newName.trim()
												? t('nameRequired')
												: null
										}
									/>
								</div>
							))}
						</div>
					</>
				)}

				{agentsToDuplicate.length === 0 && (
					<Stack gap='xs'>
						<Text size='sm' fw={600} c='gray.7'>
							{t('noAgentsLinked')}
						</Text>
						<Text size='sm' c='gray.6'>
							{t('noAgentsDescription')}
						</Text>
					</Stack>
				)}

				{validationError && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('validationRequired')}
						color='yellow'
						variant='light'
					>
						{validationError}
					</Alert>
				)}

				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onComplete}>
						{commonT('cancel')}
					</Button>
					<Button type='submit' loading={cloneCampaign.isPending}>
						{t('cloneButton')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default CloneCampaignForm;
