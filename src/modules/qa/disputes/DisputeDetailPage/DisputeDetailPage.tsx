import {
	Alert,
	Badge,
	Button,
	Divider,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconArrowRight,
	IconGitBranch,
	IconRefresh,
	IconRobot,
	IconUserCheck,
} from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams, useNavigate } from 'react-router';

import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import {
	EVALUATION_STATUS_COLORS,
	EVALUATOR_TYPE_COLORS,
} from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import type { EvaluationDetail, EvaluationScoreSnapshot } from '~/models/qa';
import { useDisputeQuery } from '~/queries/qa/disputesQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { formatPoints, formatScorePct } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './DisputeDetailPage.module.css';

interface ScoreSnapshotProps {
	label: string;
	snapshot: EvaluationScoreSnapshot;
}

interface EvaluationSummaryProps {
	evaluation: EvaluationDetail;
	label: string;
	version: number;
}

function ScoreSnapshot({ label, snapshot }: ScoreSnapshotProps) {
	const { t } = useTranslation('qa.disputes');

	return (
		<Stack className={classes.scoreCell} gap={4}>
			<Text c='dimmed' size='xs'>
				{label}
			</Text>
			<Text fw={700} size='lg'>
				{t('detail.score.percent', {
					percent: formatScorePct(snapshot.overallScorePct),
				})}
			</Text>
			<Text c='dimmed' size='xs'>
				{t('detail.score.points', {
					score: formatPoints(snapshot.overallScore),
					max: formatPoints(snapshot.maxScore),
				})}
			</Text>
		</Stack>
	);
}

function getEvaluatorLabel(
	evaluation: EvaluationDetail,
	t: TFunction<'qa.disputes'>
) {
	if (evaluation.evaluatorType === 'AI') {
		return (
			evaluation.evaluatorAgentName ||
			(evaluation.evaluatorAgentId
				? t('detail.evaluation.evaluatorAgentFallback', {
						id: evaluation.evaluatorAgentId,
					})
				: t('detail.evaluation.evaluatorUnavailable'))
		);
	}

	return evaluation.evaluatorUserId
		? t('detail.evaluation.evaluatorUserFallback', {
				id: evaluation.evaluatorUserId,
			})
		: t('detail.evaluation.evaluatorUnavailable');
}

function getInteractionLabel(
	evaluation: EvaluationDetail,
	t: TFunction<'qa.disputes'>
) {
	return (
		evaluation.interactionRef ||
		evaluation.conversation?.externalRef ||
		t('detail.evaluation.unavailable')
	);
}

function getCampaignLabel(
	evaluation: EvaluationDetail,
	t: TFunction<'qa.disputes'>
) {
	return (
		evaluation.conversation?.campaignName ||
		(evaluation.campaignId
			? t('detail.evaluation.campaignFallback', { id: evaluation.campaignId })
			: t('detail.evaluation.unavailable'))
	);
}

