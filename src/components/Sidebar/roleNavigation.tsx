import {
	IconLayoutDashboard,
	IconPhone,
	IconClipboardCheck,
	IconBell,
	IconUser,
	IconFolders,
	IconChartLine,
	IconFileText,
	IconUsers,
	IconTarget,
	IconHeartHandshake,
} from '@tabler/icons-react';
import type { SidebarNavItem } from './Sidebar';
import styles from './Sidebar.module.css';

/**
 * Role-Based Navigation Structures
 * Defines sidebar navigation for each role: Agent, Supervisor, QA Manager, Operation Manager
 */

// AGENT NAVIGATION
export const getAgentNavigation = (): SidebarNavItem[] => [
	{
		key: 'agent-dashboard',
		label: 'sidebar.agent.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/agent/dashboard',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-my-calls',
		label: 'sidebar.agent.myCalls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/agent/calls',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-my-evaluations',
		label: 'sidebar.agent.myEvaluations',
		icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/agent/evaluations',
		i18nNamespace: 'qa.agent',
	},
	{
		key: 'agent-inbox',
		label: 'sidebar.agent.inbox',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/agent/inbox',
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
		key: 'agent-profile',
		label: 'sidebar.agent.profile',
		icon: <IconUser size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/agent/profile',
		i18nNamespace: 'qa.agent',
	},
];

// SUPERVISOR NAVIGATION
export const getSupervisorNavigation = (): SidebarNavItem[] => [
	{
		key: 'supervisor-dashboard',
		label: 'sidebar.supervisor.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/dashboard',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-team',
		label: 'sidebar.supervisor.team',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/team',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-team-triggers',
		label: 'sidebar.supervisor.triggersConfig',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/team/triggers',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-team-rankings',
		label: 'sidebar.supervisor.rankingsConfig',
		icon: <IconTarget size={20} className={styles.menuIcon} />,
		to: '/qa/agent/rankings',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-calls',
		label: 'sidebar.supervisor.calls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/calls',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-evaluations',
		label: 'sidebar.supervisor.evaluations',
		icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/evaluations',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-disputes',
		label: 'sidebar.supervisor.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/disputes',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-analytics',
		label: 'sidebar.supervisor.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/analytics',
		i18nNamespace: 'qa.supervisor',
	},
	{
		key: 'supervisor-reports',
		label: 'sidebar.supervisor.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/supervisor/reports',
		i18nNamespace: 'qa.supervisor',
	},
];

// QA MANAGER NAVIGATION
export const getQAManagerNavigation = (): SidebarNavItem[] => [
	{
		key: 'qamanager-dashboard',
		label: 'sidebar.qamanager.dashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/dashboard',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-supervisors',
		label: 'sidebar.qamanager.supervisors',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/supervisors',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-teams',
		label: 'sidebar.qamanager.teams',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/teams',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-calls',
		label: 'sidebar.qamanager.calls',
		icon: <IconPhone size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/calls',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-disputes',
		label: 'sidebar.qamanager.disputes',
		icon: <IconFolders size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/disputes',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-triggers',
		label: 'sidebar.qamanager.triggersConfig',
		icon: <IconBell size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/admin/triggers',
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
		to: '/workspace/qa/qamanager/campaigns',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-analytics',
		label: 'sidebar.qamanager.analytics',
		icon: <IconChartLine size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/analytics',
		i18nNamespace: 'qa.qamanager',
	},
	{
		key: 'qamanager-reports',
		label: 'sidebar.qamanager.reports',
		icon: <IconFileText size={20} className={styles.menuIcon} />,
		to: '/workspace/qa/qamanager/reports',
		i18nNamespace: 'qa.qamanager',
	},
];

// OPERATION MANAGER NAVIGATION
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
		to: '/workspace/qa/operationmanager/rankings',
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

export type PreviewRole = 'agent' | 'supervisor' | 'qaManager' | 'operationManager';

export const roleNavigationMap: Record<PreviewRole, () => SidebarNavItem[]> = {
	agent: getAgentNavigation,
	supervisor: getSupervisorNavigation,
	qaManager: getQAManagerNavigation,
	operationManager: getOperationManagerNavigation,
};
