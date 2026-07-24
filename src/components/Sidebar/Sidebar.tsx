import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	ActionIcon,
	Collapse,
	Divider,
	Group,
	Menu,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import {
	IconActivity,
	IconBook2,
	IconChecklist,
	IconChevronDown,
	IconClipboardCheck,
	IconForms,
	IconGitBranch,
	IconSpeakerphone,
	IconChevronLeft,
	IconChevronRight,
	IconChartBar,
	IconCpu,
	IconFileInvoice,
	IconLayoutDashboard,
	IconListDetails,
	IconInbox,
	IconSettings,
	IconTableExport,
	IconUsers,
} from '@tabler/icons-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import styles from './Sidebar.module.css';
import { prefetchNamespace } from '~/utils/i18nHelpers';
import Logo from '../Logo';
import { APP_VERSION } from '~/version';
import { usePermissions } from '~/hooks/usePermissions';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useIsSuperAdmin } from '~/hooks/useIsSuperAdmin';
import { useIsQaAdmin } from '~/hooks/useIsQaAdmin';
import { useCurrentApp } from '~/hooks/useCurrentApp';
import { useSidebarStore } from '~/stores/sidebarStore';
import { useSessionStore } from '~/stores/sessionStore';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { hasAnyActiveClientRoleCode } from '~/modules/backoffice/hooks/useBackofficeRole';
import {
	BACKOFFICE_ADMIN_ROLE,
	BACKOFFICE_AGENT_ROLE,
} from '~/modules/backoffice/constants/BackofficeRoleConstants';
import UserMenu from '../UserMenu';

type SidebarNavItem = {
	key: string;
	label: string;
	icon: React.ReactNode;
	to: string;
	/** When omitted, only the masterOnly/superAdminOnly checks apply. */
	module?: ModuleEnum;
	permission?: PermissionEnum;
	masterOnly?: boolean;
	superAdminOnly?: boolean;
	exact?: boolean;
	i18nNamespace?: string;
	roleCodes?: readonly string[];
};

type SidebarSection = {
	key: string;
	label: string;
	icon: React.ReactNode;
	items: SidebarNavItem[];
};

const primaryItems: SidebarNavItem[] = [
	{
		key: 'overview',
		label: 'sidebar.items.overview',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/',
		exact: true,
		module: ModuleEnum.DASHBOARD,
		i18nNamespace: 'overview',
	},
	{
		key: 'campaigns',
		label: 'sidebar.items.campaigns',
		icon: <IconListDetails size={20} className={styles.menuIcon} />,
		to: '/campaigns',
		module: ModuleEnum.CAMPAIGNS,
		i18nNamespace: 'campaigns',
	},
];

