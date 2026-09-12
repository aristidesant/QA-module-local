import {
	IconLayoutDashboard,
	IconPhone,
	IconBell,
	IconFolders,
	IconChartLine,
	IconFileText,
	IconUsers,
	IconTarget,
	IconHeartHandshake,
	IconLock,
	IconGitBranch,
	IconSpeakerphone,
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

// AGENT NAVIGATION (flat structure - not yet grouped)
export const getAgentNavigation = (): SidebarNavItem[] => [
	{
		key: 'agent-dashboard',
		label: 'sidebar.agent.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/qa/dashboards/agent',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-campaigns',
		label: 'sidebar.agent.campaigns',
		icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
		to: '/qa/campaigns',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-inbox',
		label: 'sidebar.agent.inbox',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/qa/agent/inbox',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-rankings',
		label: 'sidebar.agent.rankings',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-lms',
		label: 'sidebar.agent.lms',
		icon: <IconLock size={20} className={styles.menuIcon} />,
		to: '/qa/agent/lms',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-analytics',
		label: 'sidebar.agent.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/qa/agent/analytics',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-disputes',
		label: 'sidebar.agent.disputes',
		icon: <IconGitBranch size={20} className={styles.menuIcon} />,
		to: '/qa/agent/disputes',
		i18nNamespace: 'qa.agent',
	},
];

// AGENT NAVIGATION (organized by functional groups)
export const getAgentNavigationGrouped = (): NavGroup[] => {
	const items = getAgentNavigation();

	return [
		// Primary: Dashboard (always visible, non-collapsible)
		{
			key: 'agent-primary',
			label: items[0].label, // 'sidebar.agent.dashboard'
			items: [items[0]],
			collapsible: false,
			defaultExpanded: true,
		},
		// Primary: My Work (always visible, non-collapsible)
		{
			key: 'agent-mywork',
			label: 'sidebar.agent.groupMyWork',
			items: items.slice(1, 3), // My Evaluations, Inbox
			collapsible: false,
			defaultExpanded: true,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'agent-insights',
			label: 'sidebar.agent.groupInsights',
			items: items.slice(3), // Rankings, LMS, Analytics, Disputes
			collapsible: true,
			defaultExpanded: false,
		},
	];
};

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
		key: 'supervisor-team',
		label: 'sidebar.supervisor.team',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/your-team',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-calls',
		label: 'sidebar.supervisor.calls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/calls',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-campaigns',
		label: 'sidebar.supervisor.campaigns',
		icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
		to: '/qa/campaigns',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-disputes',
		label: 'sidebar.supervisor.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/disputes',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-analytics',
		label: 'sidebar.supervisor.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/analytics',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-reports',
		label: 'sidebar.supervisor.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/qa/supervisor/reports',
		i18nNamespace: 'qa.supervisor',
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
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.supervisor',
	},
];

// SUPERVISOR NAVIGATION (organized by functional groups)
export const getSupervisorNavigationGrouped = (): NavGroup[] => {
	const items = getSupervisorNavigation();

	return [
		// Primary: Dashboard (always visible, non-collapsible)
		{
			key: 'supervisor-primary',
			label: items[0].label, // 'sidebar.supervisor.dashboard'
			items: [items[0]],
			collapsible: false,
			defaultExpanded: true,
		},
		// Primary: Your Team (always visible, non-collapsible)
		{
			key: 'supervisor-team',
			label: 'sidebar.supervisor.groupTeam',
			items: items.slice(1, 4), // Team, Calls, Evaluations
			collapsible: false,
			defaultExpanded: true,
		},
		// Secondary: Operations (collapsible, collapsed by default)
		{
			key: 'supervisor-operations',
			label: 'sidebar.supervisor.groupOperations',
			items: [items[4], items[7]], // Disputes, Triggers
			collapsible: true,
			defaultExpanded: false,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'supervisor-insights',
			label: 'sidebar.supervisor.groupInsights',
			items: [items[5], items[6], items[8]], // Analytics, Reports, Rankings
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
		key: 'qamanager-supervisors',
		label: 'sidebar.qamanager.supervisors',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/supervisors',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-teams',
		label: 'sidebar.qamanager.teams',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/teams',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-calls',
		label: 'sidebar.qamanager.calls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/calls',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-disputes',
		label: 'sidebar.qamanager.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/disputes',
		i18nNamespace: 'qa.qamanager',
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
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-campaigns',
		label: 'sidebar.qamanager.campaigns',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/campaigns',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-analytics',
		label: 'sidebar.qamanager.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/analytics',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-reports',
		label: 'sidebar.qamanager.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/reports',
		i18nNamespace: 'qa.qamanager',
	},
];

// QA MANAGER NAVIGATION (organized by functional groups)
export const getQAManagerNavigationGrouped = (): NavGroup[] => {
	const items = getQAManagerNavigation();

	return [
		// Primary: Dashboard (always visible, non-collapsible)
		{
			key: 'qamanager-primary',
			label: items[0].label, // 'sidebar.qamanager.dashboard'
			items: [items[0]],
			collapsible: false,
			defaultExpanded: true,
		},
		// Primary: Organization (always visible, non-collapsible)
		{
			key: 'qamanager-organization',
			label: 'sidebar.qamanager.groupOrganization',
			items: items.slice(1, 3), // Supervisors, Teams
			collapsible: false,
			defaultExpanded: true,
		},
		// Primary: Operations (always visible, non-collapsible)
		{
			key: 'qamanager-operations',
			label: 'sidebar.qamanager.groupOperations',
			items: [items[3], items[4], items[7]], // Calls, Disputes, Campaigns
			collapsible: false,
			defaultExpanded: true,
		},
		// Secondary: Configuration (collapsible, collapsed by default)
		{
			key: 'qamanager-configuration',
			label: 'sidebar.qamanager.groupConfiguration',
			items: [items[5], items[6]], // Triggers, Rankings
			collapsible: true,
			defaultExpanded: false,
		},
		// Secondary: Insights (collapsible, collapsed by default)
		{
			key: 'qamanager-insights',
			label: 'sidebar.qamanager.groupInsights',
			items: [items[8], items[9]], // Analytics, Reports
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
		i18nNamespace: 'qa.agent',
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

// Grouped versions (for integration with sidebar)
export const roleNavigationGroupedMap: Record<
	Extract<
		PreviewRole,
		'agent' | 'supervisor' | 'qaManager' | 'operationManager'
	>,
	() => NavGroup[]
> = {
	agent: getAgentNavigationGrouped,
	supervisor: getSupervisorNavigationGrouped,
	qaManager: getQAManagerNavigationGrouped,
	operationManager: getOperationManagerNavigationGrouped,
};
