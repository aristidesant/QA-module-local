import {
	IconLayoutDashboard,
	IconPhone,
	IconBell,
	IconSettings,
	IconFolders,
	IconChartLine,
	IconFileText,
	IconUsers,
	IconTarget,
	IconTargetArrow,
	IconHeartHandshake,
	IconSchool,
	IconSpeakerphone,
	IconAddressBook,
	IconForms,
} from '@tabler/icons-react';
import type { SidebarNavItem } from './Sidebar';
import styles from './Sidebar.module.css';

/**
 * Role-Based Navigation Structures (with grouping support)
 * Defines sidebar navigation for each role: Agent, Supervisor, QA Manager, Operation Manager
 *
 * Roles can have navigation organized by functional groups to reduce cognitive load.
 * Groups are defined as SidebarNavItem arrays with a group metadata wrapper.
 */

export interface NavGroup {
	key: string;
	label: string;
	icon?: React.ReactNode;
	items: SidebarNavItem[];
	collapsible?: boolean;
	defaultExpanded?: boolean;
}

// AGENT NAVIGATION — flat by design (no group headers)
export const getAgentNavigation = (): SidebarNavItem[] => [
	{
		key: 'agent-dashboard',
		label: 'sidebar.agent.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/qa/dashboards/agent',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-calls',
		label: 'sidebar.agent.myCalls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/qa/agent/calls',
		i18nNamespace: 'qa.calls',
		// The dispute detail page (/qa/agent/disputes/:id) lives outside /qa/agent/calls
		// but its list is the Disputes tab of My Calls — keep this item highlighted there too.
		activePaths: ['/qa/agent/disputes'],
	},
	{
		key: 'agent-inbox',
		label: 'sidebar.agent.inbox',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/agent/inbox',
		i18nNamespace: 'qa.inbox',
		badge: 'inbox',
	},
	{
		key: 'agent-rankings',
		label: 'sidebar.agent.rankings',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.rankings',
	},
	{
		key: 'agent-lms',
		label: 'sidebar.agent.lms',
		icon: <IconSchool size={20} className={styles.menuIcon} />,
		to: '/qa/agent/lms',
		i18nNamespace: 'qa.lms',
	},
	{
		key: 'agent-coaching',
		label: 'sidebar.agent.coaching',
		icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
		to: '/qa/agent/coaching',
		i18nNamespace: 'qa.lms',
	},
];

// SUPERVISOR NAVIGATION (flat version - source of truth for routes)
export const getSupervisorNavigation = (): SidebarNavItem[] => [
	{
		key: 'supervisor-dashboard',
		label: 'sidebar.supervisor.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/qa/dashboards/supervisor',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-inbox',
		label: 'sidebar.supervisor.inbox',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/inbox',
		i18nNamespace: 'qa.inbox',
		badge: 'inbox',
	},
	{
		key: 'supervisor-team',
		label: 'sidebar.supervisor.team',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/your-team',
		i18nNamespace: 'qa.team',
	},
	{
		key: 'supervisor-customers',
		label: 'sidebar.supervisor.customers',
		icon: <IconAddressBook size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/customers',
		i18nNamespace: 'qa.customers',
	},
	{
		key: 'supervisor-campaigns',
		label: 'sidebar.supervisor.campaigns',
		icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
		to: '/qa/campaigns',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-coaching',
		label: 'sidebar.supervisor.coaching',
		icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/coaching',
		i18nNamespace: 'qa.coaching',
	},
	{
		key: 'supervisor-lms',
		label: 'sidebar.supervisor.lms',
		icon: <IconSchool size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/lms',
		i18nNamespace: 'qa.lms',
	},
	{
		key: 'supervisor-disputes',
		label: 'sidebar.supervisor.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/disputes',
		i18nNamespace: 'qa.disputes',
		badge: 'disputes',
	},
	{
		key: 'supervisor-analytics',
		label: 'sidebar.supervisor.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/analytics',
		i18nNamespace: 'qa.teamAnalytics',
	},
	{
		key: 'supervisor-reports',
		label: 'sidebar.supervisor.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/reports',
		i18nNamespace: 'qa.reports',
	},
	{
		key: 'supervisor-triggers',
		label: 'sidebar.supervisor.triggersConfig',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/triggers',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-rankings',
		label: 'sidebar.supervisor.rankingsConfig',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/rankings',
		i18nNamespace: 'qa.rankings',
	},
];

