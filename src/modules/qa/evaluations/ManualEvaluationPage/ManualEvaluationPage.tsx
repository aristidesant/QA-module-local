import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconGitBranch,
	IconHeadphones,
	IconRefresh,
	IconRobot,
	IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import {
	calculateEvaluationScore,
	calculateSectionScores,
} from '~/modules/qa/utils/evaluationScore';
import { UNSUPPORTED_EVALUATION_DETAIL_ERROR } from '~/api/qa/evaluationsApi';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { EVALUATION_STATUS_COLORS } from '~/modules/qa/constants/badgeColors';
import { useQaPermissions } from '~/modules/qa/hooks/useQaPermissions';
import type { EvaluationQuestion } from '~/models/qa';
import DisputeDrawer from '~/modules/qa/evaluations/DisputeDrawer';
import { useCreateAiEvaluationMutation } from '~/queries/qa/conversationsQueries';
import {
	useCreateEvaluationDisputeMutation,
	useEvaluationDisputesQuery,
} from '~/queries/qa/disputesQueries';
import {
	useCompleteEvaluationMutation,
	useDeleteEvaluationMutation,
	useEvaluationDetailQuery,
	useSaveEvaluationAnswerMutation,
} from '~/queries/qa/evaluationsQueries';
import { answerValueToText } from '~/modules/qa/utils/evaluationAnswers';
import { getErrorMessage } from '~/utils/httpClient';
import {
	notifyError,
	notifySuccess,
	notifyWarning,
} from '~/modules/qa/utils/notifications';
import classes from './ManualEvaluationPage.module.css';
import AgentSummaryCard from './components/AgentSummaryCard';
import AiStatusAlerts from './components/AiStatusAlerts';
import DisputeHistoryCard from './components/DisputeHistoryCard';
import QuestionAnswerCard from './components/QuestionAnswerCard';
import ScoreSummaryCard from './components/ScoreSummaryCard';
import SectionScoresCard from './components/SectionScoresCard';

type DraftAnswers = Record<number, string>;

