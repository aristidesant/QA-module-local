import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
	Anchor,
	Badge,
	Button,
	Collapse,
	Group,
	Paper,
	SegmentedControl,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type {
	DisputeEvaluationType,
	DisputeItemAnalysis,
	DisputeItemDecision,
	DisputeItemRef,
} from '~/models/qa/disputeCases';
import type { Emotion } from '~/modules/qa/emotion-sentiment/types';
import {
	EMOTION_LABELS,
	SENTIMENT_CATEGORIES,
	SENTIMENT_CATEGORY_ORDER,
} from '~/views/Campaigns/constants';
import { MIN_ITEM_NOTE } from '../../constants';
import type { ReevaluationProposal } from '../../reevaluate';

const KEEP = 'keep';

/** Human label of a corrected value, for the review controls and the resolution card. */
export function correctedValueLabel(
	item: DisputeItemRef,
	value: string | undefined,
	t: TFunction<'qa.disputes'>
): string {
	if (!value) return '';
	switch (item.kind) {
		case 'sentiment-category':
			return (
				SENTIMENT_CATEGORIES[value as keyof typeof SENTIMENT_CATEGORIES]
					?.label ?? value
			);
		case 'emotion':
			return EMOTION_LABELS[value as Emotion] ?? value;
		case 'compliance':
			return t(
				`cases.review.${value === 'warning' ? 'warning' : value === 'violation' ? 'violation' : 'compliant'}`
			);
		case 'recovery':
			return t(
				`cases.review.${value === 'recovered' ? 'recovered' : 'notRecovered'}`
			);
		default:
			return t(
				`cases.review.${value === 'yes' ? 'markMet' : value === 'converted' ? 'converted' : 'notDetected'}`
			);
	}
}

/** The one corrected value a binary item can take, by evaluation type. */
const binaryCorrection = (item: DisputeItemRef, type: DisputeEvaluationType) =>
	type === 'qa'
		? 'yes'
		: item.value === 'not-converted'
			? 'converted'
			: 'not-detected';

/** Keeps only the analysis fields that differ from what the AI wrote. */
const diffAnalysis = (
	original: DisputeItemAnalysis | undefined,
	next: DisputeItemAnalysis
): DisputeItemAnalysis | undefined => {
	const out: DisputeItemAnalysis = {};
	(['note', 'evidenceTimestamp', 'evidenceQuote'] as const).forEach((key) => {
		if (next[key] !== undefined && next[key] !== (original?.[key] ?? '')) {
			out[key] = next[key];
		}
	});
	return Object.keys(out).length > 0 ? out : undefined;
};

interface DecisionRowProps {
	item: DisputeItemRef;
	evaluationType: DisputeEvaluationType;
	decision: DisputeItemDecision;
	flagged: boolean;
	/** Set once the AI has been asked to evaluate the call again. */
	reevaluated: boolean;
	proposal?: ReevaluationProposal;
	onAdopt: () => void;
	onChange: (decision: DisputeItemDecision) => void;
}

/**
 * One disputable item with the control that fits its kind: keep / correct for
 * yes-no items, three outcomes plus an editable analysis for compliance
 * findings, a picker for sentiment categories and emotions. Compliance changes
 * also need a justification, and an AI re-evaluation shows up as a proposal.
 */
