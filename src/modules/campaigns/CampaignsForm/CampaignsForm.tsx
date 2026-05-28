// Refactored to use Mantine's useForm for all form state and validation

import React, { useEffect, useState } from 'react';
import {
	Stack,
	LoadingOverlay,
	Box,
	ActionIcon,
	Tooltip,
	Group,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { Campaign } from '../../../models/CampaignsModel';
import type { AgentVersionSnapshot } from '~/models/AgentVersioningModel';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import campaignAgentsApi from '~/api/campaignAgentsApi';
import knowledgeBaseApi from '~/api/knowledgeBaseApi';
import {
	useCreateCampaign,
	useUpdateCampaign,
	useUpdateCampaignLight,
	useAssignCampaignObjective,
} from '~/queries/campaignsQueries';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useGetAgentVersioningStatus } from '~/queries/agentVersioningQueries';
import { useGetCampaignRoles } from '~/queries/roleCampaignsQueries';
import { notifications } from '@mantine/notifications';
import { validateWorkflow } from './WorkflowSection/utils/workflowValidation';
import {
	CampaignFormProvider,
	CampaignIdContext,
	CampaignAgentEditorContext,
	type SelectedAgentDraft,
	useCampaignForm,
} from '../campaignFormFunctions';
import CampaignTabs from '../CampaignTabs';
import { useCampaignsStore } from '~/stores/campaignsStore';
import useCampaignsPredefinedParams from './useCampaignsPredefinedParams';
import GeneralSection from './GeneralSection/GeneralSection';
import SectionCard from '~/components/SectionCard';
import ParametersSection from './ParametersSection';
import AnalyticsSection from './AnalyticsSection';
import AgentSection from './AgentSection';
import AgentSaveReviewModal from './AgentSaveReviewModal';
import DispositionSection from './DispositionSection';
import DoNotCallSection from './DoNotCallSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignStatus } from '~/models/CampaignStatus';
import { modals } from '@mantine/modals';
import { IconEye, IconFlask } from '@tabler/icons-react';
import SchedulerCalculator from './ParametersSection/SchedulerCalculator';
import FormSaveButton from '~/components/FormSaveButton';
import CampaignSyncButton from './components/CampaignSyncButton';
import GeneralSectionRightPanel from './GeneralSection/GeneralSectionRightPanel';
import AppDrawer from '~/components/AppDrawer';
import DashboardSection from './DashboardSection';
import VoicesSection from './VoicesSection';
import CampaignRoleVisibilitySelector from '../components/CampaignRoleVisibilitySelector';
import i18n from '~/locales/i18n';
import styles from './CampaignsForm.module.css';
import { getDataCollectionFromAgentConfig } from './AnalyticsSection/analyticsFormContext';
import {
	applyCampaignBehaviorConversationConfig,
	applyCampaignBehaviorPlatformSettings,
	sanitizeCampaignBehaviorConversationConfig,
} from '~/modules/campaigns/utils/campaignBehaviorConfig';
import { useGetAgent } from '~/queries/agentQueries';

interface CampaignsFormProps {
	campaign?: Partial<Campaign>;
	loading?: boolean;
	onBack?: () => void;
}

const campaignFormTabNamespaces: Record<string, string> = {
	general: 'campaign.form.general',
	agents: 'campaign.form.agents',
	outcomes: 'campaign.form.outcomes',
	'do-not-call': 'campaign.form.do-not-call',
	params: 'campaign.form.params',
	analytics: 'campaign.form.analytics',
	dashboards: 'campaign.form.dashboards',
	voices: 'campaign.form.voices',
};

const paramsNamespace = 'campaign.form.params';
const paramsFallbackNamespace = 'campaigns.wizard';

const getWorkflowCounts = (
	workflow?: Partial<Campaign>['agentConfig'] extends infer T
		? T extends { workflow?: infer W }
			? W
			: never
		: never
) => {
	const normalizedWorkflow = workflow as
		| {
				nodes?: Record<string, unknown>;
				edges?: Record<string, unknown>;
		  }
		| undefined;

	return {
		nodes: normalizedWorkflow?.nodes
			? Object.keys(normalizedWorkflow.nodes).length
			: 0,
		edges: normalizedWorkflow?.edges
			? Object.keys(normalizedWorkflow.edges).length
			: 0,
	};
};

