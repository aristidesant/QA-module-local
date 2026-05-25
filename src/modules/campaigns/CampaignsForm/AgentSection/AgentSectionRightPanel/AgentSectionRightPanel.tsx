import {
	Button,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconDeviceFloppy,
	IconMicrophoneOff,
	IconTemplate,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AgentCampaignList from '../AgentCampaignList';
import CampaignDictionarySelector from '../CampaignDictionarySelector';
import CampaignConfigurationAsrKeywords from '../CampaignConfigurationAsrKeywords';
import CampaignConfigurationSystemTools from '../CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from '../CampaignConfigurationKnowledgeBase';
import CampaignConfigurationDynamicVariables from '../CampaignConfigurationDynamicVariables';
import RightSectionCard from '~/components/RightSectionCard';
import {
	useCampaignFormContext,
	useCampaignId,
} from '../../../campaignFormFunctions';
import {
	useCreateCampaignAgentFromTemplate,
	useCreateSubagentTemplateFromAgent,
	useGetCampaignAgents,
} from '~/queries/campaignAgentsQueries';
import { useGetSubagentTemplates } from '~/queries/subagentTemplatesQueries';
import type { CampaignAgent } from '~/models/CampaignAgentModel';

interface AddSubagentFromTemplateModalProps {
	campaignId: number;
	objectiveId?: number;
	onComplete: () => void;
}

const AddSubagentFromTemplateModal = ({
	campaignId,
	objectiveId,
	onComplete,
}: AddSubagentFromTemplateModalProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const [templateId, setTemplateId] = useState<string | null>(null);
	const [name, setName] = useState('');
	const { data: templates, isLoading } = useGetSubagentTemplates({
		objectiveId,
	});
	const createFromTemplate = useCreateCampaignAgentFromTemplate();

	const templateOptions =
		templates?.map((template) => ({
			value: String(template.id),
			label: `${template.name} · ${template.agentType}`,
		})) ?? [];

	const handleCreate = async () => {
		if (!templateId) return;

		await createFromTemplate.mutateAsync({
			campaignId,
			payload: {
				templateId: Number(templateId),
				name: name.trim() || undefined,
			},
		});
		notifications.show({
			color: 'green',
			message: t('form.agent.templates.created'),
		});
		onComplete();
	};

	return (
		<Stack gap='sm'>
			<Text size='sm' c='dimmed'>
				{t('form.agent.templates.modalDescription')}
			</Text>
			<Select
				label={t('form.agent.templates.templateLabel')}
				placeholder={t('form.agent.templates.templatePlaceholder')}
				data={templateOptions}
				value={templateId}
				onChange={setTemplateId}
				searchable
				disabled={isLoading}
				nothingFoundMessage={t('form.agent.templates.empty')}
			/>
			<TextInput
				label={t('form.agent.templates.nameLabel')}
				placeholder={t('form.agent.templates.namePlaceholder')}
				value={name}
				onChange={(event) => setName(event.currentTarget.value)}
			/>
			<Group justify='flex-end'>
				<Button
					onClick={handleCreate}
					disabled={!templateId}
					loading={createFromTemplate.isPending}
				>
					{t('form.agent.templates.create')}
				</Button>
			</Group>
		</Stack>
	);
};

interface SaveSubagentTemplateModalProps {
	campaignId: number;
	objectiveId?: number;
	subagents: CampaignAgent[];
	onComplete: () => void;
}

const SaveSubagentTemplateModal = ({
	campaignId,
	objectiveId,
	subagents,
	onComplete,
}: SaveSubagentTemplateModalProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const [campaignAgentId, setCampaignAgentId] = useState<string | null>(
		subagents[0]?.id ? String(subagents[0].id) : null
	);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const createTemplate = useCreateSubagentTemplateFromAgent();

	const subagentOptions = subagents.map((campaignAgent) => ({
		value: String(campaignAgent.id),
		label: campaignAgent.agent?.name || campaignAgent.agentId,
	}));

	const handleSave = async () => {
		if (!campaignAgentId || !name.trim()) return;

		await createTemplate.mutateAsync({
			campaignId,
			id: Number(campaignAgentId),
			payload: {
				name: name.trim(),
				description: description.trim() || undefined,
				objectiveId,
			},
		});
		notifications.show({
			color: 'green',
			message: t('form.agent.templates.templateSaved'),
		});
		onComplete();
	};

	return (
		<Stack gap='sm'>
			<Select
				label={t('form.agent.selector.label')}
				data={subagentOptions}
				value={campaignAgentId}
				onChange={setCampaignAgentId}
			/>
			<TextInput
				label={t('form.agent.templates.templateNameLabel')}
				placeholder={t('form.agent.templates.templateNamePlaceholder')}
				value={name}
				onChange={(event) => setName(event.currentTarget.value)}
			/>
			<Textarea
				label={t('form.agent.templates.descriptionLabel')}
				placeholder={t('form.agent.templates.descriptionPlaceholder')}
				value={description}
				onChange={(event) => setDescription(event.currentTarget.value)}
				minRows={3}
			/>
			<Group justify='flex-end'>
				<Button
					onClick={handleSave}
					disabled={!campaignAgentId || !name.trim()}
					loading={createTemplate.isPending}
				>
					{t('form.agent.templates.save')}
				</Button>
			</Group>
		</Stack>
	);
};

const AgentSectionRightPanel: React.FC = () => {
	const { t } = useTranslation(['campaign.form.agents', 'campaigns']);
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const { data: campaignAgents, refetch } = useGetCampaignAgents(
		campaignId || 0
	);
	const sortedCampaignAgents = useMemo(
		() =>
			[...(campaignAgents ?? [])].sort((a, b) => {
				if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
				return a.agentType.localeCompare(b.agentType);
			}),
		[campaignAgents]
	);
	const firstAgentId = sortedCampaignAgents[0]?.agentId ?? null;
	const subagents = sortedCampaignAgents.filter((agent) => !agent.isPrincipal);

	const openAddTemplateModal = () => {
		if (!campaignId) return;
		modals.open({
			modalId: 'add-subagent-from-template',
			title: t('form.agent.templates.modalTitle'),
			centered: true,
			size: 'md',
			children: (
				<AddSubagentFromTemplateModal
					campaignId={campaignId}
					objectiveId={form.values.objectiveId}
					onComplete={() => {
						refetch();
						modals.close('add-subagent-from-template');
					}}
				/>
			),
		});
	};

	const openSaveTemplateModal = () => {
		if (!campaignId || subagents.length === 0) return;
		modals.open({
			modalId: 'save-subagent-template',
			title: t('form.agent.templates.saveModalTitle'),
			centered: true,
			size: 'md',
			children: (
				<SaveSubagentTemplateModal
					campaignId={campaignId}
					objectiveId={form.values.objectiveId}
					subagents={subagents}
					onComplete={() => modals.close('save-subagent-template')}
				/>
			),
		});
	};

	return (
		<Stack gap='xs'>
			<AgentCampaignList />
			{campaignId && (
				<RightSectionCard
					title={t('form.agent.templates.modalTitle')}
					description={t('form.agent.templates.modalDescription')}
					icon={IconTemplate}
					iconColor='violet'
				>
					<Stack gap='xs'>
						<Button
							variant='light'
							leftSection={<IconTemplate size={16} />}
							onClick={openAddTemplateModal}
						>
							{t('form.agent.templates.add')}
						</Button>
						<Button
							variant='subtle'
							leftSection={<IconDeviceFloppy size={16} />}
							onClick={openSaveTemplateModal}
							disabled={subagents.length === 0}
						>
							{t('form.agent.templates.save')}
						</Button>
					</Stack>
				</RightSectionCard>
			)}
			{firstAgentId && <CampaignDictionarySelector agentId={firstAgentId} />}
			<RightSectionCard
				title={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
				description={t('general.noiseCancellationDesc', { ns: 'campaigns' })}
				icon={IconMicrophoneOff}
				iconColor='indigo'
			>
				<Switch
					label={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
					size='sm'
					checked={form.values.noiseCancellation ?? false}
					onChange={(event) =>
						form.setFieldValue('noiseCancellation', event.currentTarget.checked)
					}
				/>
			</RightSectionCard>
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationAsrKeywords />
			<CampaignConfigurationDynamicVariables />
		</Stack>
	);
};

export default AgentSectionRightPanel;
