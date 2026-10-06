import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Alert,
	Button,
	Group,
	Loader,
	Modal,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type {
	DisputeCase,
	DisputeItemDecision,
	DisputeItemRef,
} from '~/models/qa/disputeCases';
import type { CallEvaluationDetail } from '~/views/Campaigns/types';
import { SENTIMENT_CATEGORIES } from '~/views/Campaigns/constants';
import { useDisputesStore } from '~/stores/qa/disputesStore';
import {
	applyCorrections,
	complianceCounts,
	detectedSignalCount,
	headlineScore,
} from '../../recalc';
import { resolutionStatus } from '../../helpers';
import {
	canReevaluate,
	reevaluateItems,
	REEVALUATION_DELAY_MS,
	type ReevaluationProposal,
} from '../../reevaluate';
import { MIN_ITEM_NOTE, MIN_MANAGER_COMMENT } from '../../constants';
import { DecisionRow } from './DecisionRow';

interface ReviewPanelProps {
	dispute: DisputeCase;
	call: CallEvaluationDetail;
	items: DisputeItemRef[];
}

/**
 * QA Manager review: decide every item (keep the original or set the right
 * value) and watch the score recalculate, then accept — fully or partially —
 * or reject with a comment.
 */
export const ReviewPanel: React.FC<ReviewPanelProps> = ({
	dispute,
	call,
	items,
}) => {
	const { t } = useTranslation('qa.disputes');
	const acceptDispute = useDisputesStore((s) => s.acceptDispute);
	const rejectDispute = useDisputesStore((s) => s.rejectDispute);

	const [decisions, setDecisions] = useState<
		Record<string, DisputeItemDecision>
	>(() =>
		Object.fromEntries(
			items.map((item) => [
				item.id,
				{ itemId: item.id, outcome: 'keep' as const },
			])
		)
	);
	const [comment, setComment] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [rerunning, setRerunning] = useState(false);
	/** null until the AI has been asked to evaluate the call again. */
	const [proposals, setProposals] = useState<ReevaluationProposal[] | null>(
		null
	);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	const rerun = () => {
		setRerunning(true);
		timer.current = setTimeout(() => {
			setProposals(reevaluateItems(dispute.evaluationType, items));
			setRerunning(false);
		}, REEVALUATION_DELAY_MS);
	};

	/** Adopting a proposal turns it into the item's decision, which the QA Manager can still adjust. */
	const adopt = (proposal: ReevaluationProposal) =>
		setDecisions((prev) => ({
			...prev,
			[proposal.itemId]: {
				itemId: proposal.itemId,
				outcome: 'correct',
				value: proposal.value,
				edits: proposal.edits,
				note: proposal.edits
					? t('cases.review.adoptedJustification')
					: undefined,
				source: 'ai-reevaluation',
			},
		}));

	const decisionList = useMemo(
		() =>
			items.map(
				(item) =>
					decisions[item.id] ?? { itemId: item.id, outcome: 'keep' as const }
			),
		[items, decisions]
	);

	/** Live preview of what accepting with the current decisions would produce. */
	const preview = useMemo(() => {
		const corrected = applyCorrections(
			call,
			dispute.evaluationType,
			decisionList
		);
		switch (dispute.evaluationType) {
			case 'business-insights':
				return {
					before: detectedSignalCount(call),
					after: detectedSignalCount(corrected),
					extra: null,
				};
			case 'compliance':
				return {
					before: headlineScore(call, dispute.evaluationType),
					after: headlineScore(corrected, dispute.evaluationType),
					extra: {
						label: t('cases.review.previewFindings'),
						before: t('cases.review.previewCompliance', complianceCounts(call)),
						after: t(
							'cases.review.previewCompliance',
							complianceCounts(corrected)
						),
					},
				};
			case 'sentiment-emotion':
				return {
					before: headlineScore(call, dispute.evaluationType),
					after: headlineScore(corrected, dispute.evaluationType),
					extra: {
						label: t('cases.review.previewCategory'),
						before:
							SENTIMENT_CATEGORIES[call.sentiment.customer.overallCategory]
								.label,
						after:
							SENTIMENT_CATEGORIES[corrected.sentiment.customer.overallCategory]
								.label,
					},
				};
			default:
				return {
					before: headlineScore(call, dispute.evaluationType),
					after: headlineScore(corrected, dispute.evaluationType),
					extra: null,
				};
		}
	}, [call, dispute.evaluationType, decisionList, t]);

	const groups = useMemo(() => {
		const map = new Map<string, DisputeItemRef[]>();
		items.forEach((item) => {
			map.set(item.group, [...(map.get(item.group) ?? []), item]);
		});
		return [...map.entries()];
	}, [items]);

	const status = resolutionStatus(dispute, items, decisionList);
	const anyCorrected = decisionList.some((d) => d.outcome === 'correct');
	const missingNote = decisionList.some(
		(d) =>
			d.outcome === 'correct' &&
			items.find((item) => item.id === d.itemId)?.kind === 'compliance' &&
			(d.note ?? '').trim().length < MIN_ITEM_NOTE
	);
	const commentTooShort = comment.trim().length < MIN_MANAGER_COMMENT;
	const acceptBlocked = !anyCorrected || missingNote;

	const handleAccept = () => {
		acceptDispute(dispute.id, decisionList, comment.trim());
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
					{canReevaluate(dispute.evaluationType) && (
						<Paper withBorder p='sm' radius='md'>
							<Group
								justify='space-between'
								align='center'
								wrap='nowrap'
								gap='md'
							>
								<Stack gap={2}>
									<Text size='sm' fw={600}>
										{t('cases.review.proposalTitle')}
									</Text>
									<Text size='xs' c='dimmed'>
										{rerunning
											? t('cases.review.rerunning')
											: t('cases.review.rerunHint')}
									</Text>
								</Stack>
								{proposals === null ? (
									<Button
										variant='default'
										leftSection={
											rerunning ? (
												<Loader size={14} />
											) : (
												<IconSparkles size={16} />
											)
										}
										disabled={rerunning}
										onClick={rerun}
									>
										{t('cases.review.rerun')}
									</Button>
								) : (
									<Group gap='xs'>
										{proposals.length > 0 && (
											<Button
												variant='default'
												onClick={() => proposals.forEach(adopt)}
											>
												{t('cases.review.adoptAll')}
											</Button>
										)}
										<Button variant='subtle' onClick={() => setProposals(null)}>
											{t('cases.review.discard')}
										</Button>
									</Group>
								)}
							</Group>
							{proposals !== null && (
								<Alert variant='light' color='gray' mt='sm' p='xs'>
									{proposals.length > 0
										? t('cases.review.rerunDone', { count: proposals.length })
										: t('cases.review.rerunNone')}
								</Alert>
							)}
						</Paper>
					)}

					{groups.map(([group, groupItems]) => (
						<Stack key={group} gap='xs'>
							<Text size='xs' fw={600} tt='uppercase' c='dimmed'>
								{group}
							</Text>
							{groupItems.map((item) => (
								<DecisionRow
									key={item.id}
									item={item}
									evaluationType={dispute.evaluationType}
									decision={
										decisions[item.id] ?? { itemId: item.id, outcome: 'keep' }
									}
									flagged={dispute.flaggedItemIds.includes(item.id)}
									reevaluated={proposals !== null}
									proposal={proposals?.find((p) => p.itemId === item.id)}
									onAdopt={() => {
										const proposal = proposals?.find(
											(p) => p.itemId === item.id
										);
										if (proposal) adopt(proposal);
									}}
									onChange={(decision) =>
										setDecisions((prev) => ({ ...prev, [item.id]: decision }))
									}
								/>
							))}
						</Stack>
					))}

					<Paper withBorder p='sm' radius='md'>
						<Stack gap={6}>
							<Group justify='space-between'>
								<Text size='sm' c='dimmed'>
									{t('cases.review.preview')}
								</Text>
								<Group gap='xs'>
									<Text size='sm' c='dimmed'>
										{preview.before ?? '—'}
									</Text>
									<Text size='sm'>→</Text>
									<Text size='sm' fw={700}>
										{preview.after ?? '—'}
									</Text>
								</Group>
							</Group>
							{preview.extra && (
								<Group justify='space-between'>
									<Text size='sm' c='dimmed'>
										{preview.extra.label}
									</Text>
									<Group gap='xs'>
										<Text size='sm' c='dimmed'>
											{preview.extra.before}
										</Text>
										<Text size='sm'>→</Text>
										<Text size='sm' fw={700}>
											{preview.extra.after}
										</Text>
									</Group>
								</Group>
							)}
						</Stack>
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
							label={t(
								missingNote ? 'cases.review.needNote' : 'cases.review.needItems'
							)}
							disabled={!acceptBlocked}
							withArrow
						>
							<Button
								color={status === 'accepted' ? 'green' : 'yellow'}
								disabled={acceptBlocked}
								onClick={handleAccept}
							>
								{t(
									status === 'accepted'
										? 'cases.review.accept'
										: 'cases.review.acceptPartial'
								)}
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
