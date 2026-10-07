import { useMemo, useState } from 'react';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { Anchor, Breadcrumbs, Button, Stack, Tabs, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTeamStore, selectProfile } from '~/stores/qa/teamStore';
import type { ProfilePeriod } from '../types';
import {
	PROFILE_TABS,
	SUPERVISOR_PERSONA,
	type ProfileTab,
} from '../constants';
import { filterByPeriod, roleFromPath, teamBasePath } from '../helpers';
import { ProfileHeader } from './ProfileHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { QATab } from './tabs/QATab';
import { SentimentTab } from './tabs/SentimentTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { BusinessTab } from './tabs/BusinessTab';
import { OperationsTab } from './tabs/OperationsTab';
import { BurnoutTab } from './tabs/BurnoutTab';
import { CoachingLmsTab } from './tabs/CoachingLmsTab';
import { AchievementsTab } from './tabs/AchievementsTab';
import { NotesTab } from './tabs/NotesTab';
import { coachingSessionNewPath } from '~/modules/qa/coaching/constants';
import { AssignContentDrawer } from '~/modules/qa/lms/components/AssignContentDrawer';
import { SendMessageModal } from '../components/modals/SendMessageModal';

export default function AgentProfilePage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const location = useLocation();
	const { agentId } = useParams<{ agentId: string }>();
	const role = roleFromPath(location.pathname);
	const profile = useTeamStore(selectProfile(agentId));
	const [searchParams, setSearchParams] = useSearchParams();
	const [period, setPeriod] = useState<ProfilePeriod>('12m');
	const [lmsOpen, setLmsOpen] = useState(false);
	const [messageOpen, setMessageOpen] = useState(false);

	const tab = (searchParams.get('tab') as ProfileTab | null) ?? 'overview';
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

	const notVisible =
		profile &&
		role === 'supervisor' &&
		profile.agent.supervisorId !== SUPERVISOR_PERSONA.id;

	const points = useMemo(
		() => (profile ? filterByPeriod(profile.performance, period) : []),
		[profile, period]
	);

	const scheduleCoaching = () =>
		navigate(coachingSessionNewPath(role, { agent: profile?.agent.id }));

	if (!profile || notVisible) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: agentId })}
					action={
						<Button onClick={() => navigate(teamBasePath(role))}>
							{t('header.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(teamBasePath(role))}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(teamBasePath(role))}>
						{t(role === 'qa-manager' ? 'teams.list.title' : 'team.title')}
					</Anchor>
					{role === 'qa-manager' && (
						<Anchor
							onClick={() =>
								navigate(`/qa/qa-manager/teams/${profile.agent.supervisorId}`)
							}
						>
							{profile.agent.team}
						</Anchor>
					)}
					<Text c='dimmed'>{profile.agent.name}</Text>
				</Breadcrumbs>

				<ProfileHeader
					profile={profile}
					role={role}
					period={period}
					onPeriodChange={setPeriod}
					onScheduleCoaching={scheduleCoaching}
					onAssignLms={() => setLmsOpen(true)}
					onSendMessage={() => setMessageOpen(true)}
				/>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						{PROFILE_TABS.map(({ value, labelKey, icon: Icon }) => (
							<Tabs.Tab
								key={value}
								value={value}
								leftSection={<Icon size={16} />}
							>
								{t(labelKey)}
							</Tabs.Tab>
						))}
					</Tabs.List>

					<Tabs.Panel value='overview' pt='md'>
						<OverviewTab profile={profile} points={points} period={period} />
					</Tabs.Panel>
					<Tabs.Panel value='qa' pt='md'>
						<QATab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='sentiment' pt='md'>
						<SentimentTab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='compliance' pt='md'>
						<ComplianceTab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='business' pt='md'>
						<BusinessTab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='operations' pt='md'>
						<OperationsTab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='burnout' pt='md'>
						<BurnoutTab
							profile={profile}
							role={role}
							onScheduleCoaching={scheduleCoaching}
						/>
					</Tabs.Panel>
					<Tabs.Panel value='coaching' pt='md'>
						<CoachingLmsTab
							profile={profile}
							onScheduleCoaching={scheduleCoaching}
							onAssignLms={() => setLmsOpen(true)}
						/>
					</Tabs.Panel>
					<Tabs.Panel value='achievements' pt='md'>
						<AchievementsTab profile={profile} />
					</Tabs.Panel>
					<Tabs.Panel value='notes' pt='md'>
						<NotesTab profile={profile} role={role} />
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<AssignContentDrawer
				opened={lmsOpen}
				onClose={() => setLmsOpen(false)}
				role={role}
				preset={{ agentIds: [profile.agent.id] }}
			/>
			<SendMessageModal
				agentId={profile.agent.id}
				role={role}
				opened={messageOpen}
				onClose={() => setMessageOpen(false)}
			/>
		</ContentContainer>
	);
}
