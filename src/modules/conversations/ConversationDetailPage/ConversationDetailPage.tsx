import { useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Badge,
	Button,
	Center,
	Group,
	Loader,
	Stack,
	Text,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowUp,
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
import RightSectionCard from '~/components/RightSectionCard';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useGetConversation,
	useExportConversationPdf,
} from '~/queries/conversationsQueries';
import type { TranscriptContent } from '~/models/ConversationsModels';

import {
	TranscriptViewer,
	extractMissionSummary,
} from '~/modules/conversations/TranscriptViewer';
import TranscriptPlayerBar from '~/modules/conversations/TranscriptViewer/TranscriptPlayerBar';
import ConversationPlayer from '~/modules/conversations/ConversationPlayer';
import ConversationOverviewCard from '~/modules/conversations/ConversationOverviewCard';
import ConversationDisposition from '~/modules/conversations/ConversationDisposition';
import ConversationCapturedVariables from '~/modules/conversations/ConversationCapturedVariables';

import styles from './ConversationDetailPage.module.css';

dayjs.extend(relativeTime);

const getValueOrEmpty = (value: string | undefined | unknown) => {
	return value || '';
};

export function ConversationDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation(['conversations', 'common']);

	const { canAccessModule, canPerformAction } = usePermissions();
	const canViewConversations = canAccessModule(ModuleEnum.CONVERSATIONS);
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);

	const {
		data: conversation,
		isLoading,
		isFetching,
	} = useGetConversation(id || '');

	const exportConversationMutation = useExportConversationPdf();

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
		navigate('/conversations');
	}, [navigate]);

	// --- Derived data ---

	const duration = useMemo(() => {
		const dur = conversation?.transcriptContent?.metadata?.call_duration_secs;
		return typeof dur === 'number' && !isNaN(dur) && dur > 0 ? dur : undefined;
	}, [conversation?.transcriptContent]);

	const status = conversation?.status || '';
	const transcriptContent = conversation?.transcriptContent;

	const nodeLabels = useMemo<Record<string, string>>(() => {
		const nodes = conversation?.campaign?.agentConfig?.workflow?.nodes as
			| Record<string, { label?: string }>
			| undefined;
		if (!nodes) return {};
		return Object.fromEntries(
			Object.entries(nodes)
				.filter(([, node]) => node?.label)
				.map(([nodeId, node]) => [nodeId, node.label as string])
		);
	}, [conversation?.campaign?.agentConfig?.workflow?.nodes]);

	const nodeMissions = useMemo<Record<string, string>>(() => {
		const nodes = conversation?.campaign?.agentConfig?.workflow?.nodes as
			| Record<string, { additionalPrompt?: string | null }>
			| undefined;
		if (!nodes) return {};
		const result: Record<string, string> = {};
		for (const [nodeId, node] of Object.entries(nodes)) {
			if (!node?.additionalPrompt) continue;
			const summary = extractMissionSummary(node.additionalPrompt);
			if (summary) result[nodeId] = summary;
		}
		return result;
	}, [conversation?.campaign?.agentConfig?.workflow?.nodes]);

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
			t('overview.fallbacks.noPhone')
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

	// --- Loading / access states ---

	if (isLoading || isFetching) {
		return (
			<ContentContainer
				title={t('detailPage.title')}
				showBackButton
				onBackClick={handleBack}
				contentWidth='full'
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
				contentWidth='full'
			>
				<Center p='xl'>
					<Text c='dimmed'>{t('detailPage.notFound')}</Text>
				</Center>
			</ContentContainer>
		);
	}

	// --- Header elements ---

	const headerTitle = (
		<Group gap='xs' align='center'>
			<Text fw={600} size='sm' className={styles.identifierText}>
				{conversation.identifier || `#${conversation.id}`}
			</Text>
			<Badge size='sm' variant='light' color={statusBadge.color}>
				{statusBadge.label}
			</Badge>
		</Group>
	);

	const headerDescription = [
		contactPhone !== t('overview.fallbacks.noPhone') && contactPhone,
		dateValue,
		durationStr,
		agentName !== t('overview.fallbacks.unassigned') && agentName,
	]
		.filter(Boolean)
		.join(' · ');

	const titleRight = (
		<Group gap='xs'>
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

	// --- Right sidebar ---

	const rightSidebar = (
		<Stack gap='xs' className={styles.sidebarContent}>
			<ConversationPlayer
				voiceFile={conversation.voiceFile}
				title={t('player.title')}
				description={t('player.description')}
				paramConversationId={conversation.id}
				contactName={contactName}
			/>
			<ConversationOverviewCard
				contactName={contactName || t('overview.fallbacks.na')}
				contactPhone={contactPhone}
				statusLabel={statusBadge.label}
				statusColor={statusBadge.color}
				dateDisplay={dateDisplay}
				agentName={agentName}
				campaignName={campaignName}
				terminationReasonLabel={terminationLabel}
			/>
			<ConversationDisposition
				key={conversation.id}
				conversationId={String(conversation.id)}
			/>
			<ConversationCapturedVariables variables={capturedVariables} />
		</Stack>
	);

	// --- Main content ---

	return (
		<div className={styles.pageRoot}>
			<ContentContainer
				title={headerTitle}
				description={headerDescription}
				showBackButton
				onBackClick={handleBack}
				titleRight={titleRight}
				titleIcon={<IconPhoneCall size={18} />}
				contentWidth='full'
				mainScroll={false}
				rightSection={rightSidebar}
			>
				<div className={styles.mainLayout}>
					{/* Transcript Header — pinned top */}
					<Group gap='xs' align='center' className={styles.transcriptHeader}>
						<IconMessages size={16} color='var(--mantine-color-gray-6)' />
						<Text size='sm' fw={600} c='gray.8'>
							{t('detailPage.transcriptSection')}
						</Text>
						{turnCount > 0 && (
							<Badge size='xs' variant='light' color='gray'>
								{t('detailPage.turnCount', { count: turnCount })}
							</Badge>
						)}
					</Group>

					{/* Conversation Summary — pinned below header */}
					{transcriptSummary && (
						<div className={styles.summaryWrapper}>
							<RightSectionCard
								title={t('overview.summary.title')}
								icon={IconMessages}
								iconColor='blue'
								description={t('overview.summary.description')}
							>
								<Text fz='xs' className={styles.summaryText}>
									{(i18n.language === 'es'
										? conversation.summary?.es
										: conversation.summary?.en) ||
										conversation.summary?.en ||
										conversation.summary?.es ||
										transcriptSummary}
								</Text>
							</RightSectionCard>
						</div>
					)}

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
							nodeMissions={nodeMissions}
							showMetrics={false}
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
				</div>
			</ContentContainer>
		</div>
	);
}

export default ConversationDetailPage;
