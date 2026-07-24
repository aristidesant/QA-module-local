import { type ReactNode } from 'react';
import { Badge, Button, Divider, Group, Skeleton, Text } from '@mantine/core';
import {
	IconClock,
	IconInfoCircle,
	IconLoader,
	IconPhone,
	IconPhonePause,
	IconPhoneOff,
	IconRecordMail,
	IconRefresh,
	IconShieldCheck,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CallDispositionModel } from '~/models/CallDispositionModel';
import styles from './ConversationDisposition.module.css';

export const normalizeDispositionStatus = (raw?: string) => {
	const v = (raw || '').toString().trim().toUpperCase();
	if (v.includes('POS')) return 'POSITIVE' as const;
	if (v.includes('NEG')) return 'NEGATIVE' as const;
	if (v.includes('NEU')) return 'NEUTRAL' as const;
	return 'NEUTRAL' as const;
};

export const formatDispositionDuration = (
	totalSeconds: number | undefined,
	t: ReturnType<typeof useTranslation>['t']
) => {
	if (!totalSeconds || totalSeconds <= 0) return t('disposition.duration.asap');
	const minutesTotal = Math.floor(totalSeconds / 60);
	const days = Math.floor(minutesTotal / (60 * 24));
	const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
	const minutes = minutesTotal % 60;
	const parts: string[] = [];

	if (days) {
		parts.push(
			`${days} ${days === 1 ? t('disposition.duration.day') : t('disposition.duration.days')}`
		);
	}

	if (hours) {
		parts.push(
			`${hours} ${hours === 1 ? t('disposition.duration.hour') : t('disposition.duration.hours')}`
		);
	}

	if (minutes) {
		parts.push(
			`${minutes} ${minutes === 1 ? t('disposition.duration.minute') : t('disposition.duration.minutes')}`
		);
	}

	if (!parts.length) return t('disposition.duration.lessThanMinute');
	if (parts.length === 1) return parts[0];
	if (parts.length === 2)
		return `${parts[0]} ${t('disposition.duration.and')} ${parts[1]}`;

	return `${parts[0]}, ${parts[1]} ${t('disposition.duration.and')} ${parts[2]}`;
};

export const getDispositionStatusPresentation = (
	status: ReturnType<typeof normalizeDispositionStatus>,
	t: ReturnType<typeof useTranslation>['t']
) => {
	switch (status) {
		case 'POSITIVE':
			return {
				color: 'green' as const,
				borderColorVar: 'var(--mantine-color-green-5)',
				label: t('disposition.positive'),
			};
		case 'NEGATIVE':
			return {
				color: 'red' as const,
				borderColorVar: 'var(--mantine-color-red-5)',
				label: t('disposition.negative'),
			};
		case 'NEUTRAL':
		default:
			return {
				color: 'gray' as const,
				borderColorVar: 'var(--mantine-color-gray-4)',
				label: t('disposition.neutral'),
			};
	}
};

export const getDispositionHeaderIcon = (
	statusValue: ReturnType<typeof normalizeDispositionStatus>
) => {
	switch (statusValue) {
		case 'POSITIVE':
			return { icon: IconPhone, color: 'var(--mantine-color-green-6)' };
		case 'NEGATIVE':
			return { icon: IconX, color: 'var(--mantine-color-red-6)' };
		case 'NEUTRAL':
		default:
			return { icon: IconInfoCircle, color: 'var(--mantine-color-gray-6)' };
	}
};

type ConversationDispositionContentProps = {
	disposition?: CallDispositionModel;
	isLoading?: boolean;
	isError?: boolean;
	isRetrying?: boolean;
	onRetry?: () => void;
	timestampLabel?: string;
	emptyLabel?: string;
	className?: string;
};

export default function ConversationDispositionContent({
	disposition,
	isLoading = false,
	isError = false,
	isRetrying = false,
	onRetry,
	timestampLabel,
	emptyLabel,
	className,
}: ConversationDispositionContentProps) {
	const { t } = useTranslation(['conversations', 'common']);

	if (isLoading) {
		return (
			<div
				className={
					className ? `${styles.content} ${className}` : styles.content
				}
			>
				<div className={styles.loadingState}>
					<Skeleton height={28} radius='md' />
					<Skeleton height={42} radius='md' />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div
				className={
					className ? `${styles.content} ${className}` : styles.content
				}
			>
				<div className={styles.errorState}>
					<Text size='sm' c='dimmed' mb={12}>
						{t('disposition.errorMsg')}
					</Text>
					<Button
						variant='light'
						color='gray'
						size='xs'
						leftSection={
							isRetrying ? <IconLoader size={14} /> : <IconRefresh size={14} />
						}
						onClick={onRetry}
						loading={isRetrying}
						disabled={isRetrying}
						fullWidth
					>
						{t('disposition.retry')}
					</Button>
				</div>
			</div>
		);
	}

	const name =
		disposition?.dispositionName || emptyLabel || t('disposition.noOutcome');
	const description = disposition?.dispositionDescription;
	const notes = disposition?.notes;
	const status = normalizeDispositionStatus(
		disposition?.callStatus || disposition?.dispositionName
	);
	const statusView = getDispositionStatusPresentation(status, t);
	const requiresReschedule = Boolean(disposition?.requiresReschedule);
	const rescheduleTimeSec = disposition?.rescheduleTime;
	const isInvalidatesNumber = Boolean(disposition?.isInvalidatesNumber);
	const isFinal = Boolean(disposition?.isFinal);
	const isVoiceMail = Boolean(disposition?.isVoiceMail);
	const isAbandoned = Boolean(disposition?.isAbandoned);

	const traitBadges = [
		isFinal && {
			key: 'final',
			label: t('disposition.finalized'),
			icon: <IconShieldCheck size={12} />,
		},
		isVoiceMail && {
			key: 'voicemail',
			label: t('disposition.voicemail'),
			icon: <IconRecordMail size={12} />,
		},
		isAbandoned && {
			key: 'abandoned',
			label: t('disposition.abandoned'),
			icon: <IconPhonePause size={12} />,
		},
	].filter(Boolean) as Array<{
		key: string;
		label: string;
		icon: ReactNode;
	}>;

	return (
		<div
			className={className ? `${styles.content} ${className}` : styles.content}
		>
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
									{t('disposition.callbackRequired')}
								</Text>
								<Text size='xs'>
									{formatDispositionDuration(rescheduleTimeSec ?? undefined, t)}
								</Text>
							</div>
						</div>
					)}
					{isInvalidatesNumber && (
						<div className={`${styles.action} ${styles.actionCritical}`}>
							<IconPhoneOff size={14} />
							<div>
								<Text size='xs' className={styles.actionLabel}>
									{t('disposition.numberInvalidated')}
								</Text>
								<Text size='xs'>{t('disposition.doNotRetry')}</Text>
							</div>
						</div>
					)}
				</div>
			)}

			{notes && (
				<>
					<Divider className={styles.notesDivider} />
					<div className={styles.notes}>
						<Text className={styles.notesLabel}>
							{t('disposition.agentNotes')}
						</Text>
						<Text className={styles.notesText}>{notes}</Text>
					</div>
				</>
			)}
		</div>
	);
}
