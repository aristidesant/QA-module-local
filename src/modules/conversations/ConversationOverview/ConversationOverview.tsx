import { Text, Stack, Button } from '@mantine/core';
import { IconMessages, IconPdf } from '@tabler/icons-react';
import { useExportConversationPdf } from '~/queries/conversationsQueries';
import { notifications } from '@mantine/notifications';
import type { ConversationsModel } from '~/models/ConversationsModels';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import styles from './ConversationOverview.module.css';
import ConversationPlayer from '../ConversationPlayer';
import RightSectionCard from '~/components/RightSectionCard';
import ConversationCapturedVariables from '../ConversationCapturedVariables';
import { useTranslation } from 'react-i18next';
import ConversationOverviewCard from '../ConversationOverviewCard';
import ConversationDisposition from '../ConversationDisposition';
import ConversationTechnicalOverview from '../ConversationTechnicalOverview';

interface ConversationOverviewProps {
	conversation: ConversationsModel;
	status?: string;
	duration?: number;
}

const getValueOrEmpty = (value: string | undefined | unknown) => {
	return value || '';
};

export function ConversationOverview({
	conversation,
	status: statusOverride,
	duration: durationOverride,
}: ConversationOverviewProps) {
	const { t, i18n } = useTranslation(['conversations', 'common']);
	const {
		contact,
		agent,
		campaign,
		status = 'unknown',
		startDate,
		summary,
		transcriptContent,
	} = conversation;

	const displayStatus = statusOverride || status;
	const displayDuration =
		durationOverride || transcriptContent?.metadata?.call_duration_secs || 0;

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

	const contactName = conversation?.externalPhoneNumber
		? t('overview.demoContact')
		: `${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(contact?.lastName)}`;
	const contactPhone = String(
		contact?.phoneNumber ||
			conversation?.contactPhoneNumber ||
			conversation?.externalPhoneNumber ||
			t('overview.fallbacks.noPhone')
	);
	const agentName = agent?.name
		? String(agent.name)
		: t('overview.fallbacks.unassigned');
	const campaignName = campaign?.name
		? String(campaign.name)
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

	const getStatusBadge = (statusValue: string) => {
		if (statusValue.includes('done'))
			return { color: 'green' as const, label: t('overview.status.done') };
		if (statusValue.includes('progress'))
			return {
				color: 'blue' as const,
				label: t('overview.status.inProgress'),
			};
		if (statusValue.includes('failed') || statusValue.includes('error'))
			return { color: 'red' as const, label: t('overview.status.failed') };
		return { color: 'gray' as const, label: t('overview.status.pending') };
	};

	const transcriptSummary =
		transcriptContent?.analysis?.transcript_summary || '';
	const capturedVariables =
		transcriptContent?.analysis?.data_collection_results;

	const statusBadge = getStatusBadge(displayStatus);

	const exportConversationMutation = useExportConversationPdf();
	const { canPerformAction } = usePermissions();
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);

	const handleExportConversation = async () => {
		if (!canExportConversations) return;

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

	// Build date value with inline duration
	const dateValue = formatDateShort(startDate);
	const durationStr = formatDuration(displayDuration as number);
	const dateDisplay = durationStr ? `${dateValue} · ${durationStr}` : dateValue;

	const terminationLabel =
		terminationReason !== undefined
			? formatTermination(terminationReason)
			: undefined;

	return (
		<Stack gap='xs' className={styles.container}>
			<ConversationPlayer
				voiceFile={conversation?.voiceFile}
				title={t('player.title')}
				description={t('player.description')}
				paramConversationId={conversation?.id}
				contactName={`${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(contact?.lastName)}`.trim()}
			/>

			{/* Conversation Summary */}
			{transcriptSummary && (
				<RightSectionCard
					title={t('overview.summary.title')}
					icon={IconMessages}
					iconColor='blue'
					description={t('overview.summary.description')}
				>
					<Text fz='xs' className={styles.summaryText}>
						{(i18n.language === 'es' ? summary?.es : summary?.en) ||
							summary?.en ||
							summary?.es ||
							transcriptSummary}
					</Text>
					{canExportConversations && (
						<Button
							size='xs'
							variant='light'
							rightSection={<IconPdf size={14} />}
							fullWidth
							loading={exportConversationMutation.isPending}
							onClick={handleExportConversation}
						>
							{t('overview.downloadTranscript')}
						</Button>
					)}
				</RightSectionCard>
			)}

			<div className={styles.detailGrid}>
				<ConversationOverviewCard
					contactName={contactName}
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
			</div>

			<ConversationCapturedVariables variables={capturedVariables} />
			<ConversationTechnicalOverview transcriptContent={transcriptContent} />
		</Stack>
	);
}

export default ConversationOverview;