export const DecisionRow: React.FC<DecisionRowProps> = ({
	item,
	evaluationType,
	decision,
	flagged,
	reevaluated,
	proposal,
	onAdopt,
	onChange,
}) => {
	const { t } = useTranslation('qa.disputes');
	const [editing, setEditing] = useState(Boolean(decision.edits));

	const keep = () => onChange({ itemId: item.id, outcome: 'keep' });
	const correct = (value: string) =>
		onChange({
			itemId: item.id,
			outcome: 'correct',
			value,
			note: decision.note,
		});

	const status =
		decision.outcome === 'correct'
			? (decision.value ?? item.value)
			: item.value;
	const analysis = {
		note: decision.edits?.note ?? item.analysis?.note ?? '',
		evidenceTimestamp:
			decision.edits?.evidenceTimestamp ??
			item.analysis?.evidenceTimestamp ??
			'',
		evidenceQuote:
			decision.edits?.evidenceQuote ?? item.analysis?.evidenceQuote ?? '',
	};

	/** A compliance finding is corrected when its status or its written analysis changed. */
	const updateCompliance = (
		nextStatus: string,
		nextAnalysis: DisputeItemAnalysis
	) => {
		const edits = diffAnalysis(item.analysis, nextAnalysis);
		if (nextStatus === item.value && !edits) return keep();
		onChange({
			itemId: item.id,
			outcome: 'correct',
			value: nextStatus,
			edits,
			note: decision.note,
			source: decision.source,
		});
	};

	const renderControl = () => {
		switch (item.kind) {
			case 'binary':
				return (
					<SegmentedControl
						size='xs'
						value={decision.outcome === 'correct' ? 'correct' : KEEP}
						onChange={(v) =>
							v === KEEP
								? keep()
								: correct(binaryCorrection(item, evaluationType))
						}
						data={[
							{ value: KEEP, label: t('cases.review.keep') },
							{
								value: 'correct',
								label: correctedValueLabel(
									item,
									binaryCorrection(item, evaluationType),
									t
								),
							},
						]}
					/>
				);
			case 'compliance':
				return (
					<SegmentedControl
						size='xs'
						value={status}
						onChange={(v) => updateCompliance(v, analysis)}
						data={[
							{ value: item.value, label: t('cases.review.keep') },
							...(item.value === 'violation'
								? [{ value: 'warning', label: t('cases.review.warning') }]
								: []),
							{ value: 'compliant', label: t('cases.review.compliant') },
						]}
					/>
				);
			case 'recovery': {
				const opposite =
					item.value === 'recovered' ? 'not-recovered' : 'recovered';
				return (
					<SegmentedControl
						size='xs'
						value={decision.outcome === 'correct' ? opposite : KEEP}
						onChange={(v) => (v === KEEP ? keep() : correct(opposite))}
						data={[
							{ value: KEEP, label: t('cases.review.keep') },
							{
								value: opposite,
								label: correctedValueLabel(item, opposite, t),
							},
						]}
					/>
				);
			}
			case 'sentiment-category':
			case 'emotion': {
				const data =
					item.kind === 'sentiment-category'
						? SENTIMENT_CATEGORY_ORDER.map((key) => ({
								value: key,
								label: SENTIMENT_CATEGORIES[key].label,
							}))
						: (Object.keys(EMOTION_LABELS) as Emotion[]).map((key) => ({
								value: key,
								label: EMOTION_LABELS[key],
							}));
				return (
					<Select
						size='xs'
						w={180}
						allowDeselect={false}
						data={data}
						value={
							decision.outcome === 'correct'
								? (decision.value ?? item.value)
								: item.value
						}
						onChange={(v) => (!v || v === item.value ? keep() : correct(v))}
					/>
				);
			}
			default:
				return null;
		}
	};

	const isCompliance = item.kind === 'compliance';
	const needsNote = isCompliance && decision.outcome === 'correct';
	const note = decision.note ?? '';
	const adopted = decision.source === 'ai-reevaluation';

	return (
		<Paper withBorder p='sm' radius='md'>
			<Stack gap='xs'>
				<Group
					justify='space-between'
					align='flex-start'
					wrap='nowrap'
					gap='md'
				>
					<Stack gap={4}>
						<Text size='sm' fw={600}>
							{item.label}
						</Text>
						<Group gap={6}>
							<Badge variant='light' color='gray' tt='none'>
								{item.original}
							</Badge>
							{flagged && (
								<Badge variant='outline' color='gray' size='xs'>
									{t('cases.review.flagged')}
								</Badge>
							)}
						</Group>
					</Stack>
					{renderControl()}
				</Group>

				{proposal ? (
					<Paper bg='var(--mantine-color-default-hover)' p='xs' radius='sm'>
						<Group
							justify='space-between'
							align='flex-start'
							wrap='nowrap'
							gap='sm'
						>
							<Stack gap={2}>
								<Group gap={6}>
									<IconSparkles size={14} />
									<Text size='xs' fw={600}>
										{t('cases.review.proposalTitle')}
									</Text>
									<Text size='xs'>
										{item.original} →{' '}
										{correctedValueLabel(item, proposal.value, t)}
									</Text>
								</Group>
								<Text size='xs' c='dimmed'>
									{proposal.reason}
								</Text>
							</Stack>
							{adopted ? (
								<Badge variant='light' color='gray'>
									{t('cases.review.adopted')}
								</Badge>
							) : (
								<Button size='compact-xs' variant='default' onClick={onAdopt}>
									{t('cases.review.adopt')}
								</Button>
							)}
						</Group>
					</Paper>
				) : (
					reevaluated && (
						<Text size='xs' c='dimmed'>
							{t('cases.review.unchanged')}
						</Text>
					)
				)}

				{isCompliance && (
					<>
						<Anchor size='xs' onClick={() => setEditing((open) => !open)}>
							{t(
								editing
									? 'cases.review.hideAnalysis'
									: 'cases.review.editAnalysis'
							)}
						</Anchor>
						<Collapse expanded={editing}>
							<Stack gap='xs'>
								<Textarea
									size='xs'
									label={t('cases.review.findingNote')}
									value={analysis.note}
									onChange={(e) =>
										updateCompliance(status, {
											...analysis,
											note: e.currentTarget.value,
										})
									}
									autosize
									minRows={2}
								/>
								<Group gap='xs' align='flex-start' wrap='nowrap'>
									<TextInput
										size='xs'
										w={110}
										label={t('cases.review.evidenceTime')}
										value={analysis.evidenceTimestamp}
										onChange={(e) =>
											updateCompliance(status, {
												...analysis,
												evidenceTimestamp: e.currentTarget.value,
											})
										}
									/>
									<Textarea
										size='xs'
										flex={1}
										label={t('cases.review.evidenceQuote')}
										value={analysis.evidenceQuote}
										onChange={(e) =>
											updateCompliance(status, {
												...analysis,
												evidenceQuote: e.currentTarget.value,
											})
										}
										autosize
										minRows={2}
									/>
								</Group>
							</Stack>
						</Collapse>
					</>
				)}

				{needsNote && (
					<Textarea
						size='xs'
						label={t('cases.review.note')}
						placeholder={t('cases.review.notePlaceholder')}
						value={note}
						onChange={(e) =>
							onChange({ ...decision, note: e.currentTarget.value })
						}
						error={
							note.trim().length > 0 && note.trim().length < MIN_ITEM_NOTE
								? t('cases.review.noteMin', { count: MIN_ITEM_NOTE })
								: undefined
						}
						autosize
						minRows={2}
					/>
				)}
			</Stack>
		</Paper>
	);
};

export default DecisionRow;
