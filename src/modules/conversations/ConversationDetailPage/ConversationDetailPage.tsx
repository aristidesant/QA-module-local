import { useMemo, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router';
import {
	Badge,
	Button,
	Center,
	Divider,
	Group,
	Loader,
	Stack,
	Text,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowUp,
	IconHeadphones,
	IconMessages,
	IconPdf,
	IconPhoneCall,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import ContentContainer from '~/components/ContentContainer';
import AccessDenied from '~/components/AccessDenied';
import SectionCard from '~/components/SectionCard/SectionCard';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useGetConversation,
	useExportConversationPdf,
	useExportConversationAudio,
} from '~/queries/conversationsQueries';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type { TranscriptContent } from '~/models/ConversationsModels';

import { TranscriptViewer } from '~/modules/conversations/TranscriptViewer';
import ConversationNavigator from '~/modules/conversations/ConversationNavigator';
import { TranscriptPlayerBar } from '~/modules/conversations/TranscriptViewer/TranscriptPlayerBar/TranscriptPlayerBar';
import ConversationOverviewCard from '~/modules/conversations/ConversationOverviewCard';
import ConversationCapturedVariables from '~/modules/conversations/ConversationCapturedVariables';
import ConversationTechnicalOverview from '~/modules/conversations/ConversationTechnicalOverview';
import { buildWorkflowNodeLabelMaps } from '~/modules/conversations/utils/workflowNodeLabels';

import styles from './ConversationDetailPage.module.css';

dayjs.extend(relativeTime);

const getValueOrEmpty = (value: string | undefined | unknown) => {
	return value || '';
};

interface ConversationDetailPageProps {
	conversationId?: string;
	onBack?: () => void;
	conversationIds?: number[];
	onNavigate?: (id: number) => void;
}

export function ConversationDetailPage({
	conversationId: conversationIdProp,
	onBack: onBackProp,
	conversationIds,
	onNavigate,
}: ConversationDetailPageProps = {}) {
	const params = useParams<{ id: string }>();
	const id = conversationIdProp ?? params.id;
	const { t, i18n } = useTranslation(['conversations', 'common']);

	const { canAccessModule, canPerformAction } = usePermissions();
	const canViewConversations = canAccessModule(ModuleEnum.CONVERSATIONS);
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);

	const { data: conversation, isLoading } = useGetConversation(id || '');
	const campaignId =
		conversation?.campaignId ?? conversation?.campaign?.id ?? 0;
	const { data: campaignAgents } = useGetCampaignAgents(
		campaignId,
		Boolean(campaignId)
	);

	const exportConversationMutation = useExportConversationPdf();
	const exportAudioMutation = useExportConversationAudio();

	const [showBackToTop, setShowBackToTop] = useState(false);
	const [audioCurrentTime, setAudioCurrentTime] = useState(0);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);
	const transcriptPanelRef = useRef<HTMLDivElement>(null);
	const seekToRef = useRef<((time: number) => void) | null>(null);

	const handlePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setShowBackToTop(e.currentTarget.scrollTop > 200);
	}, []);

	const scrollToTop = useCallback(() => {
		transcriptPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const handleSeekToTime = useCallback((time: number) => {
		seekToRef.current?.(time);
	}, []);

	const handleBack = useCallback(() => {
		if (onBackProp) {
			onBackProp();
		}
	}, [onBackProp]);

	// --- Derived data ---

	const duration = useMemo(() => {
		const dur = conversation?.transcriptContent?.metadata?.call_duration_secs;
		return typeof dur === 'number' && !isNaN(dur) && dur > 0 ? dur : undefined;
	}, [conversation?.transcriptContent]);

	const status = conversation?.status || '';
	const transcriptContent = conversation?.transcriptContent;

	const { nodeLabels, nodeLabelsByAgent } = useMemo(
		() =>
			buildWorkflowNodeLabelMaps({
				campaignAgents,
				embeddedCampaignAgents: conversation?.campaign?.agents,
				conversationAgent: conversation?.agent,
			}),
		[campaignAgents, conversation?.agent, conversation?.campaign?.agents]
	);

	const safeTranscriptContent: TranscriptContent = transcriptContent || {
		transcript: [],
		metadata: {
			cost: 0,
			feedback: { likes: 0, dislikes: 0, overall_score: null },
			call_duration_secs: 0,
			termination_reason: '',
			start_time_unix_secs: 0,
		},
		analysis: {
			call_successful: '',
			transcript_summary: '',
			data_collection_results: {},
			evaluation_criteria_results: {},
		},
		conversationInitiationClientData: {
			dynamic_variables: {},
			custom_llm_extra_body: {},
			conversation_config_override: {},
		},
	};

	// --- Formatting helpers ---

	const formatDateShort = (dateString: string) => {
		try {
			const d = new Date(dateString);
			return d.toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
		} catch {
			return t('overview.fallbacks.invalidDate');
		}
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return '';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}${t('units.minute', { ns: 'common' })}${remainingSeconds > 0 ? ` ${remainingSeconds}${t('units.second', { ns: 'common' })}` : ''}`;
	};

	const getStatusBadge = (statusValue: string) => {
		if (statusValue.includes('done'))
			return { color: 'green' as const, label: t('overview.status.done') };
		if (statusValue.includes('progress'))
			return { color: 'blue' as const, label: t('overview.status.inProgress') };
		if (statusValue.includes('failed') || statusValue.includes('error'))
			return { color: 'red' as const, label: t('overview.status.failed') };
		return { color: 'gray' as const, label: t('overview.status.pending') };
	};

	const statusBadge = getStatusBadge(status);

	const contactName = conversation?.externalPhoneNumber
		? t('overview.demoContact')
		: `${getValueOrEmpty(conversation?.contact?.firstName)} ${getValueOrEmpty(conversation?.contact?.lastName)}`.trim();

	const contactPhone = String(
		conversation?.contact?.phoneNumber ||
			conversation?.contactPhoneNumber ||
			conversation?.externalPhoneNumber ||
			''
	);

	const agentName = conversation?.agent?.name
		? String(conversation.agent.name)
		: t('overview.fallbacks.unassigned');

	const campaignName = conversation?.campaign?.name
		? String(conversation.campaign.name)
		: t('overview.fallbacks.na');

	const metadata = transcriptContent?.metadata;
	const terminationReason = metadata?.termination_reason;

	const formatTermination = (reason?: string | null) => {
		if (!reason) return t('overview.termination.unknown');
		const r = reason.toLowerCase();
		if (r.includes('terminated_by') || r.includes('terminated'))
			return t('overview.termination.terminated');
		if (r.includes('client') && r.includes('disconnect'))
			return t('overview.termination.clientDisconnected');
		if (r.includes('hangup')) return t('overview.termination.hangup');
		if (r.includes('timeout')) return t('overview.termination.timeout');
		if (r.includes('error')) return t('overview.termination.error');
		return reason.charAt(0).toUpperCase() + reason.slice(1);
	};

	const dateValue = conversation?.startDate
		? formatDateShort(conversation.startDate)
		: '';
	const durationStr = formatDuration(duration);
	const dateDisplay = durationStr ? `${dateValue} · ${durationStr}` : dateValue;

	const terminationLabel =
		terminationReason !== undefined
			? formatTermination(terminationReason)
			: undefined;

	const transcriptSummary =
		transcriptContent?.analysis?.transcript_summary || '';
	const capturedVariables =
		transcriptContent?.analysis?.data_collection_results;

	const turnCount = safeTranscriptContent.transcript.length;

	// --- PDF export ---

	const handleExportPdf = async () => {
		if (!canExportConversations || !conversation) return;

		try {
			const language = i18n.language === 'es' ? 'es' : 'en';
			const result = await exportConversationMutation.mutateAsync({
				id: conversation.id,
				language,
			});
			const url = window.URL.createObjectURL(result.blob);
			const link = document.createElement('a');
			link.href = url;
			const firstName = conversation.contact?.firstName || '';
			const lastName = conversation.contact?.lastName || '';
			const fullName = `${firstName} ${lastName}`.trim();
			const filename = fullName
				? `${fullName.toUpperCase()}.PDF`
				: `conversation-${conversation.id}.pdf`;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			notifications.show({
				title: t('overview.notifications.exportSuccess'),
				message: t('overview.notifications.exportSuccessMsg'),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('overview.notifications.exportFailed'),
				message: t('overview.notifications.exportFailedMsg'),
				color: 'red',
			});
		}
	};

	// --- Audio export ---

	const handleExportAudio = async () => {
		if (!canExportConversations || !conversation) return;

		try {
			const result = await exportAudioMutation.mutateAsync(conversation.id);
			const url = URL.createObjectURL(result.blob);
			const link = document.createElement('a');
			link.href = url;
			const filename = contactName
				? `${contactName.toUpperCase()}.MP3`
				: `conversation-${conversation.id}.mp3`;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch {
			notifications.show({
				title: t('overview.notifications.exportFailed'),
				message: t('overview.notifications.exportFailedMsg'),
				color: 'red',
			});
		}
	};

	// --- Loading / access states ---

	if (isLoading) {
		return (
			<ContentContainer
				title={t('detailPage.title')}
				showBackButton
				onBackClick={handleBack}
				contentWidth='centered'
			>
				<Center p='xl'>
					<Loader size='lg' color='var(--mantine-primary-color-filled)' />
				</Center>
			</ContentContainer>
		);
	}

	if (!canViewConversations) {
		return <AccessDenied description={t('list.accessDenied')} />;
	}

	if (!conversation) {
		return (
			<ContentContainer
				title={t('detailPage.title')}
				showBackButton
				onBackClick={handleBack}
				contentWidth='centered'
			>
				<Center p='xl'>
					<Text c='dimmed'>{t('detailPage.notFound')}</Text>
				</Center>
			</ContentContainer>
		);
	}

	// --- Navigation state ---

	const currentIndex =
		conversationIds && conversationIds.length > 0
			? conversationIds.indexOf(Number(id))
			: -1;
	const hasList = currentIndex !== -1;

	// --- Header elements ---

	const headerTitle = (
		<Group gap='xs' align='center'>
			<Text fw={500} size='sm' className={styles.identifierText}>
				{conversation.identifier || `#${conversation.id}`}
			</Text>
			<Badge size='sm' variant='light' color={statusBadge.color}>
				{statusBadge.label}
			</Badge>
		</Group>
	);

	const headerDescription = [
		contactPhone,
		dateValue,
		durationStr,
		agentName !== t('overview.fallbacks.unassigned') && agentName,
	]
		.filter(Boolean)
		.join(' · ');

	const titleRight = (
		<Group gap='xs' align='center'>
			{hasList && conversationIds && onNavigate && (
				<>
					<ConversationNavigator
						currentIndex={currentIndex}
						total={conversationIds.length}
						onPrev={() => onNavigate(conversationIds[currentIndex - 1])}
						onNext={() => onNavigate(conversationIds[currentIndex + 1])}
					/>
					<Divider orientation='vertical' />
				</>
			)}
			{canExportConversations && conversation?.voiceFile && (
				<Button
					size='xs'
					variant='light'
					leftSection={<IconHeadphones size={14} />}
					loading={exportAudioMutation.isPending}
					onClick={handleExportAudio}
				>
					{t('overview.downloadAudio')}
				</Button>
			)}
			{canExportConversations && (
				<Button
					size='xs'
					variant='light'
					leftSection={<IconPdf size={14} />}
					loading={exportConversationMutation.isPending}
					onClick={handleExportPdf}
				>
					{t('overview.downloadTranscript')}
				</Button>
			)}
		</Group>
	);

	// --- Main content ---

	return (
		<ContentContainer
			title={headerTitle}
			description={headerDescription}
			showBackButton
			onBackClick={handleBack}
			titleRight={titleRight}
			titleIcon={<IconPhoneCall size={18} />}
			contentWidth='centered'
			mainScroll={false}
		>
			<div className={styles.contentGrid}>
				{/* Transcript column */}
				<div className={styles.transcriptCol}>
					<SectionCard
						title={t('detailPage.transcriptSection')}
						icon={IconMessages}
						headerActions={
							turnCount > 0 ? (
								<Badge size='xs' variant='light' color='gray'>
									{t('detailPage.turnCount', { count: turnCount })}
								</Badge>
							) : undefined
						}
						padding='sm'
						contentSpacing={0}
						className={styles.transcriptCard}
						shellClassName={styles.transcriptCardShell}
						bodyClassName={styles.transcriptCardBody}
						contentClassName={styles.transcriptContent}
					>
						{/* Transcript Messages — scrollable middle */}
						<div
							ref={transcriptPanelRef}
							className={styles.transcriptScroll}
							onScroll={handlePanelScroll}
						>
							<TranscriptViewer
								transcript={safeTranscriptContent.transcript}
								audioCurrentTime={audioCurrentTime}
								isAudioPlaying={isAudioPlaying}
								onSeekToTime={handleSeekToTime}
								nodeLabels={nodeLabels}
								nodeLabelsByAgent={nodeLabelsByAgent}
								showMetrics={true}
							/>
							<Tooltip label={t('details.backToTop')} position='left'>
								<ActionIcon
									variant='filled'
									size='lg'
									radius='xl'
									aria-label={t('details.backToTop')}
									onClick={scrollToTop}
									className={`${styles.backToTop} ${showBackToTop ? styles.backToTopVisible : ''}`}
								>
									<IconArrowUp size={18} />
								</ActionIcon>
							</Tooltip>
						</div>

						{/* Mini player bar — pinned bottom */}
						{conversation.voiceFile && (
							<div className={styles.playerBarWrapper}>
								<TranscriptPlayerBar
									voiceFile={conversation.voiceFile}
									onTimeUpdate={setAudioCurrentTime}
									onPlayStateChange={setIsAudioPlaying}
									seekToRef={seekToRef}
								/>
							</div>
						)}
					</SectionCard>
				</div>

				{/* Right column — 7: summary → player → overview → disposition → variables */}
				<div className={styles.rightCol}>
					<Stack gap='xs'>
						{transcriptSummary && (
							<SectionCard
								title={t('overview.summary.title')}
								icon={IconMessages}
								description={t('overview.summary.description')}
								padding='sm'
								contentSpacing='sm'
							>
								<div className={styles.summaryBlock}>
									<Text className={styles.summaryText}>
										{(i18n.language === 'es'
											? conversation.summary?.es
											: conversation.summary?.en) ||
											conversation.summary?.en ||
											conversation.summary?.es ||
											transcriptSummary}
									</Text>
								</div>
							</SectionCard>
						)}
						<ConversationOverviewCard
							contactName={contactName || t('overview.fallbacks.na')}
							contactPhone={contactPhone}
							statusLabel={statusBadge.label}
							statusColor={statusBadge.color}
							dateDisplay={dateDisplay}
							agentName={agentName}
							campaignName={campaignName}
							campaignId={campaignId}
							conversationStatus={status}
							terminationReasonLabel={terminationLabel}
							conversationId={String(conversation.id)}
						/>
						<ConversationCapturedVariables variables={capturedVariables} />
						<ConversationTechnicalOverview
							transcriptContent={transcriptContent}
						/>
					</Stack>
				</div>
			</div>
		</ContentContainer>
	);
}

export default ConversationDetailPage;