const sidebarSections: SidebarSection[] = [
	{
		key: 'operation',
		label: 'sidebar.categories.operation',
		icon: <IconActivity size={20} className={styles.menuIcon} />,
		items: [
			{
				key: 'campaign-management',
				label: 'sidebar.items.campaignManagement',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/campaign-management',
				module: ModuleEnum.SETTINGS,
				i18nNamespace: 'campaign-management',
			},
			{
				key: 'conversations',
				label: 'sidebar.items.conversations',
				icon: <IconChartBar size={18} className={styles.menuIcon} />,
				to: '/conversations',
				module: ModuleEnum.CONVERSATIONS,
				i18nNamespace: 'conversations',
			},
			{
				key: 'outcomes',
				label: 'sidebar.items.outcomes',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/outcomes',
				module: ModuleEnum.CAMPAIGNS,
				permission: PermissionEnum.MANAGE,
				i18nNamespace: 'outcomes',
			},
			{
				key: 'do-not-call',
				label: 'sidebar.items.doNotCall',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/do-not-call',
				module: ModuleEnum.SETTINGS,
				i18nNamespace: 'do-not-call',
			},
		],
	},
	{
		key: 'configuration',
		label: 'sidebar.categories.configuration',
		icon: <IconSettings size={20} className={styles.menuIcon} />,
		items: [
			{
				key: 'client-configs',
				label: 'sidebar.items.clientConfigs',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/configurations/client-configs',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
				i18nNamespace: 'client-configs',
			},
			{
				key: 'agent-behaviors',
				label: 'sidebar.items.agentBehaviors',
				icon: <IconListDetails size={18} className={styles.menuIcon} />,
				to: '/configurations/agent-behaviors',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				superAdminOnly: true,
				i18nNamespace: 'campaign-predefined-params',
			},
			{
				key: 'scheduler-predefined-params',
				label: 'sidebar.items.schedulerPredefinedParams',
				icon: <IconChartBar size={18} className={styles.menuIcon} />,
				to: '/configurations/scheduler-predefined-params',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				i18nNamespace: 'scheduler-predefined-params',
			},
			{
				key: 'regional-settings-params',
				label: 'sidebar.items.regionalSettingsParams',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/configurations/regional-settings-params',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				i18nNamespace: 'regional-settings-params',
			},
			{
				key: 'phone-numbers',
				label: 'sidebar.items.phoneNumbers',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/configurations/phone-numbers',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				i18nNamespace: 'phone-numbers',
			},
			{
				key: 'dictionary-rules',
				label: 'sidebar.items.dictionaryRules',
				icon: <IconBook2 size={18} className={styles.menuIcon} />,
				to: '/configurations/dictionary-rules',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
				i18nNamespace: 'dictionary-rules',
			},
			{
				key: 'elevenlabs-llms',
				label: 'sidebar.items.elevenLabsLlms',
				icon: <IconCpu size={18} className={styles.menuIcon} />,
				to: '/configurations/elevenlabs-llms',
				masterOnly: true,
				superAdminOnly: true,
				i18nNamespace: 'elevenlabs-llms',
			},
		],
	},
	{
		key: 'administration',
		label: 'sidebar.categories.administration',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		items: [
			{
				key: 'users',
				label: 'sidebar.items.users',
				icon: <IconUsers size={18} className={styles.menuIcon} />,
				to: '/users',
				module: ModuleEnum.USERS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
			},
			{
				key: 'roles',
				label: 'sidebar.items.roles',
				icon: <IconUsers size={18} className={styles.menuIcon} />,
				to: '/roles',
				module: ModuleEnum.ROLES,
				masterOnly: true,
			},
			{
				key: 'clients',
				label: 'sidebar.items.clients',
				icon: <IconUsers size={18} className={styles.menuIcon} />,
				to: '/clients',
				module: ModuleEnum.SETTINGS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
			},
			{
				key: 'invoices',
				label: 'sidebar.items.invoices',
				icon: <IconFileInvoice size={18} className={styles.menuIcon} />,
				to: '/billing/invoices',
				module: ModuleEnum.BILLING,
				masterOnly: true,
			},
		],
	},
	{
		key: 'resources',
		label: 'sidebar.categories.resources',
		icon: <IconBook2 size={20} className={styles.menuIcon} />,
		items: [
			{
				key: 'dashboards',
				label: 'sidebar.items.dashboards',
				icon: <IconChartBar size={18} className={styles.menuIcon} />,
				to: '/dashboards',
				module: ModuleEnum.DASHBOARD,
				i18nNamespace: 'dashboards',
			},
			{
				key: 'knowledge-bases',
				label: 'sidebar.items.knowledgeBases',
				icon: <IconBook2 size={18} className={styles.menuIcon} />,
				to: '/knowledge-bases',
				module: ModuleEnum.KNOWLEDGE_BASES,
				permission: PermissionEnum.READ,
				i18nNamespace: 'knowledge-bases',
			},
			{
				key: 'tools',
				label: 'sidebar.items.tools',
				icon: <IconSettings size={18} className={styles.menuIcon} />,
				to: '/tools',
				module: ModuleEnum.TOOLS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
				i18nNamespace: 'tools',
			},
			{
				key: 'agent-tests',
				label: 'sidebar.items.agentTests',
				icon: <IconActivity size={18} className={styles.menuIcon} />,
				to: '/agent-tests',
				module: ModuleEnum.CAMPAIGNS,
				permission: PermissionEnum.UPDATE,
				i18nNamespace: 'agent-tests',
			},
			{
				key: 'report-templates',
				label: 'sidebar.items.reportTemplates',
				icon: <IconTableExport size={18} className={styles.menuIcon} />,
				to: '/report-templates',
				module: ModuleEnum.REPORTS,
				i18nNamespace: 'report-templates',
			},
		],
	},
];

