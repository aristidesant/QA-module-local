import { useEffect, useMemo, useState } from 'react';
import {
	Accordion,
	Badge,
	Box,
	Button,
	Card,
	Group,
	Paper,
	Progress,
	RingProgress,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertOctagon,
	IconAlertTriangle,
	IconCircleCheck,
	IconFlag,
	IconPlayerPlay,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import { QA_ERROR_TYPES, QA_ERROR_TYPE_ORDER } from '../../constants';
import type {
	CallMoment,
	CallMomentStatus,
	CallQAEvaluation,
} from '../../types';
import { flagTone, scoreTone } from './tone';
import { EvidenceQuote } from './EvidenceQuote';
import { MOMENT_STATUS_COLOR, MOMENT_STATUS_VARIANT } from './callMoments';
import { MomentCard } from './MomentCard';

interface QAEvaluationPanelProps {
	qa: CallQAEvaluation;
	/** QA moments anchored to the call. Omit them (e.g. in a dispute review) to show the static evidence quotes only. */
	moments?: CallMoment[];
	activeMomentId?: string | null;
	canReview?: boolean;
	onJump?: (moment: CallMoment) => void;
	onSetStatus?: (id: string, status: CallMomentStatus, note?: string) => void;
	onRemoveMoment?: (id: string) => void;
	onAddMoment?: () => void;
	/** Call detail only: a reveal shows the real data there. */
	callId?: string;
}

const noop = () => {};

/** Delay that lets a just-opened accordion panel lay out before scrolling to a card inside it. */
const SCROLL_DELAY_MS = 180;

export function QAEvaluationPanel({
	qa,
	moments: momentsProp,
	activeMomentId = null,
	canReview = false,
	onJump = noop,
	onSetStatus = noop,
	onRemoveMoment = noop,
	onAddMoment = noop,
	callId,
}: QAEvaluationPanelProps) {
	const momentsEnabled = momentsProp !== undefined;
	const moments = useMemo(() => momentsProp ?? [], [momentsProp]);
	const { t } = useTranslation('qa.calls');
	const [expanded, setExpanded] = useState<string[]>(() =>
		qa.aspects.filter((a) => a.score < a.maxScore).map((a) => a.id)
	);

	const sortedMoments = [...moments].sort((a, b) => a.seconds - b.seconds);
	const confirmedCount = moments.filter((m) => m.status === 'confirmed').length;
	const dismissedCount = moments.filter((m) => m.status === 'dismissed').length;
	// Moments the reviewer flagged without a QA item have no item card to live under.
	const looseMoments = sortedMoments.filter((m) => m.itemId === null);

	// Jumping to a moment opens its aspect and brings its card into view.
	useEffect(() => {
		if (!activeMomentId) return;
		const moment = moments.find((m) => m.id === activeMomentId);
		const aspect = moment?.itemId
			? qa.aspects.find((a) => a.items.some((i) => i.id === moment.itemId))
			: undefined;
		if (aspect)
			setExpanded((prev) =>
				prev.includes(aspect.id) ? prev : [...prev, aspect.id]
			);
		const timer = window.setTimeout(() => {
			document
				.getElementById(`moment-${activeMomentId}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, SCROLL_DELAY_MS);
		return () => window.clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMomentId]);

	const statusIconMap = {
		good: <IconCircleCheck size={16} color='var(--mantine-color-dimmed)' />,
		warning: (
			<IconAlertTriangle size={16} color='var(--mantine-color-dimmed)' />
		),
		critical: <IconAlertOctagon size={16} color='var(--mantine-color-red-6)' />,
	};

	return (
		<Stack gap='md'>
			{/* Header with ring score */}
			<SectionCard padding='lg'>
				<Group align='center' gap='xl' wrap='nowrap'>
					<div>
						<RingProgress
							sections={[
								{
									value: qa.overallScore,
									color: scoreTone(qa.overallScore),
								},
							]}
							label={
								<Text fw={700} size='xl' ta='center'>
									{qa.overallScore}%
								</Text>
							}
							size={124}
							thickness={12}
							roundCaps
						/>
					</div>
					<Stack gap={4} style={{ flex: 1 }}>
						<Text fw={600}>QA Score</Text>
						<Group gap='xs' wrap='wrap'>
							<Badge {...flagTone(!qa.passed)}>
								{qa.passed ? 'Passed' : 'Failed'}
							</Badge>
							<Badge variant='light' color='gray'>
								Threshold {qa.passThreshold}%
							</Badge>
							<Badge {...flagTone(qa.autoFailCount > 0)}>
								{qa.autoFailCount} auto-fails
							</Badge>
						</Group>
						<Text size='xs' c='dimmed'>
							Form: {qa.qaFormName}
						</Text>
					</Stack>
				</Group>
			</SectionCard>

			{/* Key moments */}
			{momentsEnabled && (
				<SectionCard
					title={t('moments.title')}
					description={t('moments.description')}
					headerActions={
						<Group gap='xs' wrap='nowrap'>
							<Badge size='sm' variant='light' color='gray'>
								{t('moments.count', { count: moments.length })}
							</Badge>
							{canReview && (
								<Button
									size='xs'
									variant='default'
									leftSection={<IconFlag size={14} />}
									onClick={onAddMoment}
								>
									{t('moments.add.button')}
								</Button>
							)}
						</Group>
					}
				>
					<Stack gap='sm'>
						{sortedMoments.length === 0 ? (
							<Text size='sm' c='dimmed'>
								{t('moments.empty')}
							</Text>
						) : (
							<>
								<Group gap='xs' wrap='wrap'>
									{sortedMoments.map((m) => (
										<Badge
											key={m.id}
											size='lg'
											tt='none'
											variant={
												m.id === activeMomentId
													? 'filled'
													: MOMENT_STATUS_VARIANT[m.status]
											}
											color={
												m.id === activeMomentId
													? 'gray'
													: MOMENT_STATUS_COLOR[m.status]
											}
											leftSection={<IconPlayerPlay size={12} />}
											className={pointerStyles.pointer}
											onClick={() => onJump(m)}
										>
											{m.timestamp} · {m.errorType}
										</Badge>
									))}
								</Group>
								<Text size='xs' c='dimmed'>
									{t('moments.reviewed', {
										confirmed: confirmedCount,
										dismissed: dismissedCount,
									})}
								</Text>
							</>
						)}
						{looseMoments.map((m) => (
							<MomentCard
								key={m.id}
								moment={m}
								callId={callId}
								active={m.id === activeMomentId}
								canReview={canReview}
								onJump={onJump}
								onSetStatus={onSetStatus}
								onRemove={onRemoveMoment}
							/>
						))}
					</Stack>
				</SectionCard>
			)}

			{/* Error types grid */}
			<SectionCard
				title='Error Types (COPC)'
				description='Score per error type across all evaluated items'
			>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
					{QA_ERROR_TYPE_ORDER.map((code) => {
						const meta = QA_ERROR_TYPES[code];
						const errorType = qa.errorTypes.find((e) => e.code === code)!;
						return (
							<Card key={code} withBorder radius='md' p='md'>
								<Group justify='space-between' align='center' mb='sm'>
									<Tooltip label={meta.description}>
										<Badge color='gray' variant='outline'>
											{code}
										</Badge>
									</Tooltip>
									{statusIconMap[errorType.status]}
								</Group>
								<Text fw={700} size='xl'>
									{errorType.score}%
								</Text>
								<Text size='xs' c='dimmed'>
									{meta.shortLabel}
								</Text>
								<Progress
									value={errorType.score}
									color={scoreTone(errorType.score)}
									size='sm'
									mt='xs'
								/>
								<Text size='xs' c='dimmed' mt={4}>
									{errorType.errorsFound} error(s) · {errorType.itemsEvaluated}{' '}
									items
								</Text>
							</Card>
						);
					})}
				</SimpleGrid>
			</SectionCard>

			{/* Aspects accordion */}
			<SectionCard
				title='Aspects'
				description='Item-level results grouped by aspect'
			>
				<Accordion
					variant='separated'
					multiple
					value={expanded}
					onChange={setExpanded}
				>
					{qa.aspects.map((aspect) => {
						const pct = Math.round((aspect.score / aspect.maxScore) * 100);
						return (
							<Accordion.Item key={aspect.id} value={aspect.id}>
								<Accordion.Control>
									<Group
										justify='space-between'
										pr='md'
										style={{ width: '100%' }}
									>
										<Text fw={600}>{aspect.name}</Text>
										<Group gap='xs'>
											<Text size='sm' c='dimmed'>
												{aspect.score}/{aspect.maxScore} pts
											</Text>
											<Badge color={scoreTone(pct)} variant='light'>
												{pct}%
											</Badge>
										</Group>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap='xs'>
										{aspect.items.map((item) => {
											const itemMoments = sortedMoments.filter(
												(m) => m.itemId === item.id
											);
											const hasEvidence =
												itemMoments.length > 0 || !!item.evidence;
											return (
												<div key={item.id}>
													<Paper
														withBorder
														p='sm'
														radius='sm'
														mb={hasEvidence ? 'xs' : 0}
													>
														<Group
															justify='space-between'
															align='flex-start'
															wrap='nowrap'
														>
															<Stack gap={4}>
																<Text size='sm'>{item.name}</Text>
																<Group gap={6}>
																	<Badge size='xs' color='gray' variant='light'>
																		{item.errorType}
																	</Badge>
																	<Badge
																		size='xs'
																		variant='outline'
																		color='gray'
																	>
																		{item.valuation} pts
																	</Badge>
																</Group>
															</Stack>
															<Box ta='right'>
																<Badge
																	variant={
																		item.answer === 'no' ? 'light' : 'outline'
																	}
																	color={item.answer === 'no' ? 'red' : 'gray'}
																>
																	{item.answer === 'yes'
																		? 'Yes'
																		: item.answer === 'no'
																			? 'No'
																			: 'N/A'}
																</Badge>
																<Text size='xs' c='dimmed' ta='right' mt={4}>
																	{item.awarded}/{item.valuation}
																</Text>
															</Box>
														</Group>
													</Paper>
													{itemMoments.length > 0 ? (
														<Stack gap='xs'>
															{itemMoments.map((m) => (
																<MomentCard
																	key={m.id}
																	moment={m}
																	callId={callId}
																	active={m.id === activeMomentId}
																	canReview={canReview}
																	onJump={onJump}
																	onSetStatus={onSetStatus}
																	onRemove={
																		m.source === 'reviewer'
																			? onRemoveMoment
																			: undefined
																	}
																/>
															))}
														</Stack>
													) : (
														item.evidence && (
															<EvidenceQuote
																evidence={item.evidence}
																callId={callId}
															/>
														)
													)}
												</div>
											);
										})}
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
						);
					})}
				</Accordion>
			</SectionCard>
		</Stack>
	);
}
