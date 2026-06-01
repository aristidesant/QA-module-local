import { Alert, Button, Flex, Group, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconDeviceFloppy,
	IconFlask,
} from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	useNavigate,
	useOutlet,
	useOutletContext,
	useParams,
} from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import type { Campaign } from '~/models/CampaignsModel';
import type { AgentVersionSnapshot } from '~/models/AgentVersioningModel';
import type { UpdateCampaignAgentConfigPayload } from '~/models/CampaignAgentModel';
import {
	CampaignAgentEditorContext,
	CampaignFormProvider,
	CampaignIdContext,
	useCampaignForm,
	type SelectedAgentDraft,
} from '../campaignFormFunctions';
import { useGetAgent } from '~/queries/agentQueries';
import {
	useGetCampaignAgent,
	useUpdateCampaignAgentConfig,
} from '~/queries/campaignAgentsQueries';
import { useGetAgentVersioningStatus } from '~/queries/agentVersioningQueries';
import AgentSaveReviewModal from '../CampaignsForm/AgentSaveReviewModal';
import CampaignSyncButton from '../CampaignsForm/components/CampaignSyncButton';
import AgentDetailTabs, { type AgentTabValue } from './AgentDetailTabs';
import type { WorkflowSaveRequest } from '../CampaignsForm/WorkflowSection/WorkflowSection';
import styles from './AgentDetailPage.module.css';

type AgentSaveSurface = 'setup' | 'workflow';

interface PendingAgentSaveRequest {
	source: AgentSaveSurface;
	updateData: UpdateCampaignAgentConfigPayload;
	reviewSnapshot: AgentVersionSnapshot;
}

