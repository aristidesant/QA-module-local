import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Alert,
	Anchor,
	Breadcrumbs,
	Button,
	Grid,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import type { LmsContent } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectEnrollments,
	selectPaths,
} from '~/stores/qa/lmsStore';
import {
	AGENT_LMS_PATH,
	AGENT_PERSONA,
	agentContentPath,
	managerContentPath,
	managerLmsPath,
} from '../constants';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { ContentSidebar } from './ContentSidebar';
import { DocumentReader } from './players/DocumentReader';
import { QuizPlayer } from './players/QuizPlayer';
import { ScenarioPlayer } from './players/ScenarioPlayer';
import { VideoPlayerMock } from './players/VideoPlayerMock';

export default function LmsContentPage() {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	const navigate = useNavigate();
	const location = useLocation();
	const { contentId } = useParams<{ contentId: string }>();

	// A Supervisor or QA Manager previewing a material stays inside their own Learning section.
	const isManager =
		location.pathname.startsWith('/qa/supervisor') ||
		location.pathname.startsWith('/qa/qa-manager');
	const managerRole = roleFromPath(location.pathname);
	const listPath = isManager ? managerLmsPath(managerRole) : AGENT_LMS_PATH;
	const contentPath = (id: string) =>
		isManager ? managerContentPath(managerRole, id) : agentContentPath(id);

	const content = useLmsStore(selectContent);
	const assignments = useLmsStore(selectAssignments);
	const paths = useLmsStore(selectPaths);
	const enrollments = useLmsStore(selectEnrollments);

	const [justCompleted, setJustCompleted] = useState(false);

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);
	const item = contentId ? contentById[contentId] : undefined;

	const assignment = useMemo(
		() =>
			assignments.find(
				(a) =>
					a.agentId === AGENT_PERSONA.id &&
					a.contentId === contentId &&
					a.status !== 'COMPLETED'
			) ??
			assignments.find(
				(a) => a.agentId === AGENT_PERSONA.id && a.contentId === contentId
			),
		[assignments, contentId]
	);

	const path = useMemo(() => {
		if (!contentId) return undefined;
		if (assignment?.pathId)
			return paths.find((p) => p.id === assignment.pathId);
		const enrolled = enrollments
			.filter((e) => e.agentId === AGENT_PERSONA.id)
			.map((e) => e.pathId);
		return paths.find(
			(p) =>
				enrolled.includes(p.id) &&
				p.modules.some((m) => m.contentId === contentId)
		);
	}, [assignment, contentId, enrollments, paths]);

	const enrollment = useMemo(
		() =>
			enrollments.find(
				(e) => e.agentId === AGENT_PERSONA.id && e.pathId === path?.id
			),
		[enrollments, path]
	);

	if (!item) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: contentId })}
					action={
						<Button onClick={() => navigate(listPath)}>
							{t('player.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const readOnly = !assignment || assignment.status === 'COMPLETED';

	const handleProgress = (percent: number) => {
		if (assignment)
			useLmsStore.getState().updateProgress(assignment.id, percent);
	};

	const handleComplete = (score: number | null = null) => {
		if (!assignment) return;
		useLmsStore.getState().complete(assignment.id, score);
		setJustCompleted(true);
		notifySuccess(t('player.completed.title'));
	};

	const metricName = item.impactMetricId
		? t(`metrics.${item.impactMetricId}`, { ns: 'qa.triggers' })
		: null;

	const openModule = (id: string) => {
		setJustCompleted(false);
		navigate(contentPath(id));
	};

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(listPath)}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(listPath)}>
						{t(isManager ? 'manager.title' : 'agent.title')}
					</Anchor>
					<Text c='dimmed'>{item.title}</Text>
				</Breadcrumbs>

				<Grid gap='lg'>
					<Grid.Col span={{ base: 12, lg: 8 }}>
						<Stack gap='md'>
							<Stack gap={4}>
								<Title order={2}>{item.title}</Title>
								<Text c='dimmed' size='sm'>
									{item.summary}
								</Text>
							</Stack>

							{justCompleted && (
								<Alert
									color='green'
									variant='light'
									icon={<IconCircleCheck size={18} />}
									title={t('player.completed.title')}
								>
									<Stack gap='sm'>
										<Text size='sm'>
											{metricName
												? t('player.completed.message', { metric: metricName })
												: t('player.completed.noImpact')}
										</Text>
										<Group gap='xs'>
											<Button
												size='xs'
												variant='light'
												onClick={() =>
													navigate(
														isManager
															? listPath
															: `${AGENT_LMS_PATH}?tab=assignments`
													)
												}
											>
												{t('player.completed.backToList')}
											</Button>
										</Group>
									</Stack>
								</Alert>
							)}

							{!assignment && (
								<Alert color='blue' variant='light'>
									<Text size='sm'>{t('player.notAssigned')}</Text>
								</Alert>
							)}

							<SectionCard padding='md'>
								{item.format === 'VIDEO' && (
									<VideoPlayerMock
										content={item}
										initialProgress={assignment?.progress ?? 0}
										readOnly={readOnly}
										onProgress={handleProgress}
										onComplete={() => handleComplete(null)}
									/>
								)}
								{item.format === 'DOCUMENT' && (
									<DocumentReader
										content={item}
										initialProgress={assignment?.progress ?? 0}
										readOnly={readOnly}
										onProgress={handleProgress}
										onComplete={() => handleComplete(null)}
									/>
								)}
								{item.format === 'QUIZ' && item.questions && (
									<QuizPlayer
										questions={item.questions}
										passScore={item.passScore ?? 80}
										readOnly={readOnly}
										onComplete={(score) => handleComplete(score)}
									/>
								)}
								{item.format === 'SCENARIO' && (
									<ScenarioPlayer
										content={item}
										readOnly={readOnly}
										onComplete={(score) => handleComplete(score)}
									/>
								)}
							</SectionCard>
						</Stack>
					</Grid.Col>

					<Grid.Col span={{ base: 12, lg: 4 }}>
						<ContentSidebar
							content={item}
							assignment={assignment}
							path={path}
							enrollment={enrollment}
							contentById={contentById}
							onOpenModule={openModule}
						/>
					</Grid.Col>
				</Grid>
			</Stack>
		</ContentContainer>
	);
}