// QA is its own app mode, not a section in the Campaign-management sidebar.
// These render as the entire sidebar when the user is inside /qa/*, gated by
// useIsQaAdmin (QA_ADMIN or super-admin). Everyone else never sees them.
const qaPrimaryItems: SidebarNavItem[] = [
	{
		key: 'qa-dashboard',
		label: 'sidebar.items.qaDashboard',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/qa/dashboard',
		i18nNamespace: 'qa.dashboard',
	},
	{
		key: 'qa-evaluations',
		label: 'sidebar.items.qaEvaluations',
		icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
		to: '/qa/evaluations',
		i18nNamespace: 'qa.evaluations',
	},
	{
		key: 'qa-campaigns',
		label: 'sidebar.items.qaCampaigns',
		icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
		to: '/qa/campaigns',
		i18nNamespace: 'qa.campaigns',
	},
	{
		key: 'qa-forms',
		label: 'sidebar.items.qaForms',
		icon: <IconForms size={20} className={styles.menuIcon} />,
		to: '/qa/forms',
		i18nNamespace: 'qa.forms',
	},
	{
		key: 'qa-disputes',
		label: 'sidebar.items.qaDisputes',
		icon: <IconGitBranch size={20} className={styles.menuIcon} />,
		to: '/qa/disputes',
		i18nNamespace: 'qa.disputes',
	},
	{
		key: 'qa-agents',
		label: 'sidebar.items.qaAgents',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/agents',
		i18nNamespace: 'qa.agents',
	},
	{
		key: 'qa-evaluator-agents',
		label: 'sidebar.items.qaEvaluatorAgents',
		icon: <IconChecklist size={20} className={styles.menuIcon} />,
		to: '/qa/evaluator-agents',
		i18nNamespace: 'qa.evaluatorAgents',
	},
];

// Backoffice is its own app mode, not a section in the Campaign-management
// sidebar. These render as the entire sidebar when the user is inside
// /backoffice/*. Per-item roleCodes keep an agent from seeing the supervisor
// link and vice-versa.
const backofficePrimaryItems: SidebarNavItem[] = [
	{
		key: 'backoffice-supervisor',
		label: 'sidebar.items.backofficeSupervisor',
		icon: <IconChartBar size={20} className={styles.menuIcon} />,
		to: '/backoffice/supervisor',
		module: ModuleEnum.BACKOFFICE_CASES,
		permission: PermissionEnum.READ,
		roleCodes: [BACKOFFICE_ADMIN_ROLE],
		i18nNamespace: 'backoffice-supervisor',
	},
	{
		key: 'backoffice-cases',
		label: 'sidebar.items.backofficeMyCases',
		icon: <IconInbox size={20} className={styles.menuIcon} />,
		to: '/backoffice/cases',
		module: ModuleEnum.BACKOFFICE_CASES,
		permission: PermissionEnum.READ,
		roleCodes: [BACKOFFICE_AGENT_ROLE],
		i18nNamespace: 'backoffice-cases',
	},
];