export default function ManualEvaluationPage() {
	const { t } = useTranslation('qa.evaluations');
	const navigate = useNavigate();
	const params = useParams();
	const evaluationId = Number(params.evaluationId);
	const permissions = useQaPermissions();
	const evaluationQuery = useEvaluationDetailQuery(evaluationId);
	const saveAnswerMutation = useSaveEvaluationAnswerMutation(evaluationId);
	const completeEvaluationMutation =
		useCompleteEvaluationMutation(evaluationId);
	const createDisputeMutation =
		useCreateEvaluationDisputeMutation(evaluationId);
	const disputesQuery = useEvaluationDisputesQuery(
		evaluationId,
		Boolean(evaluationQuery.data)
	);
	const deleteEvaluationMutation = useDeleteEvaluationMutation();
	const [draftAnswers, setDraftAnswers] = useState<DraftAnswers>({});
	const [disputeDrawerOpen, setDisputeDrawerOpen] = useState(false);
	const detail = evaluationQuery.data;
	const rerunAiMutation = useCreateAiEvaluationMutation(
		detail?.interactionId ?? NaN
	);
	const score = useMemo(
		() =>
			detail
				? calculateEvaluationScore(detail)
				: {
						answered: 0,
						total: 0,
						maxScore: 0,
						overallScore: 0,
						overallScorePct: 0,
					},
		[detail]
	);
	const sectionScores = useMemo(
		() => (detail ? calculateSectionScores(detail) : []),
		[detail]
	);
	const isCompleted = detail?.status === 'COMPLETED';
	const canCreateDispute = Boolean(
		detail && isCompleted && permissions.canDisputeEvaluations
	);
	const canComplete = score.total > 0 && score.answered === score.total;
	const isAiEvaluation = detail?.evaluatorType === 'AI';
	const aiStatus = detail?.aiEvaluationStatus ?? null;
	const isAiRunning = aiStatus === 'PENDING' || aiStatus === 'PROCESSING';
	// AI evaluations are produced by the LLM and shown read-only.
	const isReadOnly = isCompleted || isAiEvaluation;
	const canRerunAi = Boolean(
		detail?.interactionId && detail?.formId != null && detail?.evaluatorAgentId
	);
	const isUnsupportedDetail =
		evaluationQuery.error instanceof Error &&
		evaluationQuery.error.message === UNSUPPORTED_EVALUATION_DETAIL_ERROR;

	useEffect(() => {
		if (!detail) {
			return;
		}

		const nextDrafts: DraftAnswers = {};

		for (const question of detail.groups.flatMap((group) => group.questions)) {
			if (question.answerType === 'CHOICE') {
				nextDrafts[question.id] = question.answer?.selectedLabel ?? '';
			} else {
				nextDrafts[question.id] = answerValueToText(
					question.answer?.answerValue
				);
			}
		}

		setDraftAnswers(nextDrafts);
	}, [detail]);

	const saveAnswer = async (question: EvaluationQuestion) => {
		const value = draftAnswers[question.id]?.trim() ?? '';

		if (!value) {
			notifyWarning(t('answer.validationRequired'));
			return;
		}

		try {
			await saveAnswerMutation.mutateAsync(
				question.answerType === 'CHOICE'
					? {
							evaluationQuestionId: question.id,
							selectedLabel: value,
						}
					: {
							evaluationQuestionId: question.id,
							answerValue: { text: value },
						}
			);
			notifySuccess(t('answer.saved'));
		} catch (error) {
			notifyError(error);
		}
	};

	const completeEvaluation = async () => {
		if (!canComplete) {
			notifyWarning(t('complete.incomplete'));
			return;
		}

		try {
			await completeEvaluationMutation.mutateAsync();
			notifySuccess(t('complete.success'));
		} catch (error) {
			notifyError(error);
		}
	};

	const rerunAiEvaluation = async () => {
		if (
			!detail ||
			!detail.interactionId ||
			detail.formId == null ||
			!detail.evaluatorAgentId
		) {
			return;
		}

		try {
			await rerunAiMutation.mutateAsync({
				formId: detail.formId,
				agentId: detail.agentId,
				evaluatorAgentId: detail.evaluatorAgentId,
				campaignId: detail.campaignId ?? undefined,
				interactionRef: detail.interactionRef ?? undefined,
			});
			notifySuccess(t('ai.rerunQueued'));
			void evaluationQuery.refetch();
		} catch (error) {
			notifyError(error);
		}
	};

	const createDispute = async (
		payload: Parameters<typeof createDisputeMutation.mutateAsync>[0]
	) => {
		const dispute = await createDisputeMutation.mutateAsync(payload);

		notifySuccess(
			t('disputes.notifications.created', {
				version: dispute.resultingVersion,
			})
		);
		setDisputeDrawerOpen(false);
		navigate(`/qa/evaluations/${dispute.resultingEvaluationId}`);
	};

	const confirmDeleteEvaluation = () => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: { confirm: t('delete.confirm'), cancel: t('delete.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('delete.description', {
						ref: detail?.interactionRef || t('list.notAvailable'),
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteEvaluationMutation.mutateAsync(evaluationId);
					notifySuccess(t('delete.notification'));
					navigate('/qa/evaluations');
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	return (
		<>
			{detail ? (
				<DisputeDrawer
					detail={detail}
					loading={createDisputeMutation.isPending}
					onClose={() => setDisputeDrawerOpen(false)}
					onSubmit={createDispute}
					opened={disputeDrawerOpen}
				/>
			) : null}

			<ContentContainer
				contentWidth='full'
				description={t('detail.description')}
				onBackClick={() => navigate('/qa/evaluations')}
				showBackButton
				title={detail?.formName ?? t('detail.title')}
				titleRight={
					<Group gap='xs'>
						{detail ? (
							<>
								<Badge
									color={EVALUATION_STATUS_COLORS[detail.status]}
									variant='light'
								>
									{t(`status.${detail.status.toLowerCase()}`)}
								</Badge>
								{isAiEvaluation ? (
									<Badge
										color='violet'
										leftSection={<IconRobot size={12} />}
										variant='light'
									>
										{detail.evaluatorAgentName || t('ai.badge')}
									</Badge>
								) : null}
								<Badge color='gray' variant='light'>
									{t('detail.version', { version: detail.version ?? 1 })}
								</Badge>
							</>
						) : null}
						{canCreateDispute ? (
							<Button
								leftSection={<IconGitBranch size={16} />}
								onClick={() => setDisputeDrawerOpen(true)}
								size='sm'
							>
								{t('disputes.actions.create')}
							</Button>
						) : null}
						<Button
							color='red'
							leftSection={<IconTrash size={16} />}
							onClick={confirmDeleteEvaluation}
							size='sm'
							variant='light'
						>
							{t('delete.action')}
						</Button>
					</Group>
				}
			>
				<Stack gap='md'>
					{evaluationQuery.isLoading ? (
						<Group justify='center' py='xl'>
							<Loader size='sm' />
						</Group>
					) : null}

					{evaluationQuery.isError ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							title={
								isUnsupportedDetail
									? t('detail.unsupportedTitle')
									: t('states.errorTitle')
							}
							variant='light'
						>
							<Stack gap='xs'>
								<Text size='sm'>
									{isUnsupportedDetail
										? t('detail.unsupportedDescription')
										: getErrorMessage(evaluationQuery.error)}
								</Text>
								{!isUnsupportedDetail ? (
									<Button
										className={classes.retryButton}
										disabled={evaluationQuery.isFetching}
										leftSection={<IconRefresh size={14} />}
										loading={evaluationQuery.isFetching}
										onClick={() => void evaluationQuery.refetch()}
										size='xs'
										variant='light'
									>
										{t('states.tryAgain')}
									</Button>
								) : null}
							</Stack>
						</Alert>
					) : null}

					{detail && isAiEvaluation ? (
						<AiStatusAlerts
							canRerun={canRerunAi}
							detail={detail}
							isAiRunning={isAiRunning}
							isFailed={aiStatus === 'FAILED'}
							onRerun={() => void rerunAiEvaluation()}
							rerunning={rerunAiMutation.isPending}
						/>
					) : null}

					{detail ? (
						<SimpleGrid cols={{ base: 1, lg: 3 }} spacing='md'>
							<Stack gap='md'>
								{detail.groups.map((group) => (
									<SectionCard
										headerActions={
											<Badge color='gray' variant='light'>
												{t('detail.groupQuestionCount', {
													count: group.questions.length,
												})}
											</Badge>
										}
										key={`${group.name}-${group.sortOrder}`}
										title={group.name}
									>
										<Stack gap='sm'>
											{group.questions.map((question) => (
												<QuestionAnswerCard
													draftValue={draftAnswers[question.id] ?? ''}
													isReadOnly={isReadOnly}
													key={question.id}
													onDraftChange={(value) =>
														setDraftAnswers((current) => ({
															...current,
															[question.id]: value,
														}))
													}
													onSave={() => {
														void saveAnswer(question);
													}}
													question={question}
													saving={saveAnswerMutation.isPending}
													showSaveButton={!isAiEvaluation}
												/>
											))}
										</Stack>
									</SectionCard>
								))}
							</Stack>

							<Stack className={classes.scorePanel} gap='md'>
								<AgentSummaryCard agent={detail.agent} />

								{detail.conversation ? (
									<SectionCard
										icon={IconHeadphones}
										title={t('conversation.title')}
									>
										<Stack gap={4}>
											<Text fw={700} lineClamp={1} size='sm'>
												{detail.conversation.externalRef}
											</Text>
											<Text c='dimmed' lineClamp={1} size='sm'>
												{detail.conversation.customerName}
											</Text>
											<Badge mt={4} variant='light' w='fit-content'>
												{detail.conversation.campaignName}
											</Badge>
										</Stack>
									</SectionCard>
								) : null}

								<ScoreSummaryCard
									canComplete={canComplete}
									completing={completeEvaluationMutation.isPending}
									detail={detail}
									isAiEvaluation={isAiEvaluation}
									isCompleted={isCompleted}
									onComplete={() => {
										void completeEvaluation();
									}}
									score={score}
								/>

								<SectionScoresCard sectionScores={sectionScores} />

								<DisputeHistoryCard
									disputes={disputesQuery.data ?? []}
									error={disputesQuery.error}
									isError={disputesQuery.isError}
									isLoading={disputesQuery.isLoading}
								/>
							</Stack>
						</SimpleGrid>
					) : null}
				</Stack>
			</ContentContainer>
		</>
	);
}