function EvaluationSummary({
	evaluation,
	label,
	version,
}: EvaluationSummaryProps) {
	const { t } = useTranslation('qa.disputes');
	const agentName = evaluation.agent
		? getAgentDisplayName(evaluation.agent)
		: t('detail.evaluation.agentFallback', { id: evaluation.agentId });
	const evaluatorLabel = getEvaluatorLabel(evaluation, t);
	const TypeIcon =
		evaluation.evaluatorType === 'AI' ? IconRobot : IconUserCheck;

	return (
		<SectionCard
			icon={IconGitBranch}
			title={label}
			headerActions={
				<Badge color='gray' variant='light'>
					{t('detail.evaluation.version', {
						version,
					})}
				</Badge>
			}
		>
			<Stack gap='xs'>
				<Group gap='xs'>
					<Badge
						color={EVALUATOR_TYPE_COLORS[evaluation.evaluatorType]}
						leftSection={<TypeIcon size={12} />}
						variant='light'
					>
						{t(
							`detail.evaluation.evaluatorTypes.${evaluation.evaluatorType.toLowerCase()}`
						)}
					</Badge>
				</Group>
				<Text fw={700} size='sm'>
					{evaluation.formName}
				</Text>
				<Text c='dimmed' size='sm'>
					{t('detail.evaluation.agent', { name: agentName })}
				</Text>
				<Text c='dimmed' size='sm'>
					{t('detail.evaluation.evaluator', { name: evaluatorLabel })}
				</Text>
				<Group gap='xs'>
					<Badge
						color={EVALUATION_STATUS_COLORS[evaluation.status]}
						variant='light'
					>
						{t(`detail.evaluation.status.${evaluation.status.toLowerCase()}`)}
					</Badge>
					<Badge color='blue' variant='light'>
						{t('detail.score.percent', {
							percent: formatScorePct(evaluation.overallScorePct),
						})}
					</Badge>
				</Group>
				<Divider />
				<Stack gap={2}>
					<Text c='dimmed' size='xs'>
						{t('detail.evaluation.campaign')}
					</Text>
					<Text size='sm'>{getCampaignLabel(evaluation, t)}</Text>
				</Stack>
				<Stack gap={2}>
					<Text c='dimmed' size='xs'>
						{t('detail.evaluation.interaction')}
					</Text>
					<Text size='sm'>{getInteractionLabel(evaluation, t)}</Text>
				</Stack>
				<Button
					className={classes.evaluationLink}
					component={RouterLink}
					rightSection={<IconArrowRight size={14} />}
					size='xs'
					to={`/qa/evaluations/${evaluation.id}`}
					variant='light'
				>
					{t('detail.evaluation.open')}
				</Button>
			</Stack>
		</SectionCard>
	);
}

interface CorrectionSummaryProps {
	after: EvaluationScoreSnapshot;
	before: EvaluationScoreSnapshot;
	createdAt: string;
	disputedByLabel: string;
	reason: string;
	scoreDelta: number;
}

function CorrectionSummary({
	after,
	before,
	createdAt,
	disputedByLabel,
	reason,
	scoreDelta,
}: CorrectionSummaryProps) {
	const { t } = useTranslation('qa.disputes');
	const dateFormatter = useDateFormatter('dateTime');

	return (
		<SectionCard icon={IconGitBranch} title={t('detail.correction.title')}>
			<Stack gap='sm'>
				<Group gap='xs'>
					<Badge color={scoreDelta >= 0 ? 'green' : 'red'} variant='light'>
						{t('scoreDelta', { delta: formatPoints(scoreDelta) })}
					</Badge>
					<Badge color='blue' variant='light'>
						{dateFormatter.format(new Date(createdAt))}
					</Badge>
				</Group>
				<Text size='sm'>{reason}</Text>
				<Text c='dimmed' size='sm'>
					{t('detail.correction.disputedBy', { name: disputedByLabel })}
				</Text>
				<div className={classes.scoreGrid}>
					<ScoreSnapshot label={t('detail.summary.before')} snapshot={before} />
					<ScoreSnapshot label={t('detail.summary.after')} snapshot={after} />
				</div>
			</Stack>
		</SectionCard>
	);
}

