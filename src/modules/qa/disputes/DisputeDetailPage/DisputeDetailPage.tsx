import {
	Alert,
	Badge,
	Button,
	Divider,
	Grid,
	Group,
	Loader,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconDownload,
	IconGitBranch,
	IconMicrophone,
	IconRefresh,
	IconRobot,
	IconUserCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { EVALUATOR_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useDisputeQuery } from '~/queries/qa/disputesQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { formatPoints, formatScorePct } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import MockAudioPlayerBar from '~/modules/evaluations-demo/components/MockAudioPlayerBar';
import DemoTranscript from '~/modules/evaluations-demo/components/DemoTranscript';
import classes from './DisputeDetailPage.module.css';

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
					<Grid gap='md'>
						{/* Left Column - Call Info, Player, and Transcript */}
						<Grid.Col span={{ base: 12, lg: 4 }}>
							<Stack gap='md'>
								{/* Call Info */}
								<SectionCard>
									<div className={classes.callInfoRow}>
										<div className={classes.callInfoIcon}>
											<IconMicrophone size={20} />
										</div>
										<div>
											<Text fw={600}>
												{dispute.sourceInteractionRef ?? 'CALL-001'}
											</Text>
											<Text size='xs' c='dimmed'>
												{dateFormatter.format(new Date(dispute.createdAt))}
											</Text>
										</div>
									</div>
								</SectionCard>

								{/* Audio Player */}
								<MockAudioPlayerBar durationSeconds={330} />

								{/* Transcript */}
								<SectionCard
									title={`Transcript · 3 turns`}
									headerActions={
										<Button
											variant='subtle'
											size='xs'
											leftSection={<IconDownload size={14} />}
										>
											Download
										</Button>
									}
								>
									<DemoTranscript
										turns={[
											{
												id: 't1',
												role: 'agent',
												timestamp: '0:00',
												text: 'Good morning! Thank you for calling. How can I help you today?',
											},
											{
												id: 't2',
												role: 'customer',
												timestamp: '0:07',
												text: 'Hi, I have a question about my account.',
											},
											{
												id: 't3',
												role: 'agent',
												timestamp: '0:14',
												text: "Of course, I'd be happy to assist. Can you provide your account number?",
											},
										]}
									/>
								</SectionCard>
							</Stack>
						</Grid.Col>

						{/* Right Column - Evaluation Details */}
						<Grid.Col span={{ base: 12, lg: 8 }}>
							<Stack gap='md'>
								{/* Original Evaluation - Read Only */}
								<SectionCard
									icon={IconGitBranch}
									title={t('detail.source.title')}
									headerActions={
										<Badge color='blue' variant='light'>
											{t('detail.score.percent', {
												percent: formatScorePct(dispute.source.overallScorePct),
											})}
										</Badge>
									}
								>
									<Stack gap='sm'>
										<Group gap='xs'>
											<Badge
												color={
													EVALUATOR_TYPE_COLORS[dispute.source.evaluatorType]
												}
												leftSection={
													dispute.source.evaluatorType === 'AI' ? (
														<IconRobot size={12} />
													) : (
														<IconUserCheck size={12} />
													)
												}
												variant='light'
											>
												{t(
													`detail.evaluation.evaluatorTypes.${dispute.source.evaluatorType.toLowerCase()}`
												)}
											</Badge>
											<Badge color='gray' variant='light'>
												{t('detail.evaluation.version', {
													version: dispute.source.version ?? 1,
												})}
											</Badge>
										</Group>
										<Text fw={700} size='sm'>
											{dispute.source.formName}
										</Text>
										<Text c='dimmed' size='sm'>
											{t('detail.evaluation.agent', {
												name: dispute.source.agent
													? getAgentDisplayName(dispute.source.agent)
													: 'Unknown',
											})}
										</Text>
										<Divider />
										<Text size='sm'>{dispute.reason}</Text>
									</Stack>
								</SectionCard>

								{/* Dispute Information */}
								<SectionCard
									icon={IconGitBranch}
									title={t('detail.correction.title')}
								>
									<Stack gap='sm'>
										<Group gap='xs'>
											<Badge
												color={dispute.scoreDelta >= 0 ? 'green' : 'red'}
												variant='light'
											>
												{t('scoreDelta', {
													delta: formatPoints(dispute.scoreDelta),
												})}
											</Badge>
											<Badge color='blue' variant='light'>
												{dateFormatter.format(new Date(dispute.createdAt))}
											</Badge>
										</Group>
										<Text c='dimmed' size='sm'>
											{t('detail.correction.disputedBy', {
												name: disputedByLabel,
											})}
										</Text>
										<Divider />
										<Group grow>
											<Stack className={classes.scoreCell} gap={4}>
												<Text c='dimmed' size='xs'>
													{t('detail.summary.before')}
												</Text>
												<Text fw={700} size='lg'>
													{t('detail.score.percent', {
														percent: formatScorePct(
															dispute.before.overallScorePct
														),
													})}
												</Text>
												<Text c='dimmed' size='xs'>
													{t('detail.score.points', {
														score: formatPoints(dispute.before.overallScore),
														max: formatPoints(dispute.before.maxScore),
													})}
												</Text>
											</Stack>
											<Stack className={classes.scoreCell} gap={4}>
												<Text c='dimmed' size='xs'>
													{t('detail.summary.after')}
												</Text>
												<Text fw={700} size='lg'>
													{t('detail.score.percent', {
														percent: formatScorePct(
															dispute.after.overallScorePct
														),
													})}
												</Text>
												<Text c='dimmed' size='xs'>
													{t('detail.score.points', {
														score: formatPoints(dispute.after.overallScore),
														max: formatPoints(dispute.after.maxScore),
													})}
												</Text>
											</Stack>
										</Group>
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

								{/* Resulting Evaluation */}
								<SectionCard
									icon={IconGitBranch}
									title={t('detail.resulting.title')}
									headerActions={
										<Badge color='blue' variant='light'>
											{t('detail.score.percent', {
												percent: formatScorePct(
													dispute.resulting.overallScorePct
												),
											})}
										</Badge>
									}
								>
									<Stack gap='sm'>
										<Group gap='xs'>
											<Badge
												color={
													EVALUATOR_TYPE_COLORS[dispute.resulting.evaluatorType]
												}
												leftSection={
													dispute.resulting.evaluatorType === 'AI' ? (
														<IconRobot size={12} />
													) : (
														<IconUserCheck size={12} />
													)
												}
												variant='light'
											>
												{t(
													`detail.evaluation.evaluatorTypes.${dispute.resulting.evaluatorType.toLowerCase()}`
												)}
											</Badge>
											<Badge color='gray' variant='light'>
												{t('detail.evaluation.version', {
													version: dispute.resultingVersion,
												})}
											</Badge>
										</Group>
										<Text fw={700} size='sm'>
											{dispute.resulting.formName}
										</Text>
										<Text c='dimmed' size='sm'>
											{t('detail.evaluation.agent', {
												name: dispute.resulting.agent
													? getAgentDisplayName(dispute.resulting.agent)
													: 'Unknown',
											})}
										</Text>
									</Stack>
								</SectionCard>
							</Stack>
						</Grid.Col>
					</Grid>
				) : null}
			</Stack>
		</ContentContainer>
	);
}