// SUPERVISOR NAVIGATION (organized by functional groups)
// Dashboard / Your Team / Development render as flat links, no section
// header — only Operations and Insights keep their collapsible groups.
export const getSupervisorNavigationGrouped = (): (
	| SidebarNavItem
	| NavGroup
)[] => {
	const items = getSupervisorNavigation();
	const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
	const pick = (...keys: string[]) => keys.map((k) => byKey[k]);

	return [
		...pick(
			'supervisor-dashboard',
			'supervisor-inbox',
			'supervisor-team',
			'supervisor-customers',
			'supervisor-campaigns',
			'supervisor-coaching',
			'supervisor-lms'
		),
		// Secondary: Operations (collapsible, collapsed by default)
		{
			key: 'supervisor-operations',
			label: 'sidebar.supervisor.groupOperations',
			items: pick('supervisor-disputes', 'supervisor-triggers'),
			collapsible: true,
			defaultExpanded: false,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'supervisor-insights',
			label: 'sidebar.supervisor.groupInsights',
			items: pick(
				'supervisor-analytics',
				'supervisor-reports',
				'supervisor-rankings'
			),
			collapsible: true,
			defaultExpanded: false,
		},
	];
};

// QA MANAGER NAVIGATION (flat version - source of truth for routes)
export const getQAManagerNavigation = (): SidebarNavItem[] => [
	{
		key: 'qamanager-dashboard',
		label: 'sidebar.qamanager.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/qa/dashboards/qa-manager',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-inbox',
		label: 'sidebar.qamanager.inbox',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/inbox',
		i18nNamespace: 'qa.inbox',
		badge: 'inbox',
	},
	{
		key: 'qamanager-teams',
		label: 'sidebar.qamanager.teams',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/teams',
		i18nNamespace: 'qa.team',
	},
	{
		key: 'qamanager-forms',
		label: 'sidebar.qamanager.forms',
		icon: <IconForms size={20} className={styles.menuIcon} />,
		to: '/qa/forms',
		i18nNamespace: 'qa.forms',
	},
	{
		key: 'qamanager-customers',
		label: 'sidebar.qamanager.customers',
		icon: <IconAddressBook size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/customers',
		i18nNamespace: 'qa.customers',
	},
	{
		key: 'qamanager-coaching',
		label: 'sidebar.qamanager.coaching',
		icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/coaching',
		i18nNamespace: 'qa.coaching',
	},
	{
		key: 'qamanager-lms',
		label: 'sidebar.qamanager.lms',
		icon: <IconSchool size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/lms',
		i18nNamespace: 'qa.lms',
	},
	{
		key: 'qamanager-disputes',
		label: 'sidebar.qamanager.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/disputes',
		i18nNamespace: 'qa.disputes',
		badge: 'disputes',
	},
	{
		key: 'qamanager-triggers',
		label: 'sidebar.qamanager.triggersConfig',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/triggers',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-rankings',
		label: 'sidebar.qamanager.rankings',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/rankings',
		i18nNamespace: 'qa.rankings',
	},
	{
		key: 'qamanager-settings',
		label: 'sidebar.qamanager.settings',
		icon: <IconSettings size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/settings',
		i18nNamespace: 'qa.settings',
	},
	{
		key: 'qamanager-campaigns',
		label: 'sidebar.qamanager.campaigns',
		icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
		to: '/qa/campaigns',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-analytics',
		label: 'sidebar.qamanager.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/analytics',
		i18nNamespace: 'qa.teamAnalytics',
	},
	{
		key: 'qamanager-reports',
		label: 'sidebar.qamanager.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/reports',
		i18nNamespace: 'qa.reports',
	},
];

