import type { FC, ReactNode } from 'react';
import { Group, Text, Badge, Skeleton, Button, Divider } from '@mantine/core';
import {
	IconInfoCircle,
	IconClock,
	IconPhoneOff,
	IconPhone,
	IconRefresh,
	IconRecordMail,
	IconShieldCheck,
} from '@tabler/icons-react';
import { useCallDispositionByConversationId } from '~/queries/callDispositionQueries';
import type { CallDispositionModel } from '~/models/CallDispositionModel';
import styles from './ConversationDisposition.module.css';
import RightSectionCard from '~/components/RightSectionCard';

type ConversationDispositionProps = {
	conversationId: string | number;
};

const ConversationDisposition: FC<ConversationDispositionProps> = ({
	conversationId,
}) => {
	const { data, isLoading, isError, refetch } =
		useCallDispositionByConversationId(conversationId);

	const normalizeStatus = (raw?: string) => {
		const v = (raw || '').toString().trim().toUpperCase();
		if (v.includes('POS')) return 'POSITIVE' as const;
		if (v.includes('NEG')) return 'NEGATIVE' as const;
		if (v.includes('NEU')) return 'NEUTRAL' as const;
		return 'NEUTRAL' as const;
	};

	const getStatusPresentation = (
		status: ReturnType<typeof normalizeStatus>
	) => {
		switch (status) {
			case 'POSITIVE':
				return {
					color: 'green' as const,
					borderColorVar: 'var(--mantine-color-green-5)',
					label: 'Positive',
				};
			case 'NEGATIVE':
				return {
					color: 'red' as const,
					borderColorVar: 'var(--mantine-color-red-5)',
					label: 'Negative',
				};
			case 'NEUTRAL':
			default:
				return {
					color: 'gray' as const,
					borderColorVar: 'var(--mantine-color-gray-4)',
					label: 'Neutral',
				};
		}
	};

	const formatDuration = (totalSeconds?: number) => {
		if (!totalSeconds || totalSeconds <= 0) return 'as soon as possible';
		const minutesTotal = Math.floor(totalSeconds / 60);
		const days = Math.floor(minutesTotal / (60 * 24));
		const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
		const minutes = minutesTotal % 60;
		const parts: string[] = [];
		if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
		if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
		if (minutes)
			parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
		if (!parts.length) return 'less than a minute';
		if (parts.length === 1) return parts[0];
		if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
		return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
	};

	if (isLoading) {
		return (
			<RightSectionCard
				title='Outcome'
				description='Loading status'
				icon={IconPhone}
				iconColor='var(--mantine-color-gray-4)'
			>
				<div className={styles.loadingState}>
					<Skeleton height={32} radius='md' mb={8} />
					<Skeleton height={48} radius='md' />
				</div>
			</RightSectionCard>
		);
	}

	if (isError) {
		return (
			<RightSectionCard
				title='Outcome'
				description='Failed to load'
				icon={IconInfoCircle}
				iconColor='var(--mantine-color-red-6)'
			>
				<div className={styles.errorState}>
					<Text size='sm' c='dimmed' mb={12}>
						Couldn't load outcome data
					</Text>
					<Button
						variant='light'
						color='gray'
						size='xs'
						leftSection={<IconRefresh size={14} />}
						onClick={() => refetch()}
						fullWidth
					>
						Retry
					</Button>
				</div>
			</RightSectionCard>
		);
	}

	const disposition = data as CallDispositionModel | undefined;
	const name = disposition?.dispositionName || 'No outcome';
	const description = disposition?.dispositionDescription;
	const notes = disposition?.notes;
	const status = normalizeStatus(
		disposition?.callStatus || disposition?.dispositionName
	);
	const statusView = getStatusPresentation(status);
	const updatedAt = disposition?.updatedAt || disposition?.createdAt;
	const requiresReschedule = Boolean(disposition?.requiresReschedule);
	const rescheduleTimeSec = disposition?.rescheduleTime;
	const isInvalidatesNumber = Boolean(disposition?.isInvalidatesNumber);
	const isFinal = Boolean(disposition?.isFinal);
	const isVoiceMail = Boolean(disposition?.isVoiceMail);
	const timestampLabel = updatedAt
		? new Date(updatedAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			})
		: undefined;

	const traitBadges = [
		isFinal && {
			key: 'final',
			label: 'Finalized',
			icon: <IconShieldCheck size={12} />,
		},
		isVoiceMail && {
			key: 'voicemail',
			label: 'Voicemail',
			icon: <IconRecordMail size={12} />,
		},
	].filter(Boolean) as Array<{
		key: string;
		label: string;
		icon: ReactNode;
	}>;

	return (
		<RightSectionCard
			title='Outcome'
			description={timestampLabel || 'No updates yet'}
			icon={IconPhone}
			iconColor={statusView.borderColorVar}
		>
			<div className={styles.content}>
				<div className={styles.header}>
					<Badge
						color={statusView.color}
						variant='filled'
						size='sm'
						className={styles.statusBadge}
					>
						{statusView.label}
					</Badge>
					{timestampLabel && (
						<div className={styles.timestamp}>
							<IconClock size={12} />
							<Text size='xs'>{timestampLabel}</Text>
						</div>
					)}
				</div>

				<div className={styles.summary}>
					<Text className={styles.dispositionName}>{name}</Text>
					{description && (
						<Text className={styles.description}>{description}</Text>
					)}
				</div>

				{traitBadges.length > 0 && (
					<Group gap={8} className={styles.traits} wrap='wrap'>
						{traitBadges.map((trait) => (
							<div key={trait.key} className={styles.trait}>
								{trait.icon}
								<Text size='xs'>{trait.label}</Text>
							</div>
						))}
					</Group>
				)}

				{(requiresReschedule || isInvalidatesNumber) && (
					<div className={styles.actions}>
						{requiresReschedule && (
							<div className={styles.action}>
								<IconClock size={14} />
								<div>
									<Text size='xs' className={styles.actionLabel}>
										Callback required
									</Text>
									<Text size='xs'>{formatDuration(rescheduleTimeSec)}</Text>
								</div>
							</div>
						)}
						{isInvalidatesNumber && (
							<div className={`${styles.action} ${styles.actionCritical}`}>
								<IconPhoneOff size={14} />
								<div>
									<Text size='xs' className={styles.actionLabel}>
										Number invalidated
									</Text>
									<Text size='xs'>Do not retry this contact</Text>
								</div>
							</div>
						)}
					</div>
				)}

				{notes && (
					<>
						<Divider className={styles.notesDivider} />
						<div className={styles.notes}>
							<Text className={styles.notesLabel}>Agent notes</Text>
							<Text className={styles.notesText}>{notes}</Text>
						</div>
					</>
				)}
			</div>
		</RightSectionCard>
	);
};

export default ConversationDisposition;
