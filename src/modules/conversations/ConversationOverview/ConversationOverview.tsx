import {
	Group,
	Text,
	Avatar,
	Stack,
	ActionIcon,
	Tooltip,
	CopyButton,
	Button,
	Badge,
} from '@mantine/core';
import {
	IconPhoneCall,
	IconUser,
	IconInfoCircle,
	IconCalendar,
	IconCopy,
	IconCheck,
	IconAlertCircle,
	IconLoader,
	IconX,
	IconClock,
	IconMessages,
	IconPdf,
	IconRobot,
} from '@tabler/icons-react';
import { useExportConversationPdf } from '~/queries/conversationsQueries';
import { notifications } from '@mantine/notifications';
import type { ConversationsModel } from '~/models/ConversationsModels';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import styles from './ConversationOverview.module.css';
import ConversationPlayer from '../ConversationPlayer';
import ConversationDisposition from '../ConversationDisposition';
import RightSectionCard from '~/components/RightSectionCard';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation(['conversations', 'common']);
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

	const getStatusIcon = (statusValue: string) => {
		if (statusValue.includes('done'))
			return { icon: IconCheck, color: 'var(--mantine-color-green-6)' };
		if (statusValue.includes('progress'))
			return { icon: IconLoader, color: 'var(--mantine-color-blue-6)' };
		if (statusValue.includes('failed') || statusValue.includes('error'))
			return { icon: IconX, color: 'var(--mantine-color-red-6)' };
		return { icon: IconClock, color: 'var(--mantine-color-gray-6)' };
	};

	const transcriptSummary =
		transcriptContent?.analysis?.transcript_summary || '';

	const { icon: StatusIcon, color: statusIconColor } =
		getStatusIcon(displayStatus);
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
			const result = await exportConversationMutation.mutateAsync(
				conversation.id
			);
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

	const StatValueWithHover = ({ value }: { value: string }) => (
		<Tooltip label={value} position='top-start' withArrow openDelay={100}>
			<Text className={styles.statValue}>{value}</Text>
		</Tooltip>
	);

	return (
		<Stack gap='xs' className={styles.container}>
			{/* Contact & Quick Overview */}
			<RightSectionCard
				title={t('overview.title')}
				icon={StatusIcon}
				iconColor={statusIconColor}
			>
				{/* Contact header with inline status badge */}
				<div className={styles.contactHeader}>
					<Avatar radius='xl' size={36} className={styles.avatar}>
						<IconUser size={16} />
					</Avatar>
					<div className={styles.contactInfo}>
						<div className={styles.contactNameRow}>
							<Text className={styles.contactName} title={contactName}>
								{contactName}
							</Text>
							<Badge
								size='xs'
								variant='light'
								color={statusBadge.color}
								className={styles.statusBadgeInline}
							>
								{statusBadge.label}
							</Badge>
						</div>
						<Group gap={6} align='center' className={styles.phoneGroup}>
							<IconPhoneCall size={12} className={styles.phoneIcon} />
							<Text className={styles.phoneNumber} title={contactPhone}>
								{contactPhone}
							</Text>
							<CopyButton value={String(contactPhone)} timeout={1200}>
								{({ copied, copy }) => (
									<Tooltip
										label={
											copied ? t('overview.copied') : t('overview.copyPhone')
										}
									>
										<ActionIcon
											size='xs'
											variant='subtle'
											aria-label={t('overview.copyPhone')}
											onClick={copy}
											className={styles.copyBtn}
										>
											{copied ? (
												<IconCheck size={12} />
											) : (
												<IconCopy size={12} />
											)}
										</ActionIcon>
									</Tooltip>
								)}
							</CopyButton>
						</Group>
					</div>
				</div>

				{/* Flat key-value stats list */}
				<div className={styles.statsList}>
					<div className={styles.statRow}>
						<div className={styles.statLabelGroup}>
							<IconCalendar size={13} className={styles.statIcon} />
							<Text className={styles.statLabel}>
								{t('overview.stats.dateTime')}
							</Text>
						</div>
						<div className={styles.statValueSide}>
							<StatValueWithHover value={dateDisplay} />
						</div>
					</div>

					<div className={styles.statRow}>
						<div className={styles.statLabelGroup}>
							<IconRobot size={13} className={styles.statIcon} />
							<Text className={styles.statLabel}>
								{t('overview.stats.agent')}
							</Text>
						</div>
						<div className={styles.statValueSide}>
							<StatValueWithHover value={agentName} />
						</div>
					</div>

					<div className={styles.statRow}>
						<div className={styles.statLabelGroup}>
							<IconInfoCircle size={13} className={styles.statIcon} />
							<Text className={styles.statLabel}>
								{t('overview.stats.campaign')}
							</Text>
						</div>
						<div className={styles.statValueSide}>
							<StatValueWithHover value={campaignName} />
						</div>
					</div>

					{terminationReason !== undefined && (
						<div className={styles.statRow}>
							<div className={styles.statLabelGroup}>
								<IconAlertCircle size={13} className={styles.statIcon} />
								<Text className={styles.statLabel}>
									{t('overview.stats.endReason')}
								</Text>
							</div>
							<div className={styles.statValueSide}>
								<StatValueWithHover
									value={formatTermination(terminationReason)}
								/>
							</div>
						</div>
					)}
				</div>
			</RightSectionCard>
			<ConversationDisposition
				key={conversation?.id}
				conversationId={String(conversation?.id)}
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
						{summary?.es || summary?.en || transcriptSummary}
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
			)}{' '}
			<ConversationPlayer
				voiceFile={conversation?.voiceFile}
				title={t('player.title')}
				description={t('player.description')}
				paramConversationId={conversation?.id}
				contactName={`${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(contact?.lastName)}`.trim()}
			/>
		</Stack>
	);
}

export default ConversationOverview;