export default function DisputeDetailPage() {
	const { t } = useTranslation('qa.disputes');
	const navigate = useNavigate();
	const params = useParams();
	const disputeId = Number(params.disputeId);
	const disputeQuery = useDisputeQuery(disputeId);
	const dispute = disputeQuery.data;
	const dateFormatter = useDateFormatter('dateTime');
	const disputedByLabel = dispute?.disputedByUserName
		? dispute.disputedByUserName
		: dispute?.disputedByUserId
			? t('detail.summary.disputedByUserFallback', {
					id: dispute.disputedByUserId,
				})
			: t('detail.summary.disputedByUnavailable');
	const hasVersionMismatch = Boolean(
		dispute &&
		dispute.resulting.version != null &&
		dispute.resulting.version !== dispute.resultingVersion
	);

	return (
		<ContentContainer
			contentWidth='full'
			description={t('detail.description')}
			onBackClick={() => navigate('/qa/disputes')}
			showBackButton
			title={t('detail.title')}
			titleRight={
				dispute ? (
					<Badge
						color={dispute.scoreDelta >= 0 ? 'green' : 'red'}
						variant='light'
					>
						{t('scoreDelta', { delta: formatPoints(dispute.scoreDelta) })}
					</Badge>
				) : null
			}
		>
			<Stack gap='md'>
				{disputeQuery.isLoading ? (
					<Group justify='center' py='xl'>
						<Loader size='sm' />
					</Group>
				) : null}

				{disputeQuery.isError ? (
					<Alert
						color='red'
						icon={<IconAlertTriangle size={16} />}
						title={t('detail.states.errorTitle')}
						variant='light'
					>
						<Group justify='space-between'>
							<Text size='sm'>{getErrorMessage(disputeQuery.error)}</Text>
							<Button
								leftSection={<IconRefresh size={14} />}
								onClick={() => void disputeQuery.refetch()}
								size='xs'
								variant='light'
							>
								{t('list.actions.retry')}
							</Button>
						</Group>
					</Alert>
				) : null}

				{dispute ? (
					<>
						<SectionCard icon={IconGitBranch} title={t('detail.summary.title')}>
							<Stack gap='sm'>
								<Text fw={700} size='sm'>
									{t('detail.summary.auditSentence', {
										disputeId: dispute.id,
										sourceVersion: dispute.source.version ?? 1,
										resultingVersion: dispute.resultingVersion,
									})}
								</Text>
								<Group gap='xs'>
									<Badge color='gray' variant='light'>
										{t('detail.summary.resultingVersion', {
											version: dispute.resultingVersion,
										})}
									</Badge>
									<Badge color='blue' variant='light'>
										{dateFormatter.format(new Date(dispute.createdAt))}
									</Badge>
									<Badge
										color={EVALUATOR_TYPE_COLORS[dispute.source.evaluatorType]}
										variant='light'
									>
										{t(
											`detail.evaluation.evaluatorTypes.${dispute.source.evaluatorType.toLowerCase()}`
										)}
									</Badge>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('detail.correction.disputedBy', { name: disputedByLabel })}
								</Text>
								<Text size='sm'>{dispute.reason}</Text>
								<Stack className={classes.scoreCell} gap={4}>
									<Text c='dimmed' size='xs'>
										{t('detail.summary.delta')}
									</Text>
									<Text fw={700} size='lg'>
										{t('scoreDelta', {
											delta: formatPoints(dispute.scoreDelta),
										})}
									</Text>
									<Text c='dimmed' size='xs'>
										{t('detail.summary.deltaDescription')}
									</Text>
								</Stack>
							</Stack>
						</SectionCard>

						{hasVersionMismatch ? (
							<Alert
								color='yellow'
								icon={<IconAlertTriangle size={16} />}
								title={t('detail.states.versionMismatchTitle')}
								variant='light'
							>
								{t('detail.states.versionMismatchDescription', {
									nestedVersion: dispute.resulting.version,
									auditVersion: dispute.resultingVersion,
								})}
							</Alert>
						) : null}

						<SimpleGrid cols={{ base: 1, lg: 3 }} spacing='md'>
							<EvaluationSummary
								evaluation={dispute.source}
								label={t('detail.source.title')}
								version={dispute.source.version ?? 1}
							/>
							<div className={classes.flowMiddle}>
								<ThemeIcon
									className={classes.flowIcon}
									color='green'
									radius='xl'
									size='lg'
									variant='light'
								>
									<IconArrowRight size={18} />
								</ThemeIcon>
								<CorrectionSummary
									after={dispute.after}
									before={dispute.before}
									createdAt={dispute.createdAt}
									disputedByLabel={disputedByLabel}
									reason={dispute.reason}
									scoreDelta={dispute.scoreDelta}
								/>
							</div>
							<EvaluationSummary
								evaluation={dispute.resulting}
								label={t('detail.resulting.title')}
								version={dispute.resultingVersion}
							/>
						</SimpleGrid>
					</>
				) : null}
			</Stack>
		</ContentContainer>
	);
}
