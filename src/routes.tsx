import React, { Suspense } from 'react';
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
	useMatches,
} from 'react-router';
import { useTranslation } from 'react-i18next';

// Route components (lazy-loaded where appropriate to split bundles)

import RouteProtecter, {
	clientLoader as routeProtecterLoader,
} from './components/RouteProtecter/RouteProtecter';
import ModuleGuard from './components/RouteGuards/ModuleGuard';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { campaignRouteNamespaces } from '~/modules/campaigns/campaignNamespaces';
import SuspenseFallback from './components/SuspenseFallback';
const Layout = React.lazy(() => import('./components/Layout'));

const CampaignContactListPage = React.lazy(
	() =>
		import('./modules/campaigns/CampaignContactListPage/CampaignContactListPage')
);
const CampaignConversationsPage = React.lazy(
	() =>
		import('./modules/campaigns/CampaignConversationsPage/CampaignConversationsPage')
);
const ForcePasswordChangePage = React.lazy(
	() => import('./modules/auth/ForcePasswordChangePage/ForcePasswordChangePage')
);

const ClientConfigsPage = React.lazy(
	() => import('./modules/configurations/client-configs/ClientConfigsPage')
);
const ToolsPage = React.lazy(
	() => import('./modules/tools/ToolsPage/ToolsPage')
);
const AgentTestsPage = React.lazy(
	() => import('./modules/agent-tests/AgentTestsPage')
);
const UsersPage = React.lazy(
	() => import('./modules/users/UsersPage/UsersPage')
);
const RolesPage = React.lazy(
	() => import('./modules/roles/RolesPage/RolesPage')
);
const ClientsPage = React.lazy(
	() => import('./modules/clients/ClientsPage/ClientsPage')
);
const DispositionPage = React.lazy(
	() => import('./modules/outcomes/DispositionPage')
);
const ConversationPage = React.lazy(
	() => import('./modules/conversations/ConversationsPage/ConversationPage')
);

const OverviewDashboardPage = React.lazy(
	() => import('./modules/overview/OverviewDashboardPage/OverviewDashboardPage')
);
const DashboardsPage = React.lazy(
	() => import('./modules/dashboards/DashboardsPage/DashboardsPage')
);
import { LoginForm } from './modules/auth/LoginForm';
import { PermissionEnum } from './constants/PermissionEnum';
const KnowledgeBasePage = React.lazy(
	() => import('./modules/knowledge-bases/KnowledgeBasePage/KnowledgeBasePage')
);
const ProfilePage = React.lazy(() => import('./modules/profile/ProfilePage'));
const DoNotCallPage = React.lazy(
	() => import('./modules/do-not-call/DoNotCallPage/DoNotCallPage')
);
const CampaignPredefinedParamsPage = React.lazy(
	() =>
		import('./modules/configurations/CampaignPredefinedParamsPage/CampaignPredefinedParamsPage')
);
const RegionalSettingsParamsPage = React.lazy(
	() =>
		import('./modules/configurations/RegionalSettingsParamsPage/RegionalSettingsParamsPage')
);
const SchedulerPredefinedParamsPage = React.lazy(
	() =>
		import('./modules/configurations/SchedulerPredefinedParamsPage/SchedulerPredefinedParamsPage')
);
const PhoneNumbersPage = React.lazy(
	() => import('./modules/configurations/PhoneNumbers/PhoneNumbersPage')
);
const DictionaryRulesPage = React.lazy(
	() => import('./modules/configurations/DictionaryRules/DictionaryRulesPage')
);
const ConfigurationsPage = React.lazy(
	() => import('./modules/configurations/ConfigurationsPage')
);
const CampaignManagementPage = React.lazy(
	() => import('./modules/campaign-management/CampaignManagementPage')
);
const CampaignPage = React.lazy(
	() => import('./modules/campaigns/CampaignPage/CampaignPage')
);
const CampaignEditorPage = React.lazy(
	() => import('./modules/campaigns/CampaignEditorPage/CampaignEditorPage')
);
const CampaignTestPage = React.lazy(
	() => import('./modules/campaigns/CampaignTestPage/CampaignTestPage')
);
const CampaignViewPage = React.lazy(
	() => import('./modules/campaigns/CampaignViewPage/CampaignViewPage')
);