export const Sidebar: React.FC = () => {
	const { canAccessModule, canPerformAction } = usePermissions();
	const { t } = useTranslation('common');
	const location = useLocation();
	const isMasterClient = useIsMasterClient();
	const isSuperAdmin = useIsSuperAdmin();
	const isQaAdmin = useIsQaAdmin();
	const { user, targetClient } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;
	const currentApp = useCurrentApp();
	const inQaApp = currentApp === 'qa' && isQaAdmin;
	const hasBackofficeRole = hasAnyActiveClientRoleCode(user, activeClientId, [
		BACKOFFICE_AGENT_ROLE,
		BACKOFFICE_ADMIN_ROLE,
	]);
	const inBackofficeApp = currentApp === 'backoffice' && hasBackofficeRole;
	const { collapsed, toggleCollapsed } = useSidebarStore();
	const [openSection, setOpenSection] = useState<string>('');
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const pendingScrollSectionRef = useRef<string | null>(null);
	// Keep track of the section that still needs to finish expanding before scrolling.
	const sectionTransitioningRef = useRef<string | null>(null);
	const scrollFrameRef = useRef<number | null>(null);

	const visiblePrimaryItems = useMemo(
		() =>
			primaryItems.filter((item) => {
				if (item.masterOnly && !isMasterClient) {
					return false;
				}

				if (item.superAdminOnly && !isSuperAdmin) {
					return false;
				}

				if (
					item.roleCodes &&
					!hasAnyActiveClientRoleCode(user, activeClientId, item.roleCodes)
				) {
					return false;
				}

				if (!item.module) {
					return true;
				}

				if (item.permission) {
					return canPerformAction(item.module, item.permission);
				}

				return canAccessModule(item.module);
			}),
		[
			activeClientId,
			canAccessModule,
			canPerformAction,
			isMasterClient,
			isSuperAdmin,
			user,
		]
	);

	const visibleSections = useMemo(
		() =>
			sidebarSections
				.map((section) => ({
					...section,
					items: section.items.filter((item) => {
						if (item.masterOnly && !isMasterClient) {
							return false;
						}

						if (item.superAdminOnly && !isSuperAdmin) {
							return false;
						}

						if (
							item.roleCodes &&
							!hasAnyActiveClientRoleCode(user, activeClientId, item.roleCodes)
						) {
							return false;
						}

						if (!item.module) {
							return true;
						}

						if (item.permission) {
							return canPerformAction(item.module, item.permission);
						}

						return canAccessModule(item.module);
					}),
				}))
				.filter((section) => section.items.length > 0),
		[
			activeClientId,
			canAccessModule,
			canPerformAction,
			isMasterClient,
			isSuperAdmin,
			user,
		]
	);

	const visibleBackofficeItems = useMemo(
		() =>
			backofficePrimaryItems.filter((item) => {
				if (
					item.roleCodes &&
					!hasAnyActiveClientRoleCode(user, activeClientId, item.roleCodes)
				) {
					return false;
				}

				if (!item.module) {
					return true;
				}

				if (item.permission) {
					return canPerformAction(item.module, item.permission);
				}

				return canAccessModule(item.module);
			}),
		[activeClientId, canAccessModule, canPerformAction, user]
	);

	// Each app owns its sidebar: QA and Backoffice render as a flat nav with no
	// sections; Campaign management (UCXM) renders the normal sectioned nav.
	const primaryNav = inQaApp
		? qaPrimaryItems
		: inBackofficeApp
			? visibleBackofficeItems
			: visiblePrimaryItems;
	const sectionNav = inQaApp || inBackofficeApp ? [] : visibleSections;

	const activeSection = useMemo(
		() =>
			sectionNav.find((section) =>
				section.items.some((item) => isLinkActive(item, location.pathname))
			) ?? null,
		[location.pathname, sectionNav]
	);

	const activeItem = useMemo(
		() =>
			primaryNav.find((item) => isLinkActive(item, location.pathname)) ??
			sectionNav
				.flatMap((section) => section.items)
				.find((item) => isLinkActive(item, location.pathname)) ??
			null,
		[location.pathname, primaryNav, sectionNav]
	);
	const activeItemKey = activeItem?.key ?? null;
	const activeSectionKey = activeSection?.key ?? null;

	useEffect(() => {
		if (activeSection) {
			setOpenSection(activeSection.key);
			return;
		}

		setOpenSection('');
	}, [activeSection]);

	const scrollActiveItemIntoView = useCallback(() => {
		if (collapsed) {
			return false;
		}

		const scrollContainer = scrollContainerRef.current;
		const activeNode = scrollContainer?.querySelector<HTMLElement>(
			'[data-sidebar-active="true"]'
		);

		if (!activeNode) {
			return false;
		}

		if (scrollFrameRef.current !== null) {
			window.cancelAnimationFrame(scrollFrameRef.current);
		}

		scrollFrameRef.current = window.requestAnimationFrame(() => {
			scrollFrameRef.current = null;
			activeNode.scrollIntoView({
				block: 'center',
				inline: 'nearest',
				behavior: 'auto',
			});
		});

		return true;
	}, [collapsed]);

	useEffect(
		() => () => {
			if (scrollFrameRef.current !== null) {
				window.cancelAnimationFrame(scrollFrameRef.current);
			}
		},
		[]
	);

	useEffect(() => {
		if (collapsed) {
			pendingScrollSectionRef.current = null;
			sectionTransitioningRef.current = null;
			return;
		}

		if (!activeItemKey) {
			pendingScrollSectionRef.current = null;
			sectionTransitioningRef.current = null;
			return;
		}

		pendingScrollSectionRef.current = activeSectionKey;

		if (!activeSectionKey) {
			sectionTransitioningRef.current = null;
			scrollActiveItemIntoView();
			pendingScrollSectionRef.current = null;
			return;
		}

		if (openSection === activeSectionKey) {
			if (sectionTransitioningRef.current === activeSectionKey) {
				return;
			}

			sectionTransitioningRef.current = null;
			scrollActiveItemIntoView();
			pendingScrollSectionRef.current = null;
			return;
		}

		sectionTransitioningRef.current = activeSectionKey;
	}, [
		activeItemKey,
		activeSectionKey,
		collapsed,
		openSection,
		scrollActiveItemIntoView,
	]);

	const handleSectionToggle = (sectionKey: string) => {
		setOpenSection((current) => (current === sectionKey ? '' : sectionKey));
	};

	return (
		<nav
			className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}
			aria-label={t('sidebar.ariaLabel')}
		>
			<div className={styles.brandSection}>
				<div className={styles.topBar}>
					<div className={styles.logoWrapper}>
						<Logo compact={collapsed} />
					</div>
				</div>
				<div className={styles.brandControls}>
					<Tooltip
						label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
						position='right'
						withArrow
					>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							className={styles.collapseButton}
							onClick={toggleCollapsed}
							aria-label={
								collapsed ? t('sidebar.expand') : t('sidebar.collapse')
							}
						>
							{collapsed ? (
								<IconChevronRight size={16} />
							) : (
								<IconChevronLeft size={16} />
							)}
						</ActionIcon>
					</Tooltip>
				</div>
				<Divider className={styles.brandDivider} />
			</div>

			<Stack gap='xs' className={styles.primaryLinks}>
				{primaryNav.map((item) => (
					<SidebarLinkItem
						key={item.key}
						item={item}
						collapsed={collapsed}
						isActive={activeItem?.key === item.key}
					/>
				))}
			</Stack>

			<Divider className={styles.divider} />

			<div className={styles.mainScrollArea} ref={scrollContainerRef}>
				<Stack gap='xs' className={styles.menuList}>
					<Stack gap='xs' className={styles.sectionsList}>
						{sectionNav.map((section) => (
							<SidebarSectionGroup
								key={section.key}
								section={section}
								collapsed={collapsed}
								open={openSection === section.key}
								activeItem={activeItem}
								onCollapseTransitionEnd={() => {
									if (pendingScrollSectionRef.current !== section.key) {
										return;
									}

									scrollActiveItemIntoView();
									pendingScrollSectionRef.current = null;
									sectionTransitioningRef.current = null;
								}}
								onToggle={() => handleSectionToggle(section.key)}
							/>
						))}
					</Stack>

					{primaryNav.length === 0 && sectionNav.length === 0 && (
						<div className={styles.emptyState}>
							<Text size='sm' c='dimmed' fw={600}>
								{t('sidebar.noModules')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('sidebar.requestAccess')}
							</Text>
						</div>
					)}
				</Stack>
			</div>

			<div className={styles.bottomSection}>
				<Divider className={styles.divider} />
				<UserMenu collapsed={collapsed} />
				{!collapsed && (
					<Text size='xs' c='dimmed' className={styles.versionText}>
						{t('sidebar.version')} {APP_VERSION}
					</Text>
				)}
			</div>
		</nav>
	);
};

