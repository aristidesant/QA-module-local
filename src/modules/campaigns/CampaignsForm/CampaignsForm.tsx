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
import {
	useCreateCampaign,
	useUpdateCampaign,
	useUpdateCampaignLight,
	useAssignCampaignObjective,
} from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import { validateWorkflow } from './WorkflowSection/utils/workflowValidation';
import {
	CampaignFormProvider,
	CampaignIdContext,
	useCampaignForm,
} from '../campaignFormFunctions';
import CampaignTabs from '../CampaignTabs';
import { useCampaignsStore } from '~/stores/campaignsStore';
import GeneralSection from './GeneralSection/GeneralSection';
import SectionCard from '~/components/SectionCard';
import ParametersSection from './ParametersSection';
import AnalyticsSection from './AnalyticsSection';
import WorkflowSection from './WorkflowSection/WorkflowSection';
import AgentSection from './AgentSection';
import DispositionSection from './DispositionSection';
import DoNotCallSection from './DoNotCallSection';
import ReportValuesSection from './ReportValuesSection/ReportValuesSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignStatus } from '~/models/CampaignStatus';
import { modals } from '@mantine/modals';
import { IconEye } from '@tabler/icons-react';
import SchedulerCalculator from './ParametersSection/SchedulerCalculator';
import FormSaveButton from '~/components/FormSaveButton';
import CampaignSyncButton from './components/CampaignSyncButton';
import AgentSectionRightPanel from './AgentSection/AgentSectionRightPanel';
import GeneralSectionRightPanel from './GeneralSection/GeneralSectionRightPanel';
import AppDrawer from '~/components/AppDrawer';
import DashboardSection from './DashboardSection';
import VersioningSection from './VersioningSection';
import styles from './CampaignsForm.module.css';
import { getDataCollectionFromAgentConfig } from './AnalyticsSection/analyticsFormContext';

interface CampaignsFormProps {
	campaign?: Partial<Campaign>;
	loading?: boolean;
	onBack?: () => void;
}

