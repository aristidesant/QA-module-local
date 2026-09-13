import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Badge, Stack, Tabs } from '@mantine/core';
import { IconHistory, IconLibrary, IconListCheck, IconRoute, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectEnrollments,
	selectPaths,
} from '~/stores/qa/lmsStore';
import { AGENT_PERSONA, agentContentPath, type AgentLmsTab } from '../constants';
import { RescheduleModal } from '../components/RescheduleModal';
import { LearningHeader } from './LearningHeader';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { PathsTab } from './tabs/PathsTab';
import { CatalogTab } from './tabs/CatalogTab';
import { HistoryTab } from './tabs/HistoryTab';
import { AgentCoachingTab } from './tabs/AgentCoachingTab';

const TAB_ICONS = {
	assignments: IconListCheck,
	paths: IconRoute,
	catalog: IconLibrary,
	history: IconHistory,
	coaching: IconSchool,
} as const;

export default function AgentLmsPage() {
	const { t } = useTranslation('qa.lms');
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const enrollments = useLmsStore(selectEnrollments);

	const [rescheduleTarget, setRescheduleTarget] = useState<LmsAssignment | null>(null);

	const mine = useMemo(
		() => assignments.filter((a) => a.agentId === AGENT_PERSONA.id),
		[assignments]
	);
	const myEnrollments = useMemo(
		() => enrollments.filter((e) => e.agentId === AGENT_PERSONA.id),
		[enrollments]
	);
	const contentById = useMemo(
		() => Object.fromEntries(content.map((c) => [c.id, c])) as Record<string, LmsContent>,
		[content]
	);

	const tab = (searchParams.get('tab') as AgentLmsTab | null) ?? 'assignments';
	const setTab = (value: string | null) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	const openContent = (contentId: string) => navigate(agentContentPath(contentId));

	const counts = {
		assignments: mine.filter((a) => a.status !== 'COMPLETED').length,
		paths: myEnrollments.length,
		catalog: content.filter((c) => c.status === 'PUBLISHED').length,
		history: mine.filter((a) => a.status === 'COMPLETED').length,
	};

	const handleAccept = (assignmentId: string) => {
		useLmsStore.getState().accept(assignmentId);
		notifySuccess(t('agent.assignments.acceptSuccess'));
	};

	const handleReschedule = (proposedDueDate: string, reason: string) => {
		if (!rescheduleTarget) return;
		useLmsStore.getState().requestReschedule(rescheduleTarget.id, proposedDueDate, reason);
		notifySuccess(t('agent.reschedule.success'));
	};

	const handleSelfEnrol = (contentId: string) => {
		useLmsStore.getState().selfEnroll(AGENT_PERSONA.id, contentId);
		notifySuccess(t('agent.catalog.enrolledSuccess'));
	};

	const handleEnrolPath = (pathId: string) => {
		useLmsStore.getState().selfEnrollPath(AGENT_PERSONA.id, pathId);
		const path = paths.find((p) => p.id === pathId);
		notifySuccess(t('agent.paths.enrolledSuccess', { title: path?.title ?? '' }));
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<LearningHeader
					assignments={mine}
					paths={paths}
					enrollments={myEnrollments}
					contentById={contentById}
				/>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						<Tabs.Tab
							value='assignments'
							leftSection={<TAB_ICONS.assignments size={16} />}
							rightSection={
								<Badge size='xs' variant='light' color={counts.assignments > 0 ? 'blue' : 'gray'}>
									{counts.assignments}
								</Badge>
							}
						>
							{t('agent.tabs.assignments')}
						</Tabs.Tab>
						<Tabs.Tab
							value='paths'
							leftSection={<TAB_ICONS.paths size={16} />}
							rightSection={
								<Badge size='xs' variant='light'>
									{counts.paths}
								</Badge>
							}
						>
							{t('agent.tabs.paths')}
						</Tabs.Tab>
						<Tabs.Tab
							value='catalog'
							leftSection={<TAB_ICONS.catalog size={16} />}
							rightSection={
								<Badge size='xs' variant='light'>
									{counts.catalog}
								</Badge>
							}
						>
							{t('agent.tabs.catalog')}
						</Tabs.Tab>
						<Tabs.Tab
							value='history'
							leftSection={<TAB_ICONS.history size={16} />}
							rightSection={
								<Badge size='xs' variant='light'>
									{counts.history}
								</Badge>
							}
						>
							{t('agent.tabs.history')}
						</Tabs.Tab>
						<Tabs.Tab value='coaching' leftSection={<TAB_ICONS.coaching size={16} />}>
							{t('agent.tabs.coaching')}
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='assignments' pt='md'>
						<AssignmentsTab
							assignments={mine}
							contentById={contentById}
							onOpen={openContent}
							onAccept={handleAccept}
							onPropose={setRescheduleTarget}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='paths' pt='md'>
						<PathsTab
							paths={paths}
							enrollments={myEnrollments}
							contentById={contentById}
							onOpenModule={openContent}
							onEnrol={handleEnrolPath}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='catalog' pt='md'>
						<CatalogTab
							content={content}
							assignments={mine}
							onOpen={openContent}
							onEnrol={handleSelfEnrol}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='history' pt='md'>
						<HistoryTab assignments={mine} contentById={contentById} onReview={openContent} />
					</Tabs.Panel>

					<Tabs.Panel value='coaching' pt='md'>
						<AgentCoachingTab />
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<RescheduleModal
				assignment={rescheduleTarget}
				opened={rescheduleTarget !== null}
				onClose={() => setRescheduleTarget(null)}
				onSubmit={handleReschedule}
			/>
		</ContentContainer>
	);
}
