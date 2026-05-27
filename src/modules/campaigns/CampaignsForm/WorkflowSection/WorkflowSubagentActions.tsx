import {
	Button,
	Group,
	Menu,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateAgent } from '~/queries/agentQueries';
import {
	useCreateCampaignAgent,
	useCreateCampaignAgentFromTemplate,
	useGetCampaignAgents,
	useUpdateCampaignAgentConfig,
} from '~/queries/campaignAgentsQueries';
import { useGetSubagentTemplates } from '~/queries/subagentTemplatesQueries';
import type { CreateAgentDto } from '~/api/agentApi';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import type AgentListObject from '~/models/AgentListObject';
import {
	useCampaignAgentEditor,
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';

const toCreateAgentPayload = (
	sourceAgent: AgentListObject | null | undefined,
	name: string,
	type: CreateAgentDto['type']
): CreateAgentDto => {
	const sourceConfig = structuredClone(sourceAgent?.config ?? {}) as Record<
		string,
		any
	>;

	return {
		conversationConfig:
			(sourceConfig.conversationConfig as Record<string, unknown>) ?? {},
		platformSettings:
			(sourceConfig.platformSettings as Record<string, unknown>) ?? undefined,
		name,
		type,
		voiceId: sourceAgent?.voiceId ?? undefined,
		outboundPhoneNumberId: sourceAgent?.outboundPhoneNumberId ?? undefined,
		inboundPhoneNumberId: sourceAgent?.inboundPhoneNumberId ?? undefined,
	};
};

interface AssignExistingAgentModalProps {
	campaignId: number;
	currentCampaignAgentId?: number | null;
	onAssigned: (campaignAgentId: number) => void;
}

const AssignExistingAgentModal = ({
	campaignId,
	currentCampaignAgentId,
	onAssigned,
}: AssignExistingAgentModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const { data: campaignAgents = [] } = useGetCampaignAgents(campaignId);
	const [campaignAgentId, setCampaignAgentId] = useState<string | null>(null);

	const options = useMemo(
		() =>
			campaignAgents
				.filter((campaignAgent) => campaignAgent.id !== currentCampaignAgentId)
				.map((campaignAgent) => ({
					value: String(campaignAgent.id),
					label: `${campaignAgent.agent?.name || campaignAgent.agentId} · ${campaignAgent.agentType}`,
				})),
		[campaignAgents, currentCampaignAgentId]
	);

	return (
		<Stack gap='sm'>
			<Text size='sm' c='dimmed'>
				{t('form.workflow.subagent.assign.description', {
					defaultValue: 'Reuse an agent already assigned to this campaign.',
				})}
			</Text>
			<Select
				label={t('form.workflow.subagent.assign.label', {
					defaultValue: 'Assigned agent',
				})}
				data={options}
				value={campaignAgentId}
				onChange={setCampaignAgentId}
				searchable
				nothingFoundMessage={t('noResults', {
					ns: 'common',
					defaultValue: 'No results found',
				})}
			/>
			<Group justify='flex-end'>
				<Button
					onClick={() => {
						if (!campaignAgentId) return;
						onAssigned(Number(campaignAgentId));
					}}
					disabled={!campaignAgentId}
				>
					{t('form.workflow.subagent.assign.action', {
						defaultValue: 'Use agent',
					})}
				</Button>
			</Group>
		</Stack>
	);
};

interface CreateFromTemplateModalProps {
	campaignId: number;
	objectiveId?: number;
	onCreated: (campaignAgentId: number) => void;
}

const CreateFromTemplateModal = ({
	campaignId,
	objectiveId,
	onCreated,
}: CreateFromTemplateModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
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

		const created = await createFromTemplate.mutateAsync({
			campaignId,
			payload: {
				templateId: Number(templateId),
				name: name.trim() || undefined,
			},
		});

		notifications.show({
			color: 'green',
			message: t('form.workflow.subagent.template.created', {
				defaultValue: 'Subagent created from template',
			}),
		});
		onCreated(created.id);
	};

	return (
		<Stack gap='sm'>
			<Text size='sm' c='dimmed'>
				{t('form.workflow.subagent.template.description', {
					defaultValue: 'Templates are filtered by this campaign objective.',
				})}
			</Text>
			<Select
				label={t('form.workflow.subagent.template.label', {
					defaultValue: 'Template',
				})}
				placeholder={t('form.workflow.subagent.template.placeholder', {
					defaultValue: 'Select a template',
				})}
				data={templateOptions}
				value={templateId}
				onChange={setTemplateId}
				searchable
				disabled={isLoading}
				nothingFoundMessage={t('form.workflow.subagent.template.empty', {
					defaultValue: 'No templates found for this objective.',
				})}
			/>
			<TextInput
				label={t('form.workflow.subagent.template.name', {
					defaultValue: 'Subagent name',
				})}
				placeholder={t('form.workflow.subagent.template.namePlaceholder', {
					defaultValue: 'Leave blank to use the template name',
				})}
				value={name}
				onChange={(event) => setName(event.currentTarget.value)}
			/>
			<Group justify='flex-end'>
				<Button onClick={handleCreate} disabled={!templateId}>
					{t('form.workflow.subagent.template.action', {
						defaultValue: 'Add subagent',
					})}
				</Button>
			</Group>
		</Stack>
	);
};

interface CreateAgentModalProps {
	campaignId: number;
	selectedAgent: AgentListObject | null | undefined;
	selectedCampaignAgentType: CampaignAgent['agentType'] | undefined;
	copyWorkflow?: boolean;
	onCreated: (campaignAgentId: number) => void;
}