const campaignFormTabNamespaces: Record<string, string> = {
	general: 'campaign.form.general',
	agents: 'campaign.form.agents',
	workflow: 'campaign.form.workflow',
	outcomes: 'campaign.form.outcomes',
	'do-not-call': 'campaign.form.do-not-call',
	params: 'campaign.form.params',
	analytics: 'campaign.form.analytics',
	dashboards: 'campaign.form.dashboards',
	'report-values': 'campaign.form.report-values',
	versioning: 'campaign.form.versioning',
};

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
	const { selectedTab, rightComponent, resetView } = useCampaignsStore(
		(state) => state
	);
	const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
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

	// Check if we have the workflow data ready for existing campaigns
	const isNewCampaign = !campaign?.id;
	const hasWorkflowData =
		campaign?.agentConfig?.workflow?.nodes &&
		Object.keys(campaign.agentConfig.workflow.nodes).length > 0;
	const isDataReady = isNewCampaign || hasWorkflowData;

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
			clientId: campaign?.clientId ?? 0,
			tags: campaign?.tags || [],
			workingHours: campaign?.workingHours || defaultWorkingHours,
			noiseCancellation: campaign?.noiseCancellation,
			agentConfig: campaign?.agentConfig || {},
			defaultMaxWaves: campaign?.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign?.defaultWaveExecutionDelaySeconds ?? 0,
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

		const campaignWorkflowCounts = getWorkflowCounts(
			campaign.agentConfig?.workflow
		);
		console.log('[CampaignsForm] incoming campaign workflow', {
			campaignId: campaign.id,
			nodes: campaignWorkflowCounts.nodes,
			edges: campaignWorkflowCounts.edges,
			hasWorkflow: Boolean(campaign.agentConfig?.workflow),
		});

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
			clientId: campaign.clientId ?? 0,
			tags: campaign.tags || [],
			workingHours: campaign.workingHours || defaultWorkingHours,
			noiseCancellation: campaign.noiseCancellation,
			agentConfig: campaign.agentConfig || {},
			defaultMaxWaves: campaign.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign.defaultWaveExecutionDelaySeconds ?? 0,
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
		console.log('[CampaignsForm] after setValues - workflow snapshot', {
			campaignId: campaign.id,
			stateNodes: stateWorkflowCounts.nodes,
			stateEdges: stateWorkflowCounts.edges,
			getterNodes: getterWorkflowCounts.nodes,
			getterEdges: getterWorkflowCounts.edges,
		});
	}, [campaign?.id, campaign?.agentConfig?.workflow, campaign?.updatedAt]);

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
		if (selectedTab !== 'outcomes') return;
		setIsSettingsDrawerOpen(Boolean(rightComponent));
	}, [selectedTab, rightComponent]);

	const settingsDrawerTitle = t('form.settingsDrawer.title');
	const openSettingsDrawer = () => {
		setIsSettingsDrawerOpen(true);
	};

	const settingsDrawerContent =
		selectedTab === 'general' ? (
			<GeneralSectionRightPanel />
		) : selectedTab === 'agents' ? (
			<AgentSectionRightPanel />
		) : selectedTab === 'outcomes' ? (
			rightComponent
		) : null;

	const handleSubmit = async (
		value: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>,
		isLight = false
	) => {
		if (form.validate().hasErrors) {
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
			// Clean up toolIds from agentConfig before sending
			const cleanedValue = { ...value };
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

			// Prepare data for light update (excludes agentConfig)
			const dataToSend = isLight
				? (({ agentConfig, ...rest }) => rest)(cleanedValue)
				: cleanedValue;

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
			// Mark the form as clean so the Save button disables after a
			// successful save. The snapshot is updated to the current values,
			// which will match the data returned by the subsequent React Query
			// refetch triggered by invalidateQueries above.
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
			<CampaignFormProvider form={form}>
				<ContentContainer
					contentWidth={selectedTab === 'workflow' ? 'full' : 'centered'}
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
										onClick={() => navigate(`/campaign/view/${campaign.id}`)}
									>
										<IconEye size={20} />
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
							<CampaignTabs />
						</Box>
						{selectedTab === 'general' && (
							<form
								onSubmit={form.onSubmit((values) => handleSubmit(values, true))}
							>
								<GeneralSection onOpenSettings={openSettingsDrawer} />
								<StickySaveActions
									label={saveLabel}
									loadingLabel={savingLabel}
									isLoading={isUpdatingLight}
									disabled={!form.isDirty()}
								/>
							</form>
						)}
						{selectedTab === 'agents' && (
							<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
								<AgentSection onOpenSettings={openSettingsDrawer} />
								<StickySaveActions
									label={saveLabel}
									loadingLabel={savingLabel}
									isLoading={isUpdating}
									disabled={!form.isDirty()}
								/>
							</form>
						)}
						{selectedTab === 'workflow' && (
							<>
								{!isDataReady && campaign?.id ? (
									<SectionCard
										title={t('form.workflow.section.title')}
										description={t('form.workflow.loadingDescription', {
											defaultValue: 'Loading workflow data...',
										})}
									>
										<LoadingOverlay visible />
									</SectionCard>
								) : (
									<form
										onSubmit={form.onSubmit((values) => handleSubmit(values))}
									>
										<WorkflowSection />
										<StickySaveActions
											label={saveLabel}
											loadingLabel={savingLabel}
											isLoading={isUpdating}
											disabled={!form.isDirty()}
										/>
									</form>
								)}
							</>
						)}
						{selectedTab === 'outcomes' && <DispositionSection />}
						{selectedTab === 'do-not-call' && (
							<DoNotCallSection campaignId={campaign?.id} />
						)}
						{selectedTab === 'params' && (
							<SectionCard
								title={t('workingHours.title')}
								description={t('workingHours.description')}
								onCalculate={() =>
									modals.open({
										title: t('form.schedulerCalculator.title'),
										fullScreen: true,
										children: <SchedulerCalculator />,
									})
								}
							>
								<ParametersSection
									workingHours={form.values.workingHours || {}}
									onChange={(day, field, value) => {
										const updatedHours = { ...form.values.workingHours };
										updatedHours[day] = {
											...updatedHours[day],
											[field]: value,
										};
										form.setFieldValue('workingHours', updatedHours);
									}}
									onCopyToAll={(sourceDay) => {
										const sourceHours = form.values.workingHours?.[sourceDay];
										if (!sourceHours) return;

										const updatedHours = { ...form.values.workingHours };
										Object.keys(updatedHours).forEach((day) => {
											updatedHours[day] = { ...sourceHours };
										});
										form.setFieldValue('workingHours', updatedHours);
									}}
								/>
							</SectionCard>
						)}
						{selectedTab === 'report-values' && <ReportValuesSection />}
						{selectedTab === 'analytics' && (
							<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
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
						{selectedTab === 'versioning' && (
							<VersioningSection campaign={campaign} />
						)}
					</Stack>
				</ContentContainer>
				<AppDrawer
					opened={isSettingsDrawerOpen && Boolean(settingsDrawerContent)}
					onClose={() => setIsSettingsDrawerOpen(false)}
					title={settingsDrawerTitle}
					size='lg'
				>
					{settingsDrawerContent}
				</AppDrawer>
			</CampaignFormProvider>
		</CampaignIdContext.Provider>
	);
};
