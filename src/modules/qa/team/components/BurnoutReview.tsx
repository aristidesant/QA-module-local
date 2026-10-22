import { useState } from 'react';
import {
	Alert,
	Button,
	Group,
	Popover,
	SegmentedControl,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	selectBurnoutReviews,
	useBurnoutReviewStore,
} from '~/stores/qa/burnoutReviewStore';
import { formatDate } from '../helpers';

const MIN_REASON = 5;
const SILENCE_DAYS = [7, 14, 30];

interface BurnoutReviewProps {
	agentId: string;
	/** Who takes the decision, as it is recorded. */
	reviewer: string;
}

/** Confirm or dismiss the burnout risk of an agent. A dismissed agent leaves the lists of agents at risk for a while. */
export function BurnoutReviewActions({
	agentId,
	reviewer,
}: BurnoutReviewProps) {
	const { t } = useTranslation('qa.team');
	const confirm = useBurnoutReviewStore((s) => s.confirm);
	const dismiss = useBurnoutReviewStore((s) => s.dismiss);
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('');
	const [days, setDays] = useState('14');

	const submit = () => {
		dismiss(agentId, reason.trim(), Number(days), reviewer);
		notifySuccess(t('burnoutTab.review.dismissedNotice'));
		setOpen(false);
		setReason('');
	};

	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				variant='default'
				size='xs'
				leftSection={<IconCheck size={14} />}
				onClick={() => {
					confirm(agentId, reviewer);
					notifySuccess(t('burnoutTab.review.confirmedNotice'));
				}}
			>
				{t('burnoutTab.review.confirm')}
			</Button>
			<Popover
				opened={open}
				onChange={setOpen}
				width={320}
				trapFocus
				withArrow
				position='bottom-end'
			>
				<Popover.Target>
					<Button
						variant='default'
						size='xs'
						leftSection={<IconX size={14} />}
						onClick={() => setOpen((o) => !o)}
					>
						{t('burnoutTab.review.dismiss')}
					</Button>
				</Popover.Target>
				<Popover.Dropdown>
					<Stack gap='sm'>
						<Textarea
							size='sm'
							label={t('burnoutTab.review.reason')}
							placeholder={t('burnoutTab.review.reasonPlaceholder')}
							autosize
							minRows={2}
							value={reason}
							onChange={(e) => setReason(e.currentTarget.value)}
						/>
						<Stack gap={4}>
							<Text size='sm' fw={500}>
								{t('burnoutTab.review.silence')}
							</Text>
							<SegmentedControl
								size='xs'
								value={days}
								onChange={setDays}
								data={SILENCE_DAYS.map((d) => ({
									value: String(d),
									label: t('burnoutTab.review.days', { count: d }),
								}))}
							/>
						</Stack>
						<Button
							size='xs'
							disabled={reason.trim().length < MIN_REASON}
							onClick={submit}
						>
							{t('burnoutTab.review.submit')}
						</Button>
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</Group>
	);
}

/** The decision already taken about the agent, with a way to undo it. */
export function BurnoutReviewBanner({ agentId }: { agentId: string }) {
	const { t } = useTranslation('qa.team');
	const review = useBurnoutReviewStore(selectBurnoutReviews).find(
		(r) => r.agentId === agentId
	);
	const undo = useBurnoutReviewStore((s) => s.undo);
	if (!review) return null;

	return (
		<Alert
			variant='light'
			color='gray'
			withCloseButton={false}
			title={
				review.decision === 'CONFIRMED'
					? t('burnoutTab.review.confirmedTitle')
					: t('burnoutTab.review.dismissedTitle')
			}
		>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Text size='sm'>
					{review.decision === 'CONFIRMED'
						? t('burnoutTab.review.confirmedBanner', {
								by: review.by,
								date: formatDate(review.at),
							})
						: t('burnoutTab.review.dismissedBanner', {
								by: review.by,
								date: formatDate(review.silencedUntil ?? review.at),
								reason: review.reason,
							})}
				</Text>
				<Button
					variant='subtle'
					color='gray'
					size='compact-xs'
					onClick={() => undo(agentId)}
				>
					{t('burnoutTab.review.undo')}
				</Button>
			</Group>
		</Alert>
	);
}