// QA MANAGER NAVIGATION (organized by functional groups)
// Dashboard / Organization ("Your team" equivalent — supervisors, teams,
// agents) / Development render as flat links, no section header — Operations,
// Configuration and Insights keep their groups.
export const getQAManagerNavigationGrouped = (): (
	| SidebarNavItem
	| NavGroup
)[] => {
	const items = getQAManagerNavigation();
	const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
	const pick = (...keys: string[]) => keys.map((k) => byKey[k]);

	return [
		...pick(
			'qamanager-dashboard',
			'qamanager-inbox',
			'qamanager-teams',
			'qamanager-forms',
			'qamanager-coaching',
			'qamanager-lms'
		),
		// Primary: Operations (always visible, non-collapsible)
		{
			key: 'qamanager-operations',
			label: 'sidebar.qamanager.groupOperations',
			items: pick(
				'qamanager-customers',
				'qamanager-disputes',
				'qamanager-campaigns'
			),
			collapsible: false,
			defaultExpanded: true,
		},
		// Secondary: Configuration (collapsible, collapsed by default)
		{
			key: 'qamanager-configuration',
			label: 'sidebar.qamanager.groupConfiguration',
			items: pick(
				'qamanager-triggers',
				'qamanager-rankings',
				'qamanager-settings'
			),
			collapsible: true,
			defaultExpanded: false,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'qamanager-insights',
			label: 'sidebar.qamanager.groupInsights',
			items: pick('qamanager-analytics', 'qamanager-reports'),
			collapsible: true,
			defaultExpanded: false,
		},
	];
};

// OPERATION MANAGER NAVIGATION (flat structure - can be grouped later)
export const getOperationManagerNavigation = (): SidebarNavItem[] => [
	{
		key: 'operationmanager-dashboard',
		label: 'sidebar.operationmanager.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/dashboard',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-supervisors',
		label: 'sidebar.operationmanager.supervisors',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/supervisors',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-team-health',
		label: 'sidebar.operationmanager.teamHealth',
		icon: <IconHeartHandshake size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/team-health',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-clients',
		label: 'sidebar.operationmanager.clients',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/clients',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-rankings',
		label: 'sidebar.operationmanager.supervisorRankings',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-analytics',
		label: 'sidebar.operationmanager.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/analytics',
		i18nNamespace: 'qa.operationmanager',
	},
	{
		key: 'operationmanager-reports',
		label: 'sidebar.operationmanager.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/operationmanager/reports',
		i18nNamespace: 'qa.operationmanager',
	},
];

// OPERATION MANAGER NAVIGATION (organized by functional groups)
export const getOperationManagerNavigationGrouped = (): NavGroup[] => {
	const items = getOperationManagerNavigation();

	return [
		// Primary: Dashboard (always visible, non-collapsible)
		{
			key: 'operationmanager-primary',
			label: items[0].label, // 'sidebar.operationmanager.dashboard'
			items: [items[0]],
			collapsible: false,
			defaultExpanded: true,
		},
		// Primary: Organization (always visible, non-collapsible)
		{
			key: 'operationmanager-organization',
			label: 'sidebar.operationmanager.groupOrganization',
			items: items.slice(1, 4), // Supervisors, Team Health, Clients
			collapsible: false,
			defaultExpanded: true,
		},
		// Secondary: Configuration (collapsible, collapsed by default)
		{
			key: 'operationmanager-configuration',
			label: 'sidebar.operationmanager.groupConfiguration',
			items: [items[4]], // Rankings
			collapsible: true,
			defaultExpanded: false,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'operationmanager-insights',
			label: 'sidebar.operationmanager.groupInsights',
			items: [items[5], items[6]], // Analytics, Reports
			collapsible: true,
			defaultExpanded: false,
		},
	];
};

// SUPER ADMIN NAVIGATION
export const getSuperAdminNavigation = (): SidebarNavItem[] => [
	{
		key: 'superadmin-rankings',
		label: 'sidebar.superadmin.rankings',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.rankings',
	},
];

export type PreviewRole =
	| 'agent'
	| 'supervisor'
	| 'qaManager'
	| 'operationManager'
	| 'superAdmin';

export const roleNavigationMap: Record<PreviewRole, () => SidebarNavItem[]> = {
	agent: getAgentNavigation,
	supervisor: getSupervisorNavigation,
	qaManager: getQAManagerNavigation,
	operationManager: getOperationManagerNavigation,
	superAdmin: getSuperAdminNavigation,
};

// Grouped versions (for integration with sidebar). The agent is flat — see getAgentNavigation above.
export const roleNavigationGroupedMap: Record<
	Extract<PreviewRole, 'supervisor' | 'qaManager' | 'operationManager'>,
	() => (SidebarNavItem | NavGroup)[]
> = {
	supervisor: getSupervisorNavigationGrouped,
	qaManager: getQAManagerNavigationGrouped,
	operationManager: getOperationManagerNavigationGrouped,
};
