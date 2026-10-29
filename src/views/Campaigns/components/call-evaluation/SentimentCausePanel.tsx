import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Menu,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconCheck,
	IconChevronDown,
	IconRotate,
	IconTargetArrow,
} from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import { causeIcon } from '~/modules/qa/sentimentCauses/components/causeIcons';
import {
	SENTIMENT_CAUSES_NS,
	SENTIMENT_CAUSE_FAMILY_ORDER,
} from '~/modules/qa/sentimentCauses/constants';
import {
	effectivePrimaryCause,
	reviewStatusOf,
} from '~/modules/qa/sentimentCauses/helpers';
import type {
	CallSentimentCause,
	SentimentCauseReviewStatus,
} from '~/modules/qa/sentimentCauses/types';
import {
	causeKeysOfFamily,
	useCauseCatalogue,
	useCauseFamily,
	useCauseLabel,
	useCauseSettings,
} from '~/modules/qa/sentimentCauses/useCauseSettings';
import {
	selectReview,
	useSentimentCauseReviewStore,
} from '~/stores/qa/sentimentCauseReviewStore';
import type { TimelineAnchor } from '../../types';
import { EvidenceQuote } from './EvidenceQuote';
import { ALERT, flagTone } from './tone';

interface SentimentCausePanelProps {
	cause: CallSentimentCause | null;
	callId: string;
	/** The evidence turn, jumpable. Null when the call has no evidence or no player. */
	anchor: TimelineAnchor | null;
	activeAnchorId: string | null;
	onJump?: (anchor: TimelineAnchor) => void;
	/** Reviewers confirm or change the cause; agents never reach this panel. */
	canReview: boolean;
}

/** Outlined means "not decided yet"; a decision reads filled. Grey throughout: the review is not an alert. */
const REVIEW_VARIANT: Record<SentimentCauseReviewStatus, 'outline' | 'light'> =
	{
		pending: 'outline',
		confirmed: 'light',
		corrected: 'light',
	};

/** Why the customer's sentiment dropped, the AI's evidence, and the reviewer's decision. */
export function SentimentCausePanel({
	cause,
	callId,
	anchor,
	activeAnchorId,
	onJump,
	canReview,
}: SentimentCausePanelProps) {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	const settings = useCauseSettings();
	const { custom: customCauses } = useCauseCatalogue();
	const causeLabel = useCauseLabel();
	const familyOf = useCauseFamily();
	const review = useSentimentCauseReviewStore(selectReview(callId));
	const confirm = useSentimentCauseReviewStore((s) => s.confirm);
	const correct = useSentimentCauseReviewStore((s) => s.correct);
	const reset = useSentimentCauseReviewStore((s) => s.reset);
	const status = reviewStatusOf(review);
	const primary = effectivePrimaryCause(cause, review);
	const PrimaryIcon = primary ? causeIcon(primary) : IconTargetArrow;
	/** Families with at least one cause left to offer: not the current one, not switched off in Settings. */
	const correctionGroups = SENTIMENT_CAUSE_FAMILY_ORDER.map((family) => ({
		family,
		keys: causeKeysOfFamily(customCauses, family).filter(
			(key) => key !== primary && !settings.disabled.includes(key)
		),
	})).filter((group) => group.keys.length > 0);

	return (
		<SectionCard
			title={t('callPanel.title')}
			description={t('callPanel.description')}
			icon={IconTargetArrow}
			headerActions={
				cause && (
					<Group gap='xs'>
						<Badge
							{...flagTone(cause.sentimentDrop >= settings.strongDrop)}
							size='lg'
						>
							{t('callPanel.dropValue', {
								value: cause.sentimentDrop.toFixed(1),
							})}
						</Badge>
						<Badge
							size='lg'
							color='gray'
							variant={REVIEW_VARIANT[status]}
							tt='none'
						>
							{t(`review.${status}`)}
						</Badge>
					</Group>
				)
			}
		>
			{!cause || !primary ? (
				<Text size='sm' c='dimmed'>
					{t('callPanel.noCause')}
				</Text>
			) : (
				<Stack gap='md'>
					{/* Primary cause */}
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<ThemeIcon size={48} radius='md' variant='light' color={ALERT}>
							<PrimaryIcon size={28} />
						</ThemeIcon>
						<Stack gap={2}>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
								{t('callPanel.primary')}
							</Text>
							<Group gap='xs' wrap='wrap'>
								<Text fw={700} size='lg'>
									{causeLabel(primary)}
								</Text>
								<Badge size='sm' variant='outline' color='gray' tt='none'>
									{t(`families.${familyOf(primary)}`)}
								</Badge>
							</Group>
							{status === 'corrected' && (
								<Text size='xs' c='dimmed'>
									{t('review.correctedFrom', {
										cause: causeLabel(cause.primary),
									})}
								</Text>
							)}
						</Stack>
					</Group>

					{/* Evidence */}
					{cause.evidence && (
						<div>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
								{t('callPanel.evidence')}
							</Text>
							<EvidenceQuote
								evidence={cause.evidence}
								callId={callId}
								active={anchor !== null && anchor.id === activeAnchorId}
								onPlay={anchor && onJump ? () => onJump(anchor) : undefined}
							/>
						</div>
					)}

					{/* Secondary causes */}
					{cause.secondary.length > 0 && (
						<div>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
								{t('callPanel.secondary')}
							</Text>
							<Group gap='xs'>
								{cause.secondary.map((key) => {
									const Icon = causeIcon(key);
									return (
										<Badge
											key={key}
											variant='light'
											color='gray'
											tt='none'
											leftSection={<Icon size={12} />}
										>
											{causeLabel(key)}
										</Badge>
									);
								})}
							</Group>
						</div>
					)}

					{/* Review actions */}
					{canReview && (
						<Group gap='xs'>
							{status === 'pending' && (
								<Button
									size='xs'
									variant='light'
									color='gray'
									leftSection={<IconCheck size={14} />}
									onClick={() => confirm(callId)}
								>
									{t('review.confirm')}
								</Button>
							)}
							<Menu withinPortal position='bottom-start' shadow='md'>
								<Menu.Target>
									<Button
										size='xs'
										variant='subtle'
										color='gray'
										rightSection={<IconChevronDown size={14} />}
									>
										{t('review.correct')}
									</Button>
								</Menu.Target>
								<Menu.Dropdown>
									{correctionGroups.map(({ family, keys }) => (
										<Fragment key={family}>
											<Menu.Label>{t(`families.${family}`)}</Menu.Label>
											{keys.map((key) => {
												const Icon = causeIcon(key);
												return (
													<Menu.Item
														key={key}
														leftSection={<Icon size={14} />}
														onClick={() => correct(callId, key)}
													>
														{causeLabel(key)}
													</Menu.Item>
												);
											})}
										</Fragment>
									))}
								</Menu.Dropdown>
							</Menu>
							{status !== 'pending' && (
								<Button
									size='xs'
									variant='subtle'
									color='gray'
									leftSection={<IconRotate size={14} />}
									onClick={() => reset(callId)}
								>
									{t('review.reset')}
								</Button>
							)}
						</Group>
					)}
				</Stack>
			)}
		</SectionCard>
	);
}