const AgentDetailPage = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const navigate = useNavigate();
	const campaign = useOutletContext<Campaign>();
	const childOutlet = useOutlet();
	const { campaignAgentId } = useParams<{ campaignAgentId: string }>();
	const campaignId = campaign?.id;
	const parsedCampaignAgentId = campaignAgentId ? Number(campaignAgentId) : 0;

	const {
		data: campaignAgent,
		dataUpdatedAt: campaignAgentUpdatedAt,
		isLoading: isAgentLoading,
		refetch: refetchCampaignAgent,
	} = useGetCampaignAgent(campaignId ?? 0, parsedCampaignAgentId);
	const {
		data: selectedAgent,
		dataUpdatedAt: selectedAgentUpdatedAt,
	} = useGetAgent(campaignAgent?.agentId ?? '');
	const activeAgentId = campaignAgent?.agentId ?? '';
	useGetAgentVersioningStatus(activeAgentId);
	const campaignDetailPath = campaignId
		? `/campaign/${campaignId}`
		: '/campaigns';

	const [selectedCampaignAgentId, setSelectedCampaignAgentId] = useState<
		number | null
	>(parsedCampaignAgentId || null);
	const [selectedAgentDraft, setSelectedAgentDraft] =
		useState<SelectedAgentDraft | null>(null);
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<AgentTabValue>('setup');
	const [pendingSaveRequest, setPendingSaveRequest] =
		useState<PendingAgentSaveRequest | null>(null);
	const hydratedAgentConfigAtRef = useRef<number | null>(null);

	const selectedCampaignAgent = campaignAgent ?? null;

	useEffect(() => {
		if (campaignAgent) {
			setSelectedCampaignAgentId(campaignAgent.id);
		}
	}, [campaignAgent]);

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
		campaignAgentUpdatedAt,
		selectedAgentUpdatedAt,
		selectedCampaignAgent?.id,
		selectedCampaignAgent?.agentId,
	]);

	const updateSelectedAgentDraft = (patch: Partial<SelectedAgentDraft>) => {
		setSelectedAgentDraft((current) =>
			current ? { ...current, ...patch } : current
		);
	};

	const closeReviewModal = useCallback(() => {
		setReviewModalOpen(false);
		setPendingSaveRequest(null);
	}, []);

	const form = useCampaignForm({
		initialValues: {
			name: campaign?.name || '',
			agentName: campaign?.agentName || '',
			configId: selectedAgent?.configId || campaign?.configId || '',
			description: campaign?.description || '',
			budget: campaign?.budget ?? 0,
			spent: campaign?.spent ?? 0,
			type: campaign?.type || 'OUTBOUND',
			status: campaign?.status || ('INACTIVE' as const),
			userId: campaign?.userId ?? 0,
			clientId: campaign?.clientId ?? 0,
			tags: campaign?.tags || [],
			workingHours: campaign?.workingHours || {},
			noiseCancellation: campaign?.noiseCancellation,
			agentConfig: selectedAgent?.config ?? {},
			dataCollectionVariables: campaign?.dataCollectionVariables ?? [],
			defaultMaxWaves: campaign?.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign?.defaultWaveExecutionDelaySeconds ?? 0,
			roleIds: campaign?.roleIds ?? [],
		},
	});

	useEffect(() => {
		if (!selectedAgent) return;
		if (hydratedAgentConfigAtRef.current === selectedAgentUpdatedAt) return;

		hydratedAgentConfigAtRef.current = selectedAgentUpdatedAt;

		form.setValues((current) => ({
			...current,
			configId: selectedAgent.configId || current.configId,
			agentConfig: selectedAgent.config ?? {},
		}));
		form.resetDirty();
	}, [selectedAgentUpdatedAt, form, selectedAgent]);

	const updateCampaignAgentConfig = useUpdateCampaignAgentConfig();

	const agentName =
		selectedCampaignAgent?.agent?.name || selectedCampaignAgent?.agentId || '';
	const pageTitle = campaign?.name
		? `${campaign.name} - ${agentName || t('agentDetail.page.title')}`
		: agentName || t('agentDetail.page.title');
	const pageDescription = t('agentDetail.page.description');

	const submitSaveRequest = useCallback(
		async (
			request: PendingAgentSaveRequest,
			versionDescription?: string
		) => {
			if (!campaignId || !selectedCampaignAgent) return;

			const updateData =
				versionDescription !== undefined
					? {
							...request.updateData,
							versionDescription,
						}
					: request.updateData;

			try {
				await updateCampaignAgentConfig.mutateAsync({
					campaignId,
					id: selectedCampaignAgent.id,
					updateData,
				});
				notifications.show({
					color: 'green',
					message: t('form.agent.selector.saved'),
				});
				if (request.source === 'setup') {
					form.resetDirty();
				}
			} catch {
				notifications.show({
					color: 'red',
					message: t('form.agent.selector.saveError'),
				});
			}
		},
		[campaignId, form, selectedCampaignAgent, t, updateCampaignAgentConfig]
	);

	const queueSaveRequest = useCallback(
		(request: PendingAgentSaveRequest) => {
			setPendingSaveRequest(request);
			setReviewModalOpen(true);
		},
		[]
	);

	const handleSaveClick = () => {
		queueSaveRequest({
			source: 'setup',
			updateData: {
				config: form.values.agentConfig,
				versionDescription: form.values.versionDescription,
			},
			reviewSnapshot: form.values.agentConfig as AgentVersionSnapshot,
		});
	};

	const handleWorkflowSaveRequest = useCallback(
		(request: WorkflowSaveRequest) => {
			queueSaveRequest({
				source: 'workflow',
				...request,
			});
		},
		[queueSaveRequest]
	);

	const handlePublish = async (desc: string) => {
		const request = pendingSaveRequest;
		closeReviewModal();

		if (!request) return;

		await submitSaveRequest(request, desc);
	};

	const handleOpenTestConvai = () => {
		if (!campaignId || !selectedCampaignAgent) return;

		navigate(
			`/campaign/${campaignId}/agent/${selectedCampaignAgent.id}/test/${selectedCampaignAgent.agentId}`
		);
	};

	if (isAgentLoading) {
		return (
			<ContentContainer
				title={t('agentDetail.page.title')}
				description={pageDescription}
				showBackButton
				onBackClick={() => navigate(campaignDetailPath)}
			>
				<Flex justify='center' align='center' className={styles.loadingState}>
					<Loader size='md' />
					<Text size='sm' c='dimmed'>
						{t('form.agent.detail.loading')}
					</Text>
				</Flex>
			</ContentContainer>
		);
	}

	if (!selectedCampaignAgent) {
		return (
			<ContentContainer
				title={t('agentDetail.page.title')}
				description={pageDescription}
				showBackButton
				onBackClick={() => navigate(campaignDetailPath)}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title={t('form.agent.detail.missingAgent')}
					color='red'
					variant='light'
				>
					<Text size='sm' c='dimmed'>
						{t('form.agent.detail.missingAgent')}
					</Text>
				</Alert>
			</ContentContainer>
		);
	}

	if (childOutlet) {
		return <>{childOutlet}</>;
	}

	const headerActions = (
		<Group gap='xs' wrap='wrap' justify='flex-end'>
			<CampaignSyncButton
				agents={[
					{
						agentId: selectedCampaignAgent.agentId,
						agentName:
							selectedCampaignAgent.agent?.name || selectedCampaignAgent.agentId,
					},
				]}
				selectedAgentId={selectedCampaignAgent.agentId}
				onSynced={async () => {
					await refetchCampaignAgent();
				}}
			/>
		</Group>
	);

	const saveButton = (
		<Button
			leftSection={<IconDeviceFloppy size={16} />}
			size='sm'
			variant='light'
			onClick={handleSaveClick}
			loading={updateCampaignAgentConfig.isPending}
			disabled={!form.isDirty()}
		>
			{updateCampaignAgentConfig.isPending
				? t('form.agent.selector.saving')
				: t('form.agent.selector.save')}
		</Button>
	);

	const testButton = (
		<Button
			leftSection={<IconFlask size={16} />}
			size='sm'
			variant='light'
			onClick={handleOpenTestConvai}
		>
			{t('form.actions.testConvai', { ns: 'campaign.detail' })}
		</Button>
	);

	return (
		<CampaignIdContext.Provider value={campaignId}>
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
						title={pageTitle}
						description={pageDescription}
						showBackButton
						onBackClick={() => navigate(campaignDetailPath)}
						titleRight={
							(
								<Group gap='xs' wrap='wrap' justify='flex-end'>
									{headerActions}
									{testButton}
									{activeTab !== 'workflow' ? saveButton : null}
								</Group>
							)
						}
					>
						<Stack gap='sm'>
							<AgentDetailTabs
								agentId={selectedCampaignAgent.agentId}
								value={activeTab}
								onChange={setActiveTab}
								onWorkflowSaveRequest={handleWorkflowSaveRequest}
								isWorkflowSavePending={updateCampaignAgentConfig.isPending}
							/>
						</Stack>
					</ContentContainer>
					<AgentSaveReviewModal
						opened={reviewModalOpen}
						onClose={closeReviewModal}
						publishedSnapshot={selectedAgent?.config as
							| AgentVersionSnapshot
							| undefined}
						currentSnapshot={pendingSaveRequest?.reviewSnapshot}
						onPublish={handlePublish}
						isPublishing={updateCampaignAgentConfig.isPending}
					/>
				</CampaignFormProvider>
			</CampaignAgentEditorContext.Provider>
		</CampaignIdContext.Provider>
	);
};

export default AgentDetailPage;