interface SidebarLinkItemProps {
	item: SidebarNavItem;
	collapsed: boolean;
	isActive?: boolean;
	onNavigate?: () => void;
}

const SidebarLinkItem: React.FC<SidebarLinkItemProps> = ({
	item,
	collapsed,
	isActive = false,
	onNavigate,
}) => {
	const location = useLocation();
	const { t } = useTranslation('common');
	const { closeMobile } = useSidebarStore();

	const isSelected = isLinkActive(item, location.pathname);

	const link = (
		<Link
			to={item.to}
			className={[
				styles.menuItem,
				collapsed ? styles.menuItemCollapsed : '',
				isSelected ? styles.menuItemSelected : '',
			].join(' ')}
			aria-current={isSelected ? 'page' : undefined}
			data-sidebar-active={isActive ? 'true' : undefined}
			onClick={() => {
				closeMobile();
				onNavigate?.();
			}}
			onMouseEnter={() =>
				item.i18nNamespace && prefetchNamespace(item.i18nNamespace)
			}
		>
			{item.icon}
			{!collapsed && <span className={styles.menuText}>{t(item.label)}</span>}
		</Link>
	);

	if (collapsed) {
		return (
			<Tooltip label={t(item.label)} position='right' withArrow>
				{link}
			</Tooltip>
		);
	}

	return link;
};