const CreateAgentModal = ({
	campaignId,
	selectedAgent,
	selectedCampaignAgentType,
	copyWorkflow = false,
	onCreated,
}: CreateAgentModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const [name, setName] = useState(
		`${selectedAgent?.name ?? 'Subagent'}${copyWorkflow ? ' Copy' : ''}`
	);
	const createAgent = useCreateAgent();
	const createCampaignAgent = useCreateCampaignAgent();
	const updateCampaignAgentConfig = useUpdateCampaignAgentConfig();

	const handleCreate = async () => {
		if (!selectedAgent) return;

		const payload = toCreateAgentPayload(
			selectedAgent,
			name.trim() || selectedAgent.name,
			selectedCampaignAgentType ?? selectedAgent.type
		);
		const createdAgent = await createAgent.mutateAsync(payload);
		const campaignAgent = await createCampaignAgent.mutateAsync({
			campaignId,
			agentId: createdAgent.id,
			isPrincipal: false,
		});

		if (copyWorkflow) {
			await updateCampaignAgentConfig.mutateAsync({
				campaignId,
				id: campaignAgent.id,
				updateData: {
					config: createdAgent.config,
					workflow: selectedAgent.config?.workflow,
					workflowUi: selectedAgent.workflowUi ?? null,
				},
			});
		}

		onCreated(campaignAgent.id);
		notifications.show({
			color: 'green',
			message: t('form.workflow.subagent.created', {
				defaultValue: 'Subagent added to campaign',
			}),
		});
	};

	return (
		<Stack gap='sm'>
			<Text size='sm' c='dimmed'>
				{t('form.workflow.subagent.create.description', {
					defaultValue:
						'Create a brand new subagent by cloning the selected agent configuration.',
				})}
			</Text>
			<TextInput
				label={t('form.workflow.subagent.create.name', {
					defaultValue: 'Subagent name',
				})}
				placeholder={t('form.workflow.subagent.create.placeholder', {
					defaultValue: 'Enter a name for the new subagent',
				})}
				value={name}
				onChange={(event) => setName(event.currentTarget.value)}
			/>
			<Group justify='flex-end'>
				<Button onClick={handleCreate} loading={createAgent.isPending}>
					{t('form.workflow.subagent.create.action', {
						defaultValue: 'Create subagent',
					})}
				</Button>
			</Group>
		</Stack>
	);
};

interface WorkflowSubagentActionsProps {
	selectedCampaignAgentId: number | null;
}

const WorkflowSubagentActions = ({
	selectedCampaignAgentId,
}: WorkflowSubagentActionsProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const campaignId = useCampaignId();
	const form = useCampaignFormContext();
	const { selectedCampaignAgent, selectedAgent, setSelectedCampaignAgentId } =
		useCampaignAgentEditor();

	const openModal = (
		title: string,
		content: ReactNode,
		size: 'sm' | 'md' | 'lg' = 'md'
	) => {
		modals.open({
			title,
			centered: true,
			size,
			children: content,
		});
	};

	if (!campaignId) {
		return null;
	}

	return (
		<>
			<Menu shadow='md' width={280} position='bottom-end'>
				<Menu.Target>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconPlus size={14} />}
						rightSection={<IconChevronDown size={14} />}
					>
						{t('form.workflow.subagent.button', {
							defaultValue: 'Add subagent',
						})}
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						onClick={() =>
							openModal(
								t('form.workflow.subagent.assign.title', {
									defaultValue: 'Assign existing assigned agent',
								}),
								<AssignExistingAgentModal
									campaignId={campaignId}
									currentCampaignAgentId={selectedCampaignAgentId}
									onAssigned={(campaignAgentId) => {
										setSelectedCampaignAgentId(campaignAgentId);
										modals.closeAll();
									}}
								/>
							)
						}
					>
						{t('form.workflow.subagent.assign.title', {
							defaultValue: 'Assign existing assigned agent',
						})}
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							openModal(
								t('form.workflow.subagent.template.modalTitle', {
									defaultValue: 'Add subagent from template',
								}),
								<CreateFromTemplateModal
									campaignId={campaignId}
									objectiveId={form.values.objectiveId}
									onCreated={(campaignAgentId) => {
										setSelectedCampaignAgentId(campaignAgentId);
										modals.closeAll();
									}}
								/>
							)
						}
					>
						{t('form.workflow.subagent.template.title', {
							defaultValue: 'Create from template',
						})}
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							openModal(
								t('form.workflow.subagent.create.title', {
									defaultValue: 'Create subagent manually',
								}),
								<CreateAgentModal
									campaignId={campaignId}
									selectedAgent={selectedAgent}
									selectedCampaignAgentType={selectedCampaignAgent?.agentType}
									onCreated={(campaignAgentId) => {
										setSelectedCampaignAgentId(campaignAgentId);
										modals.closeAll();
									}}
								/>
							)
						}
					>
						{t('form.workflow.subagent.create.title', {
							defaultValue: 'Create manually',
						})}
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							openModal(
								t('form.workflow.subagent.import.title', {
									defaultValue: 'Import workflow into new subagent',
								}),
								<CreateAgentModal
									campaignId={campaignId}
									selectedAgent={selectedAgent}
									selectedCampaignAgentType={selectedCampaignAgent?.agentType}
									copyWorkflow
									onCreated={(campaignAgentId) => {
										setSelectedCampaignAgentId(campaignAgentId);
										modals.closeAll();
									}}
								/>
							)
						}
					>
						{t('form.workflow.subagent.import.title', {
							defaultValue: 'Import workflow into new subagent',
						})}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default WorkflowSubagentActions;
