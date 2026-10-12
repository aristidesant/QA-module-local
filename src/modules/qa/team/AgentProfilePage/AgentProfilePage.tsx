import { useMemo, useState } from 'react';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import {
	Anchor,
	Avatar,
	Box,
	Breadcrumbs,
	Button,
	Stack,
	Text,
} from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTeamStore, selectProfile } from '~/stores/qa/teamStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import {
	CompactProfileBar,
	ProfileNav,
	useCompactBar,
} from '~/modules/qa/components/ProfileShell';
import {
	PROFILE_TABS,
	PROFILE_TAB_GROUPS,
	SUPERVISOR_PERSONA,
	type ProfileTab,
} from '../constants';
import { roleFromPath, teamBasePath } from '../helpers';
import { ProfileHeader } from './ProfileHeader';
import { ProfileActions } from './ProfileActions';
import { profileAttention } from './attention';
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

const isProfileTab = (value: string | null): value is ProfileTab =>
	PROFILE_TAB_GROUPS.some((g) => g.tabs.includes(value as ProfileTab));

export default function AgentProfilePage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const location = useLocation();
	const { agentId } = useParams<{ agentId: string }>();
	const role = roleFromPath(location.pathname);
	const profile = useTeamStore(selectProfile(agentId));
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const [searchParams, setSearchParams] = useSearchParams();
	const [lmsOpen, setLmsOpen] = useState(false);
	const [messageOpen, setMessageOpen] = useState(false);

	// The compact bar shows once the full header has scrolled out of the content area.
	const { headerRef, compact } = useCompactBar(profile?.agent.id);

	const rawTab = searchParams.get('tab');
	const tab: ProfileTab = isProfileTab(rawTab) ? rawTab : 'overview';
	const setTab = (value: ProfileTab) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	const notVisible =
		profile &&
		role === 'supervisor' &&
		profile.agent.supervisorId !== SUPERVISOR_PERSONA.id;

	// The level follows the burnout rules in Triggers.
	const burnoutLevel = useMemo(
		() =>
			profile ? assessBurnout(profile.agent.id, triggerRules).level : 'low',
		[profile, triggerRules]
	);
	const attention = useMemo(
		() => (profile ? profileAttention(profile, burnoutLevel) : {}),
		[profile, burnoutLevel]
	);

	const navGroups = useMemo(
		() =>
			PROFILE_TAB_GROUPS.map((g) => ({
				value: g.value,
				label: t(g.labelKey),
				icon: g.icon,
				tabs: g.tabs.map((value) => ({
					value,
					label: t(`tabs.${value}`),
					icon: PROFILE_TABS.find((x) => x.value === value)?.icon,
				})),
			})),
		[t]
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

	const renderTab = () => {
		switch (tab) {
			case 'qa':
				return <QATab profile={profile} />;
			case 'sentiment':
				return <SentimentTab profile={profile} />;
			case 'compliance':
				return <ComplianceTab profile={profile} />;
			case 'business':
				return <BusinessTab profile={profile} />;
			case 'operations':
				return <OperationsTab profile={profile} />;
			case 'burnout':
				return (
					<BurnoutTab
						profile={profile}
						role={role}
						onScheduleCoaching={scheduleCoaching}
					/>
				);
			case 'coaching':
				return (
					<CoachingLmsTab
						profile={profile}
						onScheduleCoaching={scheduleCoaching}
						onAssignLms={() => setLmsOpen(true)}
					/>
				);
			case 'achievements':
				return <AchievementsTab profile={profile} />;
			case 'notes':
				return <NotesTab profile={profile} role={role} />;
			default:
				return <OverviewTab profile={profile} />;
		}
	};

	const actions = {
		onScheduleCoaching: scheduleCoaching,
		onAssignLms: () => setLmsOpen(true),
		onSendMessage: () => setMessageOpen(true),
	};

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(teamBasePath(role))}
		>
			<CompactProfileBar
				visible={compact}
				actions={<ProfileActions size='xs' {...actions} />}
			>
				<Avatar size={32} radius='md' color='gray' name={profile.agent.name} />
				<Text fw={600} truncate>
					{profile.agent.name}
				</Text>
				<Text fw={700}>{profile.overall.score}</Text>
				<Text size='sm' c='dimmed' visibleFrom='sm'>
					{t('header.rank', {
						rank: profile.overall.rankInTeam,
						size: profile.overall.teamSize,
					})}
				</Text>
			</CompactProfileBar>
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

				<div ref={headerRef}>
					<ProfileHeader
						profile={profile}
						burnoutLevel={burnoutLevel}
						{...actions}
					/>
				</div>

				<ProfileNav
					groups={navGroups}
					tab={tab}
					onChange={setTab}
					attention={attention}
					attentionLabel={t('tabs.attention')}
				/>

				<Box role='tabpanel' pt='md'>
					{renderTab()}
				</Box>
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
