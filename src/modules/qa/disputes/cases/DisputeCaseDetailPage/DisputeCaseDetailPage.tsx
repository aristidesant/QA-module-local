import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Alert,
	Anchor,
	Badge,
	Blockquote,
	Group,
	ScrollArea,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import {
	IconArrowLeft,
	IconClock,
	IconMessageReport,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { StatCard } from '~/components/StatCard';
import MockAudioPlayerBar from '~/modules/evaluations-demo/components/MockAudioPlayerBar';
import DemoTranscript from '~/modules/evaluations-demo/components/DemoTranscript';
import { QAEvaluationPanel } from '~/views/Campaigns/components/call-evaluation/QAEvaluationPanel';
import { SentimentEmotionPanel } from '~/views/Campaigns/components/call-evaluation/SentimentEmotionPanel';
import { CompliancePanel } from '~/views/Campaigns/components/call-evaluation/CompliancePanel';
import { BusinessInsightsPanel } from '~/views/Campaigns/components/call-evaluation/BusinessInsightsPanel';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import {
	disputesListPath,
	inboxRoleFromPath,
} from '~/modules/qa/inbox/constants';
import {
	applyCorrections,
	detectedSignalCount,
	listDisputableItems,
} from '../recalc';
import {
	casesForRole,
	daysOpen,
	fromMockNow,
	getDisputeCall,
	toDemoTurns,
} from '../helpers';
import { STATUS_COLOR } from '../constants';
import ReviewPanel from './components/ReviewPanel';
import { correctedValueLabel } from './components/DecisionRow';
import styles from '../Disputes.module.css';

dayjs.extend(relativeTime);

/**
 * The disputed call as the agent saw it — player, transcript and the contested
 * evaluation — plus their statement and, for the QA Manager, the review panel.
 */
export const DisputeCaseDetailPage: React.FC = () => {
	const { t } = useTranslation('qa.disputes');
	const { disputeId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const role = inboxRoleFromPath(location.pathname);
	const allCases = useDisputesStore(selectCases);

	const dispute = useMemo(
		() => casesForRole(allCases, role).find((c) => c.id === disputeId) ?? null,
		[allCases, role, disputeId]
	);

	const [view, setView] = useState<'original' | 'corrected'>('corrected');

	const call = useMemo(
		() => (dispute ? getDisputeCall(dispute) : null),
		[dispute]
	);
	const corrected = useMemo(
		() =>
			dispute && call
				? applyCorrections(call, dispute.evaluationType, dispute.decisions)
				: null,
		[dispute, call]
	);
	const items = useMemo(
		() =>
			dispute && call ? listDisputableItems(call, dispute.evaluationType) : [],
		[dispute, call]
	);

	if (!dispute || !call || !corrected) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('cases.detail.notFound')}
					action={
						<Anchor onClick={() => navigate(disputesListPath(role))}>
							{t('cases.detail.back')}
						</Anchor>
					}
				/>
			</ContentContainer>
		);
	}

	const typeMeta = CALL_EVALUATION_TABS.find(
		(tab) => tab.key === dispute.evaluationType
	);
	const isBusiness = dispute.evaluationType === 'business-insights';
	const hasCorrections =
		dispute.status === 'accepted' || dispute.status === 'partially-accepted';
	const shown = hasCorrections && view === 'corrected' ? corrected : call;
	const flagged = items.filter((item) =>
		dispute.flaggedItemIds.includes(item.id)
	);

	/** Business Insights has no score, so the strip counts detected signals instead. */
	const before = isBusiness ? detectedSignalCount(call) : dispute.scoreBefore;
	const after = isBusiness
		? hasCorrections
			? detectedSignalCount(corrected)
			: null
		: dispute.scoreAfter;
	const change =
		before !== null && after !== null
			? Math.round((after - before) * 10) / 10
			: null;

	const renderPanel = () => {
		switch (dispute.evaluationType) {
			case 'qa':
				return <QAEvaluationPanel qa={shown.qa} />;
			case 'sentiment-emotion':
				return <SentimentEmotionPanel sentiment={shown.sentiment} />;
			case 'compliance':
				return <CompliancePanel compliance={shown.compliance} />;
			case 'business-insights':
				return <BusinessInsightsPanel business={shown.business} />;
			default:
				return null;
		}
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Anchor
						size='sm'
						onClick={() => navigate(disputesListPath(role))}
						mb='xs'
						inline
					>
						<Group gap={4} wrap='nowrap'>
							<IconArrowLeft size={14} />
							{t('cases.detail.back')}
						</Group>
					</Anchor>
					<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
						{dispute.id}
					</Text>
					<Group gap='sm' align='center'>
						<Title order={1}>
							{t('cases.detail.title', {
								type: t(`cases.types.${dispute.evaluationType}`),
								agent: dispute.agentName,
							})}
						</Title>
						<Badge
							variant='light'
							color={STATUS_COLOR[dispute.status]}
							size='lg'
						>
							{t(`cases.status.${dispute.status}`)}
						</Badge>
						<Badge variant='light' color={typeMeta?.color ?? 'gray'} size='lg'>
							{t(`cases.types.${dispute.evaluationType}`)}
						</Badge>
					</Group>
					<Text c='dimmed' mt='xs'>
						{t('cases.detail.openedBy', {
							agent: dispute.agentName,
							when: fromMockNow(dispute.createdAt),
						})}
						{dispute.resolvedAt &&
							` · ${t('cases.detail.resolvedBy', {
								status: t(`cases.status.${dispute.status}`),
								name: dispute.resolvedBy,
								date: dayjs(dispute.resolvedAt).format('DD MMM YYYY'),
							})}`}
					</Text>
				</div>

				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard
						title={t(
							isBusiness
								? 'cases.detail.summary.signalsBefore'
								: 'cases.detail.summary.before'
						)}
						value={before ?? '—'}
					/>
					<StatCard
						title={t(
							isBusiness
								? 'cases.detail.summary.signalsAfter'
								: 'cases.detail.summary.after'
						)}
						value={after ?? t('cases.detail.summary.pending')}
						color={after !== null ? 'green' : undefined}
					/>
					<StatCard
						title={t('cases.detail.summary.change')}
						value={change === null ? '—' : `${change > 0 ? '+' : ''}${change}`}
						color={
							change === null
								? undefined
								: change > 0
									? 'green'
									: change < 0
										? 'red'
										: undefined
						}
					/>
					<StatCard
						title={t('cases.detail.summary.daysOpen')}
						value={daysOpen(dispute)}
					/>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, lg: 2 }} spacing='lg'>
					<Stack gap='lg'>
						<SectionCard title={t('cases.detail.recording')}>
							<MockAudioPlayerBar durationSeconds={call.durationSeconds} />
						</SectionCard>

						<SectionCard
							title={t('cases.detail.transcript')}
							headerActions={
								<Badge size='sm' variant='light'>
									{t('cases.detail.turns', {
										count: call.transcript.length,
									})}
								</Badge>
							}
						>
							<ScrollArea h={420}>
								<DemoTranscript turns={toDemoTurns(call.transcript)} />
							</ScrollArea>
						</SectionCard>
					</Stack>

					<Stack gap='lg'>
						<SectionCard
							icon={IconMessageReport}
							title={t('cases.detail.statement')}
						>
							<Stack gap='md'>
								<Blockquote color={typeMeta?.color ?? 'blue'} p='md'>
									<Text size='sm' className={styles.statement}>
										{dispute.agentComment}
									</Text>
								</Blockquote>
								<div>
									<Text size='xs' c='dimmed' mb={6}>
										{t('cases.detail.flaggedItems')}
									</Text>
									{flagged.length === 0 ? (
										<Text size='sm' c='dimmed'>
											{t('cases.detail.noFlaggedItems')}
										</Text>
									) : (
										<Group gap={6} wrap='wrap'>
											{flagged.map((item) => (
												<Badge
													key={item.id}
													variant='outline'
													color='gray'
													tt='none'
												>
													{item.label}
												</Badge>
											))}
										</Group>
									)}
								</div>
							</Stack>
						</SectionCard>

						<SectionCard
							title={t('cases.detail.evaluation')}
							headerActions={
								hasCorrections ? (
									<SegmentedControl
										size='xs'
										value={view}
										onChange={(value) =>
											setView(value as 'original' | 'corrected')
										}
										data={[
											{
												value: 'original',
												label: t('cases.detail.view.original'),
											},
											{
												value: 'corrected',
												label: t('cases.detail.view.corrected'),
											},
										]}
									/>
								) : undefined
							}
						>
							{renderPanel()}
						</SectionCard>

						{dispute.status !== 'open' && (
							<SectionCard
								headerAccent={
									dispute.status === 'accepted'
										? 'green'
										: dispute.status === 'partially-accepted'
											? 'yellow'
											: 'red'
								}
								title={t('cases.detail.resolution.title')}
							>
								<Stack gap='md'>
									<div>
										<Text size='xs' c='dimmed' mb={4}>
											{t('cases.detail.resolution.managerComment')}
										</Text>
										<Text size='sm' className={styles.statement}>
											{dispute.managerComment}
										</Text>
									</div>
									{dispute.decisions.length === 0 ? (
										<Text size='sm' c='dimmed'>
											{t('cases.detail.resolution.none')}
										</Text>
									) : (
										<div>
											<Text size='xs' c='dimmed' mb={6}>
												{t('cases.detail.resolution.corrections')}
											</Text>
											<div className={styles.tableSurface}>
												<Table verticalSpacing='xs'>
													<Table.Tbody>
														{dispute.decisions.map((decision) => {
															const item = items.find(
																(i) => i.id === decision.itemId
															);
															if (!item) return null;
															const changed = decision.outcome === 'correct';
															const statusChanged =
																item.kind !== 'compliance' ||
																decision.value !== item.value;
															return (
																<Table.Tr key={decision.itemId}>
																	<Table.Td>
																		<Group gap={6} wrap='nowrap'>
																			<Text size='sm'>{item.label}</Text>
																			{decision.source ===
																				'ai-reevaluation' && (
																				<Badge
																					size='xs'
																					variant='light'
																					color='gray'
																				>
																					{t(
																						'cases.detail.resolution.aiSource'
																					)}
																				</Badge>
																			)}
																		</Group>
																		{decision.edits?.note !== undefined && (
																			<Text size='xs' c='dimmed'>
																				{t(
																					'cases.detail.resolution.updatedNote'
																				)}
																				: {decision.edits.note}
																			</Text>
																		)}
																		{decision.edits?.evidenceQuote !==
																			undefined && (
																			<Text size='xs' c='dimmed'>
																				{t(
																					'cases.detail.resolution.updatedEvidence'
																				)}
																				{decision.edits.evidenceTimestamp
																					? ` ${decision.edits.evidenceTimestamp}`
																					: ''}
																				: &ldquo;{decision.edits.evidenceQuote}
																				&rdquo;
																			</Text>
																		)}
																		{decision.note && (
																			<Text size='xs' c='dimmed'>
																				{decision.note}
																			</Text>
																		)}
																	</Table.Td>
																	<Table.Td
																		align='right'
																		className={styles.nowrapCell}
																	>
																		{changed && statusChanged ? (
																			<Group
																				gap={6}
																				justify='flex-end'
																				wrap='nowrap'
																			>
																				<Text size='sm' c='dimmed'>
																					{item.original}
																				</Text>
																				<Text size='sm'>→</Text>
																				<Text size='sm' fw={600}>
																					{correctedValueLabel(
																						item,
																						decision.value,
																						t
																					)}
																				</Text>
																			</Group>
																		) : (
																			<Text size='sm' c='dimmed'>
																				{t(
																					changed
																						? 'cases.detail.resolution.analysisEdited'
																						: 'cases.detail.resolution.kept'
																				)}
																			</Text>
																		)}
																	</Table.Td>
																</Table.Tr>
															);
														})}
													</Table.Tbody>
												</Table>
											</div>
										</div>
									)}
								</Stack>
							</SectionCard>
						)}

						{dispute.status === 'open' && role === 'qa-manager' && (
							<ReviewPanel dispute={dispute} call={call} items={items} />
						)}

						{dispute.status === 'open' && role !== 'qa-manager' && (
							<Alert color='blue' icon={<IconClock size={18} />}>
								{t('cases.detail.waiting')}
							</Alert>
						)}
					</Stack>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default DisputeCaseDetailPage;
