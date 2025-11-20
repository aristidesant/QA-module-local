import {
	Group,
	Text,
	Avatar,
	Stack,
	ActionIcon,
	Tooltip,
	Divider,
	CopyButton,
	Button,
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
} from '@tabler/icons-react';
import { useExportConversationPdf } from '~/queries/conversationsQueries';
import { notifications } from '@mantine/notifications';
import type { ConversationsModel } from '~/models/ConversationsModels';
import styles from './ConversationOverview.module.css';
import ConversationPlayer from '../ConversationPlayer';
import ConversationDisposition from '../ConversationDisposition';
import RightSectionCard from '~/components/RightSectionCard';

interface ConversationOverviewProps {
	conversation: ConversationsModel;
	status?: string; // Optional override for status
	duration?: number; // Optional override for duration
}

// get value or empty
const getValueOrEmpty = (value: string | undefined | unknown) => {
	return value || '';
};

export function ConversationOverview({
	conversation,
	status: statusOverride,
	duration: durationOverride,
}: ConversationOverviewProps) {
	const {
		contact,
		agent,
		campaign,
		status = 'unknown',
		startDate,
		summary,
		transcriptContent,
	} = conversation;

	// Use overrides if provided, otherwise calculate from conversation data
	const displayStatus = statusOverride || status;
	const displayDuration =
		durationOverride || transcriptContent?.metadata?.call_duration_secs || 0;
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleString();
		} catch (error) {
			return 'Invalid date';
		}
	};

	const formatDateShort = (dateString: string) => {
		try {
			const d = new Date(dateString);
			return d.toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
		} catch (error) {
			return 'Invalid date';
		}
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return 'N/A';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	const contactName = conversation?.externalPhoneNumber
		? 'Demo'
		: `${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(
				contact?.lastName
			)}`;
	const contactPhone = String(
		contact?.phoneNumber ||
			conversation?.contactPhoneNumber ||
			conversation?.externalPhoneNumber ||
			'No phone number'
	);
	const agentName = agent?.name ? String(agent.name) : 'Unassigned';
	const campaignName = campaign?.name ? String(campaign.name) : 'N/A';

	// Extract metadata values
	const metadata = transcriptContent?.metadata;
	const terminationReason = metadata?.termination_reason;

	const formatTermination = (reason?: string | null) => {
		if (!reason) return 'Unknown';
		const r = reason.toLowerCase();
		if (r.includes('terminated_by') || r.includes('terminated'))
			return 'Terminated';
		if (r.includes('client') && r.includes('disconnect'))
			return 'Client Disconnected';
		if (r.includes('hangup')) return 'Hangup';
		if (r.includes('timeout')) return 'Timeout';
		if (r.includes('error')) return 'Error';
		// Fallback: capitalize first letter
		return reason.charAt(0).toUpperCase() + reason.slice(1);
	};

	const getStatusIcon = (status: string) => {
		if (status.includes('done'))
			return { icon: IconCheck, color: 'var(--mantine-color-green-6)' };
		if (status.includes('progress'))
			return { icon: IconLoader, color: 'var(--mantine-color-blue-6)' };
		if (status.includes('failed') || status.includes('error'))
			return { icon: IconX, color: 'var(--mantine-color-red-6)' };
		return { icon: IconClock, color: 'var(--mantine-color-gray-6)' };
	};

	const transcriptSummary =
		transcriptContent?.analysis?.transcript_summary || '';

	const { icon: StatusIcon, color: statusIconColor } =
		getStatusIcon(displayStatus);

	const exportConversationMutation = useExportConversationPdf();

	const handleExportConversation = async () => {
		try {
			const result = await exportConversationMutation.mutateAsync(
				conversation.id
			);

			// Create download link
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
				title: 'Export Successful',
				message: 'Conversation exported as PDF',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Export Failed',
				message: 'Failed to export conversation. Please try again.',
				color: 'red',
			});
		}
	};

	return (
		<Stack gap='md' className={styles.container}>
			{/* Contact & Quick Overview */}
			<RightSectionCard
				title='Conversation Overview'
				description='Define the conversation key details.'
				icon={StatusIcon}
				iconColor={statusIconColor}
			>
				<div className={styles.contactHeader}>
					<Avatar radius='xl' size={48} className={styles.avatar}>
						<IconUser size={22} />
					</Avatar>
					<div className={styles.contactInfo}>
						<Text className={styles.contactName} title={contactName}>
							{contactName}
						</Text>
						<Group gap={8} align='center' className={styles.phoneGroup}>
							<IconPhoneCall size={14} className={styles.phoneIcon} />
							<Text className={styles.phoneNumber} title={contactPhone}>
								{contactPhone}
							</Text>
							<CopyButton value={String(contactPhone)} timeout={1200}>
								{({ copied, copy }) => (
									<Tooltip label={copied ? 'Copied' : 'Copy phone'}>
										<ActionIcon
											size='xs'
											variant='subtle'
											aria-label='Copy phone number'
											onClick={copy}
											className={styles.copyBtn}
										>
											{copied ? (
												<IconCheck size={13} />
											) : (
												<IconCopy size={13} />
											)}
										</ActionIcon>
									</Tooltip>
								)}
							</CopyButton>
						</Group>
					</div>
				</div>

				<Divider className={styles.divider} />

				<div className={styles.statsGrid}>
					<div className={styles.statCard}>
						<div className={styles.statIconWrapper}>
							<IconCalendar size={16} className={styles.statIcon} />
						</div>
						<div className={styles.statContent}>
							<Text className={styles.statLabel}>Date & Time</Text>
							<Text className={styles.statValue} title={formatDate(startDate)}>
								{formatDateShort(startDate)}
							</Text>
							<Text className={styles.statSubtext}>
								{formatDuration(displayDuration as number)}
							</Text>
						</div>
					</div>

					<div className={styles.statCard}>
						<div className={styles.statIconWrapper}>
							<IconUser size={16} className={styles.statIcon} />
						</div>
						<div className={styles.statContent}>
							<Text className={styles.statLabel}>Agent</Text>
							<Text className={styles.statValue} title={agentName}>
								{agentName}
							</Text>
						</div>
					</div>

					<div className={styles.statCard}>
						<div className={styles.statIconWrapper}>
							<IconInfoCircle size={16} className={styles.statIcon} />
						</div>
						<div className={styles.statContent}>
							<Text className={styles.statLabel}>Campaign</Text>
							<Text className={styles.statValue} title={campaignName}>
								{campaignName}
							</Text>
						</div>
					</div>

					{terminationReason !== undefined && (
						<div className={styles.statCard}>
							<div className={styles.statIconWrapper}>
								<IconAlertCircle size={16} className={styles.statIcon} />
							</div>
							<div className={styles.statContent}>
								<Text className={styles.statLabel}>End Reason</Text>
								<Text className={styles.statValue} title={terminationReason}>
									{formatTermination(terminationReason)}
								</Text>
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
					title='Conversation Summary'
					icon={IconMessages}
					iconColor='blue'
					description='Auto-generated from the call transcript'
				>
					<Text fz='xs' className={styles.summaryText}>
						{summary?.es || summary?.en || transcriptSummary}
					</Text>
					<Button
						rightSection={<IconPdf size={16} />}
						fullWidth
						loading={exportConversationMutation.isPending}
						onClick={handleExportConversation}
					>
						Download Full Transcript
					</Button>
				</RightSectionCard>
			)}{' '}
			<ConversationPlayer
				voiceFile={conversation?.voiceFile}
				title='Recording'
				description='Listen to the call recording'
				paramConversationId={conversation?.id}
				contactName={`${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(
					contact?.lastName
				)}`.trim()}
			/>
		</Stack>
	);
}

export default ConversationOverview;
