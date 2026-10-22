import { useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Paper,
	Popover,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import {
	IconCheck,
	IconClock,
	IconPlayerPlay,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CallMoment, CallMomentStatus } from '../../types';
import { MOMENT_STATUS_COLOR, MOMENT_STATUS_VARIANT } from './callMoments';
import styles from './MomentCard.module.css';

const MIN_DISMISS_REASON = 5;

interface MomentCardProps {
	moment: CallMoment;
	active: boolean;
	canReview: boolean;
	onJump: (moment: CallMoment) => void;
	onSetStatus: (id: string, status: CallMomentStatus, note?: string) => void;
	/** Reviewer-added moments can be removed by the reviewer. */
	onRemove?: (id: string) => void;
}

/** One QA finding anchored to a call moment: the quote, a jump button and the reviewer's confirm / dismiss. */
export function MomentCard({
	moment,
	active,
	canReview,
	onJump,
	onSetStatus,
	onRemove,
}: MomentCardProps) {
	const { t } = useTranslation('qa.calls');
	const [dismissOpen, setDismissOpen] = useState(false);
	const [reason, setReason] = useState('');

	const submitDismiss = () => {
		onSetStatus(moment.id, 'dismissed', reason.trim());
		setDismissOpen(false);
		setReason('');
	};

	return (
		<Paper
			withBorder
			radius='sm'
			p='xs'
			id={`moment-${moment.id}`}
			className={styles.card}
			data-active={active || undefined}
			data-status={moment.status}
		>
			<Group justify='space-between' gap='xs' wrap='wrap' mb='xs'>
				<Group gap='xs'>
					<Badge size='xs' variant='outline' color='gray'>
						{moment.speaker === 'agent'
							? t('moments.transcript.agent')
							: t('moments.transcript.customer')}
					</Badge>
					<Group gap={4}>
						<IconClock size={12} />
						<Text size='xs' c='dimmed'>
							{moment.timestamp}
						</Text>
					</Group>
					<Badge size='xs' variant='outline' color='gray'>
						{t(`moments.source.${moment.source}`)}
					</Badge>
				</Group>
				<Badge
					size='xs'
					variant={MOMENT_STATUS_VARIANT[moment.status]}
					color={MOMENT_STATUS_COLOR[moment.status]}
				>
					{t(`moments.status.${moment.status}`)}
				</Badge>
			</Group>

			{moment.itemId === null && (
				<Text size='xs' fw={500} mb={2}>
					{moment.itemName}
				</Text>
			)}
			<Text size='sm' fs='italic'>
				"{moment.quote}"
			</Text>
			{moment.note && (
				<Text size='xs' c='dimmed' mt={4}>
					{moment.note}
				</Text>
			)}

			<Group gap='xs' mt='xs'>
				<Button
					size='xs'
					variant='light'
					leftSection={<IconPlayerPlay size={12} />}
					onClick={() => onJump(moment)}
				>
					{t('moments.jumpTo', { time: moment.timestamp })}
				</Button>

				{canReview && moment.status === 'pending' && (
					<>
						<Button
							size='xs'
							variant='subtle'
							color='gray'
							leftSection={<IconCheck size={12} />}
							onClick={() => onSetStatus(moment.id, 'confirmed')}
						>
							{t('moments.confirm')}
						</Button>
						<Popover
							opened={dismissOpen}
							onChange={setDismissOpen}
							width={300}
							trapFocus
							withArrow
							position='bottom-start'
						>
							<Popover.Target>
								<Button
									size='xs'
									variant='subtle'
									color='gray'
									leftSection={<IconX size={12} />}
									onClick={() => setDismissOpen((o) => !o)}
								>
									{t('moments.dismiss')}
								</Button>
							</Popover.Target>
							<Popover.Dropdown>
								<Stack gap='xs'>
									<Textarea
										size='sm'
										label={t('moments.dismissReason')}
										placeholder={t('moments.dismissReasonPlaceholder')}
										autosize
										minRows={2}
										value={reason}
										onChange={(e) => setReason(e.currentTarget.value)}
									/>
									<Button
										size='xs'
										color='gray'
										disabled={reason.trim().length < MIN_DISMISS_REASON}
										onClick={submitDismiss}
									>
										{t('moments.dismissSubmit')}
									</Button>
								</Stack>
							</Popover.Dropdown>
						</Popover>
					</>
				)}

				{canReview && moment.status !== 'pending' && moment.source === 'ai' && (
					<Button
						size='xs'
						variant='subtle'
						color='gray'
						onClick={() => onSetStatus(moment.id, 'pending', '')}
					>
						{t('moments.undo')}
					</Button>
				)}

				{canReview && moment.source === 'reviewer' && onRemove && (
					<Button
						size='xs'
						variant='subtle'
						color='gray'
						leftSection={<IconTrash size={12} />}
						onClick={() => onRemove(moment.id)}
					>
						{t('moments.undo')}
					</Button>
				)}
			</Group>
		</Paper>
	);
}