const CampaignsPage = React.lazy(
	() => import('./modules/campaigns/CampaignsPage/CampaignsPage')
);
const ReportTemplatesPage = React.lazy(
	() => import('./modules/report-templates/ReportTemplatesPage')
);
const ReportTemplatesListPage = React.lazy(
	() => import('./modules/report-templates/ReportTemplatesListPage')
);
const ReportTemplateDetailPage = React.lazy(
	() => import('./modules/report-templates/ReportTemplateDetailPage')
);

/**
 * Automatically loads i18n namespaces based on the active route's ID.
 */
const I18nNamespaceLoader = ({ children }: { children: React.ReactNode }) => {
	const matches = useMatches();
	const lastMatch = matches[matches.length - 1];
	// Derive namespace from route ID or path
	const namespace = lastMatch?.id;
	const resolvedNamespace =
		namespace && namespace !== 'root' && !namespace.includes('/')
			? (campaignRouteNamespaces[namespace] ?? namespace)
			: 'common';

	// Use useTranslation to ensure the namespace is loaded before rendering children.
	// This will trigger suspension if the namespace is not yet available.
	useTranslation(resolvedNamespace);

	return <>{children}</>;
};

const router = createBrowserRouter([
	// Public routes
	{ path: '/login', element: <LoginForm /> },

	// Protected routes
	{
		element: <RouteProtecter />,
		loader: routeProtecterLoader,
		children: [
			{
				path: 'force-password-change',
				id: 'auth.force-password-change',
				element: (
					<Suspense fallback={<SuspenseFallback />}>
						<ForcePasswordChangePage />
					</Suspense>
				),
			},
			{
				element: (
					<Suspense fallback={<SuspenseFallback />}>
						<Layout />
					</Suspense>
				),
				children: [
					{
						index: true,
						id: 'overview',
						element: (
							<I18nNamespaceLoader>
								<Suspense fallback={<SuspenseFallback />}>
									<OverviewDashboardPage />
								</Suspense>
							</I18nNamespaceLoader>
						),
					},
					{
						path: 'dashboards',
						id: 'dashboards',
						element: (
							<ModuleGuard module={ModuleEnum.DASHBOARD}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<DashboardsPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'campaign-management',
						id: 'campaign-management',
						element: (
							<ModuleGuard module={ModuleEnum.SETTINGS}>
								<Suspense fallback={<SuspenseFallback />}>
									<CampaignManagementPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'campaigns',
						id: 'campaigns',
						element: (
							<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<CampaignsPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'campaign/:campaignId',
						id: 'campaign.detail',
						element: (
							<ModuleGuard
								module={ModuleEnum.CAMPAIGNS}
								permission={PermissionEnum.UPDATE}
							>
								<Suspense fallback={<SuspenseFallback />}>
									<CampaignPage />
								</Suspense>
							</ModuleGuard>
						),
						children: [
							{
								index: true,
								id: 'campaign.detail.index',
								element: (
									<I18nNamespaceLoader>
										<Suspense fallback={<SuspenseFallback />}>
											<CampaignEditorPage />
										</Suspense>
									</I18nNamespaceLoader>
								),
							},
							{
								path: 'test',
								id: 'campaign.detail.test',
								element: (
									<I18nNamespaceLoader>
										<Suspense fallback={<SuspenseFallback />}>
											<CampaignTestPage />
										</Suspense>
									</I18nNamespaceLoader>
								),
							},
						],
					},
					{
						path: 'campaign/view/:campaignId',
						id: 'campaign.view',
						element: (
							<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
								<Suspense fallback={<SuspenseFallback />}>
									<CampaignViewPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'campaign/:campaignId/contact-list/:contactGroupId',
						id: 'campaign.contact-list',
						element: (
							<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<CampaignContactListPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'campaign/:campaignId/conversations',
						id: 'campaign.conversations',
						element: (
							<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<CampaignConversationsPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'users',
						id: 'users',
						element: (
							<ModuleGuard
								module={ModuleEnum.USERS}
								permission={PermissionEnum.MANAGE}
								masterOnly
							>
								<Suspense fallback={<SuspenseFallback />}>
									<UsersPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'roles',
						id: 'roles',
						element: (
							<ModuleGuard module={ModuleEnum.ROLES} masterOnly>
								<Suspense fallback={<SuspenseFallback />}>
									<RolesPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'clients',
						id: 'clients',
						element: (
							<ModuleGuard
								module={ModuleEnum.SETTINGS}
								permission={PermissionEnum.MANAGE}
								masterOnly
							>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<ClientsPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'conversations',
						id: 'conversations',
						element: (
							<ModuleGuard module={ModuleEnum.CONVERSATIONS}>
								<Suspense fallback={<SuspenseFallback />}>
									<ConversationPage />
								</Suspense>
							</ModuleGuard>
						),
					},

					{
						path: 'outcomes',
						id: 'outcomes',
						element: (
							<ModuleGuard
								module={ModuleEnum.CAMPAIGNS}
								permission={PermissionEnum.MANAGE}
							>
								<Suspense fallback={<SuspenseFallback />}>
									<DispositionPage />
								</Suspense>
							</ModuleGuard>
						),
					},

					{
						path: 'configurations',
						id: 'configurations',
						element: (
							<ModuleGuard
								module={ModuleEnum.SETTINGS}
								permission={PermissionEnum.MANAGE}
							>
								<Suspense fallback={<SuspenseFallback />}>
									<ConfigurationsPage />
								</Suspense>
							</ModuleGuard>
						),
						children: [
							{
								index: true,
								element: (
									<Navigate to='/configurations/client-configs' replace />
								),
							},
							{
								path: 'client-configs',
								id: 'client-configs',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<ClientConfigsPage />
									</Suspense>
								),
							},
							{
								path: 'campaign-predefined-params',
								id: 'campaign-predefined-params',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<CampaignPredefinedParamsPage />
									</Suspense>
								),
							},
							{
								path: 'scheduler-predefined-params',
								id: 'scheduler-predefined-params',
								element: (
									<I18nNamespaceLoader>
										<Suspense fallback={<SuspenseFallback />}>
											<SchedulerPredefinedParamsPage />
										</Suspense>
									</I18nNamespaceLoader>
								),
							},
							{
								path: 'regional-settings-params',
								id: 'regional-settings-params',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<RegionalSettingsParamsPage />
									</Suspense>
								),
							},
							{
								path: 'phone-numbers',
								id: 'phone-numbers',
								element: (
									<I18nNamespaceLoader>
										<Suspense fallback={<SuspenseFallback />}>
											<PhoneNumbersPage />
										</Suspense>
									</I18nNamespaceLoader>
								),
							},
							{
								path: 'dictionary-rules',
								id: 'dictionary-rules',
								element: (
									<ModuleGuard module={ModuleEnum.SETTINGS} masterOnly>
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<DictionaryRulesPage />
											</Suspense>
										</I18nNamespaceLoader>
									</ModuleGuard>
								),
							},
						],
					},
					{
						path: 'do-not-call',
						id: 'do-not-call',
						element: (
							<ModuleGuard module={ModuleEnum.SETTINGS}>
								<Suspense fallback={<SuspenseFallback />}>
									<DoNotCallPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'knowledge-bases',
						id: 'knowledge-bases',
						element: (
							<ModuleGuard
								module={ModuleEnum.KNOWLEDGE_BASES}
								permission={PermissionEnum.READ}
							>
								<Suspense fallback={<SuspenseFallback />}>
									<KnowledgeBasePage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'tools',
						id: 'tools',
						element: (
							<ModuleGuard
								module={ModuleEnum.TOOLS}
								permission={PermissionEnum.MANAGE}
								masterOnly
							>
								<Suspense fallback={<SuspenseFallback />}>
									<ToolsPage />
								</Suspense>
							</ModuleGuard>
						),
					},
					{
						path: 'agent-tests',
						id: 'agent-tests',
						element: (
							<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<AgentTestsPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
					},
					{
						path: 'report-templates',
						id: 'report-templates',
						element: (
							<ModuleGuard module={ModuleEnum.REPORTS}>
								<I18nNamespaceLoader>
									<Suspense fallback={<SuspenseFallback />}>
										<ReportTemplatesPage />
									</Suspense>
								</I18nNamespaceLoader>
							</ModuleGuard>
						),
						children: [
							{
								index: true,
								id: 'report-templates.index',
								element: <ReportTemplatesListPage />,
							},
							{
								path: ':reportTemplateId',
								id: 'report-templates.detail',
								element: (
									<ModuleGuard
										module={ModuleEnum.REPORTS}
										permission={PermissionEnum.UPDATE}
									>
										<ReportTemplateDetailPage />
									</ModuleGuard>
								),
							},
						],
					},
					{
						path: 'profile',
						id: 'profile',
						element: (
							<Suspense fallback={<SuspenseFallback />}>
								<ProfilePage />
							</Suspense>
						),
					},
				],
			},
		],
	},
]);

export default function AppRoutes() {
	return <RouterProvider router={router} />;
}
