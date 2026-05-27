import { Alert, Button, Flex, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import type { Campaign } from '~/models/CampaignsModel';
import type { AgentVersionSnapshot } from '~/models/AgentVersioningModel';
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
	useGetCampaignAgents,
	useUpdateCampaignAgentConfig,
} from '~/queries/campaignAgentsQueries';
import { useGetAgentVersioningStatus } from '~/queries/agentVersioningQueries';
import AgentSaveReviewModal from '../CampaignsForm/AgentSaveReviewModal';
import AgentDetailTabs, { type AgentTabValue } from './AgentDetailTabs';
import styles from './AgentDetailPage.module.css';

const AgentDetailPage = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const navigate = useNavigate();
	const campaign = useOutletContext<Campaign>();
	const { campaignAgentId } = useParams<{ campaignAgentId: string }>();
	const campaignId = campaign?.id;
	const parsedCampaignAgentId = campaignAgentId ? Number(campaignAgentId) : 0;

	const { data: campaignAgent, isLoading: isAgentLoading } =
		useGetCampaignAgent(campaignId ?? 0, parsedCampaignAgentId);
	const { data: selectedAgent } = useGetAgent(campaignAgent?.agentId ?? '');
	const { data: campaignAgents = [] } = useGetCampaignAgents(campaignId ?? 0);
	const firstAgentId = campaignAgents[0]?.agentId ?? '';
	const { data: agentRecord } = useGetAgentVersioningStatus(firstAgentId);
	const isVersioningEnabled = Boolean(agentRecord?.versioningEnabled);
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
	const [pendingAgentValues, setPendingAgentValues] = useState<{
		agentConfig: Record<string, unknown>;
		versionDescription?: string;
	} | null>(null);

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
		selectedAgent?.id,
		selectedCampaignAgent?.id,
		selectedCampaignAgent?.agentId,
	]);

	const updateSelectedAgentDraft = (patch: Partial<SelectedAgentDraft>) => {
		setSelectedAgentDraft((current) =>
			current ? { ...current, ...patch } : current
		);
	};

	const form = useCampaignForm({
		initialValues: {
			name: campaign?.name || '',
			agentName: campaign?.agentName || '',
			configId: campaign?.configId || '',
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

		form.setValues((current) => ({
			...current,
			agentConfig: selectedAgent.config ?? {},
		}));
		form.resetDirty();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAgent?.id]);

	const updateCampaignAgentConfig = useUpdateCampaignAgentConfig();

	const agentName =
		selectedCampaignAgent?.agent?.name || selectedCampaignAgent?.agentId || '';
	const pageTitle = campaign?.name
		? `${campaign.name} - ${agentName || t('agentDetail.page.title')}`
		: agentName || t('agentDetail.page.title');
	const pageDescription = t('agentDetail.page.description');

	const handleSaveAgent = async () => {
		if (!campaignId || !selectedCampaignAgent) return;

		try {
			await updateCampaignAgentConfig.mutateAsync({
				campaignId,
				id: selectedCampaignAgent.id,
				updateData: {
					config: form.values.agentConfig,
					versionDescription: form.values.versionDescription,
				},
			});
			notifications.show({
				color: 'green',
				message: t('form.agent.selector.saved'),
			});
			form.resetDirty();
		} catch {
			notifications.show({
				color: 'red',
				message: t('form.agent.selector.saveError'),
			});
		}
	};

	const handleSaveClick = () => {
		if (isVersioningEnabled) {
			setPendingAgentValues({
				agentConfig: form.values.agentConfig as Record<string, unknown>,
				versionDescription: form.values.versionDescription,
			});
			setReviewModalOpen(true);
		} else {
			void handleSaveAgent();
		}
	};

	const handlePublish = async (desc: string) => {
		setReviewModalOpen(false);
		if (!campaignId || !selectedCampaignAgent) return;

		try {
			await updateCampaignAgentConfig.mutateAsync({
				campaignId,
				id: selectedCampaignAgent.id,
				updateData: {
					config: pendingAgentValues?.agentConfig as Record<string, unknown>,
					versionDescription: desc,
				},
			});
			notifications.show({
				color: 'green',
				message: t('form.agent.selector.saved'),
			});
			form.resetDirty();
		} catch {
			notifications.show({
				color: 'red',
				message: t('form.agent.selector.saveError'),
			});
		}
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

	const selectedAgentBadgeLabel = selectedCampaignAgent.isPrincipal
		? t('form.agent.selector.principal')
		: t('form.agent.selector.subagent');

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
							activeTab === 'workflow' ? null : (
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
							)
						}
					>
						<Stack gap='sm'>
							<Text size='xs' c='dimmed' className={styles.metaText}>
								{selectedAgentBadgeLabel} · {selectedCampaignAgent.agentType}
							</Text>
							<AgentDetailTabs
								agentId={selectedCampaignAgent.agentId}
								value={activeTab}
								onChange={setActiveTab}
							/>
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
						onPublish={handlePublish}
						isPublishing={updateCampaignAgentConfig.isPending}
					/>
				</CampaignFormProvider>
			</CampaignAgentEditorContext.Provider>
		</CampaignIdContext.Provider>
	);
};

export default AgentDetailPage;