interface SidebarSectionGroupProps {
	section: SidebarSection;
	collapsed: boolean;
	open: boolean;
	activeItem: SidebarNavItem | null;
	onCollapseTransitionEnd: () => void;
	onToggle: () => void;
}

const SidebarSectionGroup: React.FC<SidebarSectionGroupProps> = ({
	section,
	collapsed,
	open,
	activeItem,
	onCollapseTransitionEnd,
	onToggle,
}) => {
	const { t } = useTranslation('common');
	const location = useLocation();
	const { closeMobile } = useSidebarStore();

	if (collapsed) {
		return (
			<div className={styles.sectionGroup}>
				<Menu
					position='right-start'
					offset={10}
					withinPortal
					shadow='md'
					trigger='click'
					closeOnItemClick
				>
					<Menu.Target>
						<UnstyledButton
							className={[
								styles.sectionHeader,
								styles.sectionHeaderCollapsed,
							].join(' ')}
							aria-label={t(section.label)}
						>
							{section.icon}
						</UnstyledButton>
					</Menu.Target>
					<Menu.Dropdown className={styles.compactSectionPanel}>
						<Menu.Label className={styles.compactSectionPanelHeader}>
							{t(section.label)}
						</Menu.Label>
						{section.items.map((item) => (
							<Menu.Item
								key={item.key}
								component={Link}
								to={item.to}
								leftSection={item.icon}
								className={[
									styles.compactMenuItem,
									isLinkActive(item, location.pathname)
										? styles.compactMenuItemActive
										: '',
								].join(' ')}
								onClick={() => closeMobile()}
								onMouseEnter={() =>
									item.i18nNamespace && prefetchNamespace(item.i18nNamespace)
								}
							>
								{t(item.label)}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			</div>
		);
	}

	return (
		<div className={styles.sectionGroup}>
			<UnstyledButton
				className={styles.sectionHeader}
				onClick={onToggle}
				aria-expanded={open}
			>
				<Group gap='xs' wrap='nowrap' className={styles.sectionHeaderInner}>
					{section.icon}
					<Text
						size='xs'
						fw={700}
						tt='uppercase'
						c='dimmed'
						className={styles.sectionLabel}
					>
						{t(section.label)}
					</Text>
				</Group>
				<IconChevronDown
					size={14}
					className={[
						styles.sectionChevron,
						open ? styles.sectionChevronOpen : '',
					].join(' ')}
				/>
			</UnstyledButton>
			<Collapse expanded={open} onTransitionEnd={onCollapseTransitionEnd}>
				<Stack gap={4} className={styles.sectionItems}>
					{section.items.map((item) => (
						<SidebarLinkItem
							key={item.key}
							item={item}
							collapsed={false}
							isActive={activeItem?.key === item.key}
						/>
					))}
				</Stack>
			</Collapse>
		</div>
	);
};

const isLinkActive = (item: SidebarNavItem, pathname: string) => {
	if (item.exact) {
		return pathname === item.to;
	}

	if (item.to === '/campaigns') {
		return pathname === '/campaigns' || pathname.startsWith('/campaign/');
	}

	return pathname === item.to || pathname.startsWith(`${item.to}/`);
};