interface StickySaveActionsProps {
	isLoading: boolean;
	disabled: boolean;
	label: string;
	loadingLabel: string;
}

const StickySaveActions: React.FC<StickySaveActionsProps> = ({
	isLoading,
	disabled,
	label,
	loadingLabel,
}) => (
	<Box className={styles.stickyActions}>
		<Group className={styles.stickyActionsGroup}>
			<FormSaveButton
				label={label}
				loadingLabel={loadingLabel}
				isLoading={isLoading}
				disabled={disabled}
			/>
		</Group>
	</Box>
);

export const CampaignsForm: React.FC<CampaignsFormProps> = ({
	campaign,
	onBack,
}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { selectedTab, rightComponent, resetView, setSelectedTab } =
		useCampaignsStore((state) => state);
	const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [pendingAgentValues, setPendingAgentValues] = useState<Omit<
		Campaign,
		'id' | 'createdAt' | 'updatedAt'
	> | null>(null);
	const predefinedParams = useCampaignsPredefinedParams();
	const campaignId = campaign?.id ?? 0;
	const [selectedCampaignAgentId, setSelectedCampaignAgentId] = useState<
		number | null
	>(null);
	const [selectedAgentDraft, setSelectedAgentDraft] =
		useState<SelectedAgentDraft | null>(null);

	// Fetch campaign agents to check versioning status
	const {
		data: campaignAgents = [],
		dataUpdatedAt: campaignAgentsUpdatedAt,
	} = useGetCampaignAgents(campaignId);
	const sortedCampaignAgents = React.useMemo(
		() =>
			[...(campaignAgents ?? [])].sort((a, b) => {
				if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
				return a.agentType.localeCompare(b.agentType);
			}),
		[campaignAgents]
	);
	const selectedCampaignAgent = sortedCampaignAgents.find(
		(agent) => agent.id === selectedCampaignAgentId
	);
	const {
		data: selectedAgent,
		dataUpdatedAt: selectedAgentUpdatedAt,
	} = useGetAgent(
		selectedCampaignAgent?.agentId ?? ''
	);
	const {
		data: campaignRoles,
		isLoading: isCampaignRolesLoading,
		isError: isCampaignRolesError,
		isFetched: isCampaignRolesFetched,
	} = useGetCampaignRoles(campaignId);
	const firstAgentId = campaignAgents[0]?.agentId ?? '';
	const { data: agentRecord } = useGetAgentVersioningStatus(firstAgentId);
	const isVersioningEnabled = Boolean(agentRecord?.versioningEnabled);

	useEffect(() => {
		if (sortedCampaignAgents.length === 0) {
			setSelectedCampaignAgentId(null);
			return;
		}

		const hasSelection = selectedCampaignAgentId
			? sortedCampaignAgents.some(
					(agent) => agent.id === selectedCampaignAgentId
				)
			: false;

		if (!hasSelection) {
			setSelectedCampaignAgentId(sortedCampaignAgents[0].id);
		}
	}, [selectedCampaignAgentId, sortedCampaignAgents]);

	useEffect(() => {
		if (!selectedCampaignAgent || !selectedAgent) {
			setSelectedAgentDraft(null);
			return;
		}

		setSelectedAgentDraft({
			campaignAgentId: selectedCampaignAgent.id,
			agentId: selectedCampaignAgent.agentId,
			config: selectedAgent.config ?? {},
			workflowUi: selectedAgent.workflowUi ?? null,
			agentType: selectedCampaignAgent.agentType,
			isPrincipal: selectedCampaignAgent.isPrincipal,
		});
	}, [
		campaignAgentsUpdatedAt,
		selectedAgentUpdatedAt,
		selectedCampaignAgent?.id,
		selectedCampaignAgent?.agentId,
	]);

	useEffect(() => {
		if (!campaign?.id || !selectedCampaignAgent || !selectedAgent) {
			return;
		}

		form.setValues((current) => ({
			...current,
			agentConfig: selectedAgent.config ?? {},
			nodeStyles: selectedAgent.workflowUi?.nodeStyles ?? {},
			nodeGroups: selectedAgent.workflowUi?.nodeGroups ?? {},
		}));
		form.resetDirty();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		selectedCampaignAgent?.id,
		selectedAgentUpdatedAt,
		selectedAgent?.config?.workflow,
		selectedAgent?.workflowUi?.nodeStyles,
		selectedAgent?.workflowUi?.nodeGroups,
	]);

	const updateSelectedAgentDraft = (patch: Partial<SelectedAgentDraft>) => {
		setSelectedAgentDraft((current) =>
			current ? { ...current, ...patch } : current
		);
	};
	const { mutateAsync: createCampaign, isPending: isCreating } =
		useCreateCampaign();
	const { mutateAsync: updateCampaign, isPending: isUpdating } =
		useUpdateCampaign();
	const { mutateAsync: updateCampaignLight, isPending: isUpdatingLight } =
		useUpdateCampaignLight();
	const { mutateAsync: assignObjective } = useAssignCampaignObjective();

	const defaultWorkingHours = {
		monday: { enabled: true, from: '09:00', to: '17:30' },
		tuesday: { enabled: true, from: '09:00', to: '17:30' },
		wednesday: { enabled: true, from: '09:00', to: '17:30' },
		thursday: { enabled: true, from: '09:00', to: '17:30' },
		friday: { enabled: true, from: '09:00', to: '17:30' },
		saturday: { enabled: false, from: '09:00', to: '17:30' },
		sunday: { enabled: false, from: '09:00', to: '17:30' },
	};

	const activeFormNamespace =
		campaignFormTabNamespaces[selectedTab] ?? 'campaign.form.shared';

	const { t } = useTranslation([
		'campaign.form.shared',
		activeFormNamespace,
		'campaign.detail',
		'campaign.contact-list',
		'do-not-call',
		'common',
	]);

	const saveLabel = t('form.actions.save', {
		defaultValue: 'Save changes',
	});
	const savingLabel = t('form.actions.saving', {
		defaultValue: 'Saving...',
	});

	const campaignRoleIds = React.useMemo(
		() => (campaignRoles ?? []).map((role) => role.id),
		[campaignRoles]
	);
	const isGeneralRoleSaveBlocked =
		campaignId > 0 && (isCampaignRolesLoading || isCampaignRolesError);

	const form = useCampaignForm({
		initialValues: {
			name: campaign?.name || '',
			agentName: campaign?.agentName || '',
			configId: campaign?.configId || '',
			description: campaign?.description || '',
			budget: campaign?.budget ?? 0,
			spent: campaign?.spent ?? 0,
			type: campaign?.type || 'OUTBOUND',
			status: campaign?.status || CampaignStatus.INACTIVE,
			userId: campaign?.userId ?? 0,
			promptId: campaign?.promptId ?? undefined,
			objectiveId: campaign?.objectiveId ?? undefined,
			voiceId: campaign?.voiceId ?? undefined,
			voiceIds:
				campaign?.voiceIds ?? (campaign?.voiceId ? [campaign.voiceId] : []),
			clientId: campaign?.clientId ?? 0,
			tags: campaign?.tags || [],
			workingHours: campaign?.workingHours || defaultWorkingHours,
			noiseCancellation: campaign?.noiseCancellation,
			agentConfig: selectedAgent?.config ?? {},
			dataCollectionVariables: campaign?.dataCollectionVariables ?? [],
			nodeStyles: selectedAgent?.workflowUi?.nodeStyles ?? {},
			nodeGroups: selectedAgent?.workflowUi?.nodeGroups ?? {},
			defaultMaxWaves: campaign?.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign?.defaultWaveExecutionDelaySeconds ?? 0,
			roleIds: campaign?.roleIds ?? [],
		},
		validate: {
			name: (value) => (value ? null : t('form.validation.nameRequired')),
			type: (value) => (value ? null : t('form.validation.typeRequired')),
			status: (value) => (value ? null : t('form.validation.statusRequired')),
			budget: (value) => (value >= 0 ? null : t('form.validation.budgetMin')),
			spent: (value) => (value >= 0 ? null : t('form.validation.spentMin')),
			userId: (value) => (value >= 0 ? null : t('form.validation.userIdMin')),
			clientId: (value) =>
				value >= 0 ? null : t('form.validation.clientIdMin'),
			defaultMaxWaves: (value) =>
				value && value >= 1 ? null : t('form.validation.defaultWavesMin'),
			defaultWaveExecutionDelaySeconds: (value) =>
				value !== undefined && value >= 0
					? null
					: t('form.validation.defaultWaveDelayMin'),
			objectiveId: (value) =>
				value ? null : t('form.validation.objectiveRequired'),
		},
	});
	const attributeMetricKeys = React.useMemo(() => {
		const dataCollection = getDataCollectionFromAgentConfig(
			form.values.agentConfig
		);

		return Object.keys(dataCollection)
			.filter((key) => key.trim().length > 0)
			.sort((left, right) => left.localeCompare(right));
	}, [form.values.agentConfig]);

	// Update form values when campaign data changes
	useEffect(() => {
		if (!campaign?.id) return; // Only for existing campaigns
		if (!isCampaignRolesFetched) return;
		if (isCampaignRolesError) return;

		const campaignWorkflowCounts = getWorkflowCounts(
			selectedAgent?.config?.workflow
		);
		void campaignWorkflowCounts;

		form.setValues({
			name: campaign.name || '',
			agentName: campaign.agentName || '',
			configId: campaign.configId || '',
			description: campaign.description || '',
			budget: campaign.budget ?? 0,
			spent: campaign.spent ?? 0,
			type: campaign.type || 'OUTBOUND',
			status: campaign.status || CampaignStatus.INACTIVE,
			userId: campaign.userId ?? 0,
			promptId: campaign.promptId ?? undefined,
			objectiveId: campaign.objectiveId ?? undefined,
			voiceId: campaign.voiceId ?? undefined,
			voiceIds:
				campaign.voiceIds ?? (campaign.voiceId ? [campaign.voiceId] : []),
			clientId: campaign.clientId ?? 0,
			tags: campaign.tags || [],
			workingHours: campaign.workingHours || defaultWorkingHours,
			noiseCancellation: campaign.noiseCancellation,
			agentConfig: selectedAgent?.config ?? {},
			dataCollectionVariables: campaign.dataCollectionVariables ?? [],
			nodeStyles: selectedAgent?.workflowUi?.nodeStyles ?? {},
			nodeGroups: selectedAgent?.workflowUi?.nodeGroups ?? {},
			defaultMaxWaves: campaign.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign.defaultWaveExecutionDelaySeconds ?? 0,
			roleIds: campaignRoleIds,
		});
		// Sync the snapshot so dirty detection is always relative to the
		// latest backend state, not a stale cached version.
		form.resetDirty();

		const stateWorkflowCounts = getWorkflowCounts(
			form.values.agentConfig?.workflow
		);
		const getterWorkflowCounts = getWorkflowCounts(
			form.getValues().agentConfig?.workflow
		);
		void stateWorkflowCounts;
		void getterWorkflowCounts;
	}, [
		campaign?.id,
		selectedAgent?.id,
		campaignRoleIds,
		isCampaignRolesError,
		isCampaignRolesFetched,
		selectedAgent?.config?.workflow,
		selectedAgent?.workflowUi?.nodeStyles,
		selectedAgent?.workflowUi?.nodeGroups,
	]);

	// Reset view only on component unmount
	useEffect(() => {
		return () => {
			form.reset();
			resetView();
		};
	}, []);

	useEffect(() => {
		setIsSettingsDrawerOpen(false);
	}, [selectedTab]);

	useEffect(() => {
		if (selectedTab === 'voices' && !campaign?.id) {
			setSelectedTab('agents');
		}
	}, [campaign?.id, selectedTab, setSelectedTab]);

	useEffect(() => {
		if (selectedTab !== 'outcomes') return;
		setIsSettingsDrawerOpen(Boolean(rightComponent));
	}, [selectedTab, rightComponent]);

	useEffect(() => {
		if (selectedTab !== 'agents') return;

		void i18n.loadNamespaces([
			'campaigns',
			'knowledgeBaseSelection',
			'campaigns.wizard',
		]);

		void queryClient.prefetchQuery({
			queryKey: ['knowledgeBases', {}],
			queryFn: async () => {
				const api = knowledgeBaseApi();
				return api.getKnowledgeBases();
			},
			staleTime: 1000 * 60,
		});

		void queryClient.prefetchQuery({
			queryKey: [
				'knowledgeBasesPaginated',
				{
					limit: 10,
					offset: 0,
					sortBy: 'name',
					sortOrder: 'asc',
				},
			],
			queryFn: async () => {
				const api = knowledgeBaseApi();
				return api.getKnowledgeBasesPaginated({
					limit: 10,
					offset: 0,
					sortBy: 'name',
					sortOrder: 'asc',
				});
			},
			staleTime: 1000 * 60,
		});

		if (!campaign?.id) return;

		void queryClient.prefetchQuery({
			queryKey: ['campaignAgents', campaign.id],
			queryFn: async () => {
				const api = campaignAgentsApi();
				return api.getCampaignAgents(campaign.id as number);
			},
			staleTime: 1000 * 60,
		});
	}, [campaign?.id, queryClient, selectedTab]);

	useEffect(() => {
		if (selectedTab !== 'params') return;

		void i18n.loadNamespaces([paramsNamespace, paramsFallbackNamespace]);
	}, [selectedTab]);

	const settingsDrawerTitle = t('form.settingsDrawer.title');
	const openSettingsDrawer = () => {
		void i18n
			.loadNamespaces([
				'campaigns',
				'knowledgeBaseSelection',
				'campaigns.wizard',
			])
			.finally(() => {
				setIsSettingsDrawerOpen(true);
			});
	};

	const settingsDrawerContent =
		selectedTab === 'general' ? (
			<GeneralSectionRightPanel />
		) : selectedTab === 'outcomes' ? (
			rightComponent
		) : null;

	const handleSubmit = async (
		value: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>,
		isLight = false,
		versionDescription?: string
	) => {
		if (form.validate().hasErrors) {
			return;
		}

		if (isLight && isGeneralRoleSaveBlocked) {
			notifications.show({
				title: t('errors.unknown', { ns: 'common' }),
				message: t('general.roleVisibility.loadErrorSaveBlocked', {
					ns: 'campaign.form.general',
				}),
				color: 'red',
			});
			return;
		}

		// Validate workflow edge conditions before submitting
		if (value.agentConfig?.workflow) {
			const validationResult = validateWorkflow(value.agentConfig.workflow);
			if (!validationResult.isValid) {
				notifications.show({
					title: t('form.validation.workflowInvalidTitle', {
						defaultValue: 'Workflow Configuration Error',
					}),
					message:
						validationResult.errorMessage ||
						t('form.validation.workflowInvalidMessage', {
							defaultValue:
								'All edges must have at least one condition configured',
						}),
					color: 'red',
				});
				return;
			}
		}

		try {
			const selectedBehaviorConversationConfig = predefinedParams.find(
				(param) => param.id === value.configId
			)?.params?.conversationConfig;
			const selectedBehaviorPlatformSettings = predefinedParams.find(
				(param) => param.id === value.configId
			)?.params?.platformSettings;

			// Clean up orphan nodeStyles entries (keys whose node no longer exists)
			const workflowNodes = value.agentConfig?.workflow?.nodes;
			if (value.nodeStyles && workflowNodes) {
				const validNodeIds = new Set(Object.keys(workflowNodes));
				const cleaned: Record<string, unknown> = {};
				for (const [nodeId, style] of Object.entries(value.nodeStyles)) {
					if (validNodeIds.has(nodeId)) {
						cleaned[nodeId] = style;
					}
				}
				value.nodeStyles = cleaned as typeof value.nodeStyles;
			}

			// Clean up toolIds from agentConfig before sending
			const cleanedValue = { ...value };
			if (cleanedValue.agentConfig) {
				const currentAgentConfig = cleanedValue.agentConfig;
				const mergedConversationConfig =
					applyCampaignBehaviorConversationConfig(
						(currentAgentConfig.conversationConfig || {}) as Record<
							string,
							unknown
						>,
						selectedBehaviorConversationConfig
					);
				cleanedValue.agentConfig = {
					...currentAgentConfig,
					platformSettings: applyCampaignBehaviorPlatformSettings(
						(currentAgentConfig.platformSettings || {}) as Record<
							string,
							unknown
						>,
						selectedBehaviorPlatformSettings
					) as typeof currentAgentConfig.platformSettings,
					conversationConfig: sanitizeCampaignBehaviorConversationConfig(
						mergedConversationConfig
					) as unknown as ConversationConfigModel,
				};
			}
			if (cleanedValue.agentConfig?.conversationConfig?.agent?.prompt) {
				const { toolIds, ...restPrompt } =
					cleanedValue.agentConfig.conversationConfig.agent.prompt;
				cleanedValue.agentConfig = {
					...cleanedValue.agentConfig,
					conversationConfig: {
						...cleanedValue.agentConfig.conversationConfig,
						agent: {
							...cleanedValue.agentConfig.conversationConfig.agent,
							prompt: restPrompt as any,
						},
					},
				};
			}

			if (cleanedValue.type === 'INBOUND') {
				cleanedValue.defaultWaveExecutionDelaySeconds = undefined;
			}

			// Prepare data for light update (excludes agentConfig and versionDescription)
			const dataToSend = isLight
				? (({
						agentConfig,
						dataCollectionVariables,
						versionDescription: _vd,
						...rest
					}) => rest)(cleanedValue)
				: (({ roleIds: _roleIds, ...rest }) => ({
						...rest,
						...(versionDescription !== undefined ? { versionDescription } : {}),
					}))(cleanedValue);

			let savedCampaign: Campaign;

			if (campaign?.id) {
				// Update existing campaign
				if (isLight) {
					savedCampaign = await updateCampaignLight({
						data: dataToSend,
						id: `${campaign.id}`,
					});
				} else {
					savedCampaign = await updateCampaign({
						data: dataToSend,
						id: `${campaign.id}`,
					});
				}
				await queryClient.invalidateQueries({
					queryKey: ['campaign', String(campaign.id)],
				});
			} else {
				// Create new campaign
				savedCampaign = await createCampaign(cleanedValue);
			}

			// Handle objective assignment if an objective is selected
			if (value.objectiveId && savedCampaign.id) {
				try {
					await assignObjective({
						campaignId: savedCampaign.id,
						objectiveId: value.objectiveId,
					});
				} catch (objectiveError) {
					// Don't fail the whole operation if objective assignment fails
					notifications.show({
						title: t('form.notifications.warningTitle'),
						message: t('form.notifications.objectiveAssignmentFailed'),
						color: 'yellow',
					});
				}
			}

			notifications.show({
				title: campaign?.id
					? t('form.notifications.successUpdated')
					: t('form.notifications.successCreated'),
				message: campaign?.id
					? t('form.notifications.successUpdatedMessage')
					: t('form.notifications.successCreatedMessage'),
				color: 'green',
			});
			form.resetDirty();
		} catch (error) {
			notifications.show({
				title: t('errors.unknown', { ns: 'common' }),
				message: campaign?.id
					? t('form.notifications.errorUpdate')
					: t('form.notifications.errorCreate'),
				color: 'red',
			});
		}
	};

	return (
		<CampaignIdContext.Provider value={campaign?.id}>
			<CampaignAgentEditorContext.Provider
				value={{
					selectedCampaignAgentId,
					setSelectedCampaignAgentId,
					selectedCampaignAgent,
					selectedAgent,
					selectedAgentDraft,
					setSelectedAgentDraft,
					updateSelectedAgentDraft,
				}}
			>
				<CampaignFormProvider form={form}>
					<ContentContainer
						contentWidth='centered'
						onBackClick={() => {
							resetView();
							onBack?.();
						}}
						title={
							campaign?.id
								? t('form.title.edit', { name: campaign.name })
								: t('form.title.create')
						}
						titleRight={
							campaign?.id && (
								<Group gap='xs'>
									<CampaignSyncButton />
									<Tooltip label={t('form.actions.viewCampaign')} withArrow>
										<ActionIcon
											variant='light'
											size='lg'
											aria-label={t('form.actions.viewCampaign')}
											onClick={() => navigate(`/campaign/view/${campaign.id}`)}
										>
											<IconEye size={20} />
										</ActionIcon>
									</Tooltip>
									<Tooltip
										label={t('form.actions.testConvai', {
											ns: 'campaign.detail',
										})}
										withArrow
									>
										<ActionIcon
											variant='light'
											color='blue'
											size='lg'
											aria-label={t('form.actions.testConvai', {
												ns: 'campaign.detail',
											})}
											onClick={() =>
												selectedCampaignAgent?.id &&
												selectedCampaignAgent?.agentId
													? navigate(
															`/campaign/${campaign.id}/agent/${selectedCampaignAgent.id}/test/${selectedCampaignAgent.agentId}`
														)
													: navigate(`/campaign/${campaign.id}/test`)
											}
										>
											<IconFlask size={20} />
										</ActionIcon>
									</Tooltip>
								</Group>
							)
						}
						description={t('form.description')}
						showBackButton
					>
						<LoadingOverlay
							visible={isCreating || isUpdating || isUpdatingLight}
						/>
						<Stack gap='xs'>
							<Box p='xs'>
								<CampaignTabs hasVoicesTab={Boolean(campaign?.id)} />
							</Box>
							{selectedTab === 'general' && (
								<form
									onSubmit={form.onSubmit((values) =>
										handleSubmit(values, true)
									)}
								>
									<GeneralSection onOpenSettings={openSettingsDrawer} />
									<SectionCard
										title={t('general.roleVisibility.title', {
											ns: 'campaign.form.general',
										})}
										description={t('general.roleVisibility.description', {
											ns: 'campaign.form.general',
										})}
									>
										<CampaignRoleVisibilitySelector
											value={form.values.roleIds ?? []}
											onChange={(roleIds) =>
												form.setFieldValue('roleIds', roleIds)
											}
											label={t('general.roleVisibility.label', {
												ns: 'campaign.form.general',
											})}
											description={t(
												'general.roleVisibility.fieldDescription',
												{
													ns: 'campaign.form.general',
												}
											)}
											placeholder={t('general.roleVisibility.placeholder', {
												ns: 'campaign.form.general',
											})}
											hint={t('general.roleVisibility.hint', {
												ns: 'campaign.form.general',
											})}
											disabled={isCampaignRolesLoading || isCampaignRolesError}
										/>
									</SectionCard>
									<StickySaveActions
										label={saveLabel}
										loadingLabel={savingLabel}
										isLoading={isUpdatingLight}
										disabled={!form.isDirty() || isGeneralRoleSaveBlocked}
									/>
								</form>
							)}
							{selectedTab === 'agents' && <AgentSection />}
							{selectedTab === 'outcomes' && <DispositionSection />}
							{selectedTab === 'do-not-call' && (
								<DoNotCallSection campaignId={campaign?.id} />
							)}
							{selectedTab === 'params' && (
								<ParametersSection
									campaignId={campaign?.id}
									onCalculate={() =>
										modals.open({
											title: t('form.schedulerCalculator.title'),
											fullScreen: true,
											children: <SchedulerCalculator />,
										})
									}
								/>
							)}
							{selectedTab === 'analytics' && (
								<form
									onSubmit={form.onSubmit((values) => {
										if (isVersioningEnabled) {
											setPendingAgentValues(values);
											setReviewModalOpen(true);
										} else {
											void handleSubmit(values);
										}
									})}
								>
									<AnalyticsSection />
									<StickySaveActions
										label={saveLabel}
										loadingLabel={savingLabel}
										isLoading={isUpdating}
										disabled={!form.isDirty()}
									/>
								</form>
							)}
							{selectedTab === 'dashboards' && (
								<DashboardSection
									campaignId={campaign?.id}
									attributeMetricKeys={attributeMetricKeys}
								/>
							)}
							{selectedTab === 'voices' && campaign?.id && (
								<form
									onSubmit={form.onSubmit((values) =>
										handleSubmit(values, true)
									)}
								>
									<VoicesSection />
									<StickySaveActions
										label={saveLabel}
										loadingLabel={savingLabel}
										isLoading={isUpdatingLight}
										disabled={!form.isDirty()}
									/>
								</form>
							)}
						</Stack>
					</ContentContainer>
					<AgentSaveReviewModal
						opened={reviewModalOpen}
						onClose={() => setReviewModalOpen(false)}
						publishedSnapshot={
							campaign?.agentConfig as AgentVersionSnapshot | undefined
						}
						currentSnapshot={
							pendingAgentValues?.agentConfig as
								| AgentVersionSnapshot
								| undefined
						}
						onPublish={(desc) => {
							setReviewModalOpen(false);
							if (pendingAgentValues) {
								void handleSubmit(pendingAgentValues, false, desc);
							}
						}}
						isPublishing={isUpdating || isCreating}
					/>
					<AppDrawer
						opened={isSettingsDrawerOpen && Boolean(settingsDrawerContent)}
						onClose={() => setIsSettingsDrawerOpen(false)}
						title={settingsDrawerTitle}
						size='lg'
						keepMounted
					>
						{settingsDrawerContent}
					</AppDrawer>
				</CampaignFormProvider>
			</CampaignAgentEditorContext.Provider>
		</CampaignIdContext.Provider>
	);
};
