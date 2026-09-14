import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Checkbox,
	Group,
	Modal,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { DisputeCase, DisputeItemRef } from '~/models/qa/disputeCases';
import type { CallEvaluationDetail } from '~/views/Campaigns/types';
import { useDisputesStore } from '~/stores/qa/disputesStore';
import {
	applyCorrections,
	detectedSignalCount,
	headlineScore,
} from '../../recalc';
import { MIN_MANAGER_COMMENT } from '../../constants';

interface ReviewPanelProps {
	dispute: DisputeCase;
	call: CallEvaluationDetail;
	items: DisputeItemRef[];
}

/**
 * QA Manager review: tick the items that were scored wrongly and watch the
 * score recalculate, then accept the correction or reject with a comment.
 */
export const ReviewPanel: React.FC<ReviewPanelProps> = ({
	dispute,
	call,
	items,
}) => {
	const { t } = useTranslation('qa.disputes');
	const acceptDispute = useDisputesStore((s) => s.acceptDispute);
	const rejectDispute = useDisputesStore((s) => s.rejectDispute);

	const validFlagged = dispute.flaggedItemIds.filter((id) =>
		items.some((item) => item.id === id)
	);
	const [ticked, setTicked] = useState<string[]>(validFlagged);
	const [comment, setComment] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);

	/** Live preview of what accepting with the current ticks would produce. */
	const preview = useMemo(() => {
		const corrected = applyCorrections(call, dispute.evaluationType, ticked);
		return dispute.evaluationType === 'business-insights'
			? {
					before: detectedSignalCount(call),
					after: detectedSignalCount(corrected),
				}
			: {
					before: headlineScore(call, dispute.evaluationType),
					after: headlineScore(corrected, dispute.evaluationType),
				};
	}, [call, dispute.evaluationType, ticked]);

	const groups = useMemo(() => {
		const map = new Map<string, DisputeItemRef[]>();
		items.forEach((item) => {
			map.set(item.group, [...(map.get(item.group) ?? []), item]);
		});
		return [...map.entries()];
	}, [items]);

	const commentTooShort = comment.trim().length < MIN_MANAGER_COMMENT;
	const nothingTicked = ticked.length === 0;

	const handleAccept = () => {
		acceptDispute(dispute.id, ticked, comment.trim());
		notifySuccess(t('cases.review.acceptedToast'));
	};

	const handleReject = () => {
		rejectDispute(dispute.id, comment.trim());
		setConfirmOpen(false);
		notifySuccess(t('cases.review.rejectedToast'));
	};

	return (
		<>
			<SectionCard
				headerAccent='blue'
				title={t('cases.review.title')}
				description={t('cases.review.description')}
			>
				<Stack gap='md'>
					<Checkbox.Group value={ticked} onChange={setTicked}>
						<Stack gap='md'>
							{groups.map(([group, groupItems]) => (
								<Stack key={group} gap='xs'>
									<Text size='xs' fw={600} tt='uppercase' c='dimmed'>
										{group}
									</Text>
									{groupItems.map((item) => (
										<Checkbox
											key={item.id}
											value={item.id}
											label={item.label}
											description={item.original}
										/>
									))}
								</Stack>
							))}
						</Stack>
					</Checkbox.Group>

					<Paper withBorder p='sm' radius='md'>
						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								{t('cases.review.preview')}
							</Text>
							<Group gap='xs'>
								<Text size='sm' c='dimmed'>
									{preview.before ?? '—'}
								</Text>
								<Text size='sm'>→</Text>
								<Text size='sm' fw={700} c='green'>
									{preview.after ?? '—'}
								</Text>
							</Group>
						</Group>
					</Paper>

					<Textarea
						label={t('cases.review.comment')}
						placeholder={t('cases.review.commentPlaceholder')}
						value={comment}
						onChange={(e) => setComment(e.currentTarget.value)}
						autosize
						minRows={3}
					/>

					<Group justify='flex-end' gap='sm'>
						<Tooltip
							label={t('cases.review.needComment')}
							disabled={!commentTooShort}
							withArrow
						>
							<Button
								variant='light'
								color='red'
								disabled={commentTooShort}
								onClick={() => setConfirmOpen(true)}
							>
								{t('cases.review.reject')}
							</Button>
						</Tooltip>
						<Tooltip
							label={t('cases.review.needItems')}
							disabled={!nothingTicked}
							withArrow
						>
							<Button
								color='green'
								disabled={nothingTicked}
								onClick={handleAccept}
							>
								{t('cases.review.accept')}
							</Button>
						</Tooltip>
					</Group>
				</Stack>
			</SectionCard>

			<Modal
				opened={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				title={t('cases.review.confirmReject.title')}
				size='sm'
			>
				<Stack gap='md'>
					<Text size='sm'>{t('cases.review.confirmReject.body')}</Text>
					<Group justify='flex-end' gap='xs'>
						<Button variant='subtle' onClick={() => setConfirmOpen(false)}>
							{t('cases.review.reject')}
						</Button>
						<Button color='red' onClick={handleReject}>
							{t('cases.review.confirmReject.confirm')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};

export default ReviewPanel;
