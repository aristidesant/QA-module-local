import React, { Suspense } from 'react';
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
	Outlet,
	useMatches,
} from 'react-router';
import { useTranslation } from 'react-i18next';

// Route components (lazy-loaded where appropriate to split bundles)

import SmartRootRedirect from './components/SmartRootRedirect/SmartRootRedirect';
import RouteProtecter, {
	clientLoader as routeProtecterLoader,
} from './components/RouteProtecter/RouteProtecter';
import ModuleGuard from './components/ModuleGuard/ModuleGuard';
import RouteErrorBoundary from './components/GenericAppError/RouteErrorBoundary';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { campaignRouteNamespaces } from '~/modules/campaigns/campaignNamespaces';
import { qaRouteNamespaces } from '~/modules/qa/qaNamespaces';
import { backofficeRouteNamespaces } from '~/modules/backoffice/backofficeNamespaces';
import SuspenseFallback from './components/SuspenseFallback/SuspenseFallback';
import BackofficeRoleGuard, {
	BackofficeAdminGuard,
	BackofficeAgentGuard,
	BackofficeHomeRedirect,
} from './modules/backoffice/guards';
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
const ClientFormPage = React.lazy(
	() => import('./modules/clients/ClientFormPage')
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
import { LoginForm } from './modules/auth/LoginForm/LoginForm';
import { PermissionEnum } from './constants/PermissionEnum';
const KnowledgeBasePage = React.lazy(
	() => import('./modules/knowledge-bases/KnowledgeBasePage/KnowledgeBasePage')
);
const ProfilePage = React.lazy(() => import('./modules/profile/ProfilePage'));
const RolePreviewPlaceholderPage = React.lazy(
	() => import('./modules/role-preview/RolePreviewPlaceholderPage')
);
const AgentsRosterPage = React.lazy(
	() => import('./modules/role-preview/AgentsRosterPage/AgentsRosterPage')
);
const RolePreviewAgentDetailPage = React.lazy(
	() => import('./modules/role-preview/AgentDetailPage/AgentDetailPage')
);
const AgentEvaluationsPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentEvaluationsPage/AgentEvaluationsPage')
);
const AgentEvaluationDetailPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentEvaluationDetailPage/AgentEvaluationDetailPage')
);
const AgentCoachingPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentCoachingPage/AgentCoachingPage')
);
const AgentCoachingDetailPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentCoachingDetailPage/AgentCoachingDetailPage')
);
const AgentLmsPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentLmsPage/AgentLmsPage')
);
const AgentLmsDetailPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentDashboard/pages/AgentLmsDetailPage/AgentLmsDetailPage')
);
const AgentAnalyticsPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/AgentAnalytics/pages/AgentAnalyticsPage/AgentAnalyticsPage')
);
const QAAgentAnalyticsPage = React.lazy(
	() => import('./modules/qa/agent/analytics/AgentAnalyticsPage')
);
const SupervisorAnalyticsPage = React.lazy(
	() =>
		import('./modules/evaluations-demo/SupervisorAnalytics/pages/SupervisorAnalyticsPage/SupervisorAnalyticsPage')
);
const NewAgentDashboard = React.lazy(
	() => import('./modules/qa/dashboard/pages/NewAgentDashboard')
);
const NewSupervisorDashboard = React.lazy(
	() => import('./modules/qa/dashboard/pages/NewSupervisorDashboard')
);
const NewQAManagerDashboard = React.lazy(
	() => import('./modules/qa/dashboard/pages/NewQAManagerDashboard')
);
const NewOperationManagerDashboard = React.lazy(
	() => import('./modules/qa/dashboard/pages/NewOperationManagerDashboard')
);
const QaInboxPage = React.lazy(
	() => import('./modules/qa/dashboard/pages/InboxPage')
);
const AgentLMSPage = React.lazy(
	() => import('./modules/qa/agent/lms/AgentLMSPage')
);
const CustomerProfilePage = React.lazy(
	() => import('./modules/qa/dashboard/pages/CustomerProfilePage')
);
const ReportingPage = React.lazy(
	() => import('./modules/qa/dashboard/pages/ReportingPage')
);
const TeamRankingsPage = React.lazy(
	() => import('./modules/qa/agent/rankings/TeamRankingsPage')
);
const SupervisorSettingsPage = React.lazy(
	() => import('./modules/qa/supervisor/pages/SettingsPage')
);
const SupervisorCallsPage = React.lazy(
	() => import('./modules/qa/supervisor/pages/CallsPage')
);
const SupervisorEvaluationsPage = React.lazy(
	() => import('./modules/qa/supervisor/pages/EvaluationsPage')
);
const SupervisorReportsPage = React.lazy(
	() => import('./modules/qa/supervisor/pages/ReportsPage')
);
const QAManagerSupervisorsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/SupervisorsPage')
);
const QAManagerTeamsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/TeamsPage')
);
const QAManagerCampaignsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/CampaignsPage')
);
const QAManagerAgentsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/AgentsPage')
);
const QAManagerCoachingPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/CoachingPage')
);
const QAManagerLmsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/LmsPage')
);
const QAManagerSettingsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/SettingsPage')
);
const QAManagerCallsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/CallsPage')
);
const QAManagerReportsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/ReportsPage')
);

// Phase 4-5: New QA Admin Components
const SupervisorRankingsConfigPanel = React.lazy(() =>
	import('./modules/qa/operationmanager/configuration/SupervisorRankingsConfigPanel').then(
		(m) => ({ default: m.SupervisorRankingsConfigPanel })
	)
);
const DisputesManagement = React.lazy(() =>
	import('./modules/qa/disputes/DisputesManagement').then((m) => ({
		default: m.DisputesManagement,
	}))
);
const EmotionDisplayShowcase = React.lazy(
	() => import('./modules/evaluations-demo/pages/EmotionDisplayShowcase')
);
const DemoQaFormsListPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoQaFormsListPage')
);
const DemoCreateQaTestPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoCreateQaTestPage')
);
const DemoQaFormEditPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoQaFormEditPage')
);
const DemoCampaignsListPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoCampaignsListPage')
);
const DemoNewCampaignWizardPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoNewCampaignWizardPage')
);
const DemoCampaignDetailPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoCampaignDetailPage')
);
const DemoResultCallDetailPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoResultCallDetailPage')
);
const DemoCallDetailPage = React.lazy(
	() => import('./modules/evaluations-demo/DemoCallDetailPage')
);
const DoNotCallPage = React.lazy(
	() => import('./modules/do-not-call/DoNotCallPage/DoNotCallPage')
);

const AgentBehaviorsPage = React.lazy(
	() => import('./modules/configurations/AgentBehaviorsPage/AgentBehaviorsPage')
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
const ElevenLabsLlmCatalogPage = React.lazy(
	() => import('./modules/elevenlabs-llms/ElevenLabsLlmCatalogPage')
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
const AgentDetailPage = React.lazy(
	() => import('./modules/agent-details/AgentDetailPage')
);

const CampaignsPage = React.lazy(
	() => import('./modules/campaigns/CampaignsPage/CampaignsPage')
);
const ExternalCampaignWizard = React.lazy(
	() =>
		import('./modules/campaigns/ExternalCampaignWizard/ExternalCampaignWizard')
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
const InvoicesPage = React.lazy(
	() => import('./modules/billing/InvoicesPage/InvoicesPage')
);
const InvoiceNewPage = React.lazy(
	() => import('./modules/billing/InvoiceNewPage/InvoiceNewPage')
);
const InvoiceDetailPage = React.lazy(
	() => import('./modules/billing/InvoiceDetailPage/InvoiceDetailPage')
);
const QaEvaluatorAgentsListPage = React.lazy(
	() => import('./modules/qa/evaluatorAgents/EvaluatorAgentsListPage')
);
const QaAgentsListPage = React.lazy(
	() => import('./modules/qa/agents/AgentsListPage')
);
const QaAgentDetailPage = React.lazy(
	() => import('./modules/qa/agents/AgentDetailPage')
);
const QaDisputesListPage = React.lazy(
	() => import('./modules/qa/disputes/DisputesListPage')
);
const QaDisputeDetailPage = React.lazy(
	() => import('./modules/qa/disputes/DisputeDetailPage')
);
const CampaignsList = React.lazy(
	() => import('./views/Campaigns/pages/CampaignsList')
);
const CampaignDetail = React.lazy(
	() => import('./views/Campaigns/pages/CampaignDetail')
);
const ConversationEvaluations = React.lazy(
	() => import('./views/Campaigns/pages/ConversationEvaluations')
);
const CampaignResults = React.lazy(
	() => import('./views/Campaigns/pages/CampaignResults')
);
const QaFormsListPage = React.lazy(
	() => import('./modules/qa/forms/FormsListPage')
);
const QaErrorTypesPage = React.lazy(
	() => import('./modules/qa/forms/ErrorTypesPage')
);
const QaFormBuilderPage = React.lazy(
	() => import('./modules/qa/forms/FormBuilderPage')
);
const QaEvaluationsListPage = React.lazy(
	() => import('./modules/qa/evaluations/EvaluationsListPage')
);
const QaManualEvaluationPage = React.lazy(
	() => import('./modules/qa/evaluations/ManualEvaluationPage')
);
const EmotionSentimentDashboardPage = React.lazy(
	() =>
		import('./modules/qa/emotion-sentiment/EmotionSentimentDashboardPage/EmotionSentimentDashboardPage')
);
const BackofficeCasesPage = React.lazy(
	() => import('./modules/backoffice/BackofficeCasesPage/BackofficeCasesPage')
);
const BackofficeCaseDetailPage = React.lazy(
	() =>
		import('./modules/backoffice/BackofficeCaseDetailPage/BackofficeCaseDetailPage')
);
const BackofficeSupervisorPage = React.lazy(
	() =>
		import('./modules/backoffice/BackofficeSupervisorPage/BackofficeSupervisorPage')
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
			? (campaignRouteNamespaces[namespace] ??
				qaRouteNamespaces[namespace] ??
				backofficeRouteNamespaces[namespace] ??
				namespace)
			: 'common';

	// Use useTranslation to ensure the namespace is loaded before rendering children.
	// This will trigger suspension if the namespace is not yet available.
	useTranslation(resolvedNamespace);

	return <>{children}</>;
};

const router = createBrowserRouter([
	{
		id: 'root',
		path: '/',
		element: <Outlet />,
		errorElement: <RouteErrorBoundary />,
		children: [
			// Public routes
			{ path: 'login', id: 'login', element: <LoginForm /> },

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
									<SmartRootRedirect>
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<OverviewDashboardPage />
											</Suspense>
										</I18nNamespaceLoader>
									</SmartRootRedirect>
								),
							},
							{
								path: 'workspace/emotion-sentiment',
								id: 'emotion-sentiment',
								element: <Outlet />,
								children: [
									{
										index: true,
										element: (
											<Navigate
												to='/workspace/emotion-sentiment/general'
												replace
											/>
										),
									},
									{
										path: 'general',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<EmotionSentimentDashboardPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'predictive',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<EmotionSentimentDashboardPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'reports',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<EmotionSentimentDashboardPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'benchmarking',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<EmotionSentimentDashboardPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'notifications',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<EmotionSentimentDashboardPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
								],
							},
							{
								path: 'backoffice',
								id: 'backoffice',
								element: (
									<ModuleGuard
										module={ModuleEnum.BACKOFFICE_CASES}
										permission={PermissionEnum.READ}
									>
										<BackofficeRoleGuard />
									</ModuleGuard>
								),
								children: [
									{
										index: true,
										element: <BackofficeHomeRedirect />,
									},
									{
										path: 'cases',
										id: 'backoffice.cases',
										element: (
											<BackofficeAgentGuard>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<BackofficeCasesPage />
													</Suspense>
												</I18nNamespaceLoader>
											</BackofficeAgentGuard>
										),
									},
									{
										path: 'supervisor',
										id: 'backoffice.supervisor',
										element: (
											<BackofficeAdminGuard>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<BackofficeSupervisorPage />
													</Suspense>
												</I18nNamespaceLoader>
											</BackofficeAdminGuard>
										),
									},
									{
										path: 'cases/:caseId',
										id: 'backoffice.cases.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<BackofficeCaseDetailPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
								],
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
								path: 'external-campaign-setup',
								id: 'external-campaign-setup',
								element: (
									<ModuleGuard module={ModuleEnum.CAMPAIGNS}>
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<ExternalCampaignWizard />
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
										path: 'agent/:campaignAgentId',
										id: 'campaign.detail.agent',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<AgentDetailPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
										children: [
											{
												path: 'test/:agentId',
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
										path: 'test',
										id: 'campaign.detail.test.legacy',
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
								path: 'clients/new',
								id: 'clients.new',
								element: (
									<ModuleGuard
										module={ModuleEnum.SETTINGS}
										permission={PermissionEnum.MANAGE}
										masterOnly
									>
										<Suspense fallback={<SuspenseFallback />}>
											<ClientFormPage mode='create' />
										</Suspense>
									</ModuleGuard>
								),
							},
							{
								path: 'clients/:clientId/edit',
								id: 'clients.edit',
								element: (
									<ModuleGuard
										module={ModuleEnum.SETTINGS}
										permission={PermissionEnum.MANAGE}
										masterOnly
									>
										<Suspense fallback={<SuspenseFallback />}>
											<ClientFormPage mode='edit' />
										</Suspense>
									</ModuleGuard>
								),
							},
							{
								path: 'billing',
								children: [
									{
										path: 'invoices',
										id: 'invoices',
										element: (
											<ModuleGuard module={ModuleEnum.BILLING} masterOnly>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<InvoicesPage />
													</Suspense>
												</I18nNamespaceLoader>
											</ModuleGuard>
										),
									},
									{
										path: 'invoices/new',
										id: 'invoices-new',
										element: (
											<ModuleGuard module={ModuleEnum.BILLING} masterOnly>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<InvoiceNewPage />
													</Suspense>
												</I18nNamespaceLoader>
											</ModuleGuard>
										),
									},
									{
										path: 'invoices/:id',
										id: 'invoices-detail',
										element: (
											<ModuleGuard module={ModuleEnum.BILLING} masterOnly>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<InvoiceDetailPage />
													</Suspense>
												</I18nNamespaceLoader>
											</ModuleGuard>
										),
									},
								],
							},
							{
								path: 'qa',
								id: 'qa',
								element: (
									<ModuleGuard qaAdminOnly>
										<Outlet />
									</ModuleGuard>
								),
								children: [
									{
										index: true,
										element: (
											<Navigate to='/qa/dashboards/qa-manager' replace />
										),
									},
									{
										path: 'dashboard',
										id: 'qa.dashboard',
										element: (
											<Navigate to='/qa/dashboards/qa-manager' replace />
										),
									},
									{
										path: 'dashboards/agent',
										id: 'qa.dashboards.agent',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<NewAgentDashboard />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'dashboards/supervisor',
										id: 'qa.dashboards.supervisor',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<NewSupervisorDashboard />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'dashboards/qa-manager',
										id: 'qa.dashboards.qa-manager',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<NewQAManagerDashboard />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'dashboards/operation-manager',
										id: 'qa.dashboards.operation-manager',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<NewOperationManagerDashboard />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/evaluations',
										id: 'qa.agent.evaluations',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<AgentEvaluationsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/inbox',
										id: 'qa.agent.inbox',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaInboxPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/lms',
										id: 'qa.agent.lms',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<AgentLMSPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/analytics',
										id: 'qa.agent.analytics',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAAgentAnalyticsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/disputes',
										id: 'qa.agent.disputes',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<DisputesManagement />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agent/rankings',
										id: 'qa.agent.rankings',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<TeamRankingsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'supervisor/inbox',
										id: 'qa.supervisor.inbox',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaInboxPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/inbox',
										id: 'qa.qa-manager.inbox',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaInboxPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									// QA Manager routes
									{
										path: 'qa-manager/agents',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorSettingsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'supervisor/calls',
										id: 'qa.supervisor.calls',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorCallsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'supervisor/evaluations',
										id: 'qa.supervisor.evaluations',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorEvaluationsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'supervisor/analytics',
										id: 'qa.supervisor.analytics',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorAnalyticsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'supervisor/reports',
										id: 'qa.supervisor.reports',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorReportsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/supervisors',
										id: 'qa.qa-manager.supervisors',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerSupervisorsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/teams',
										id: 'qa.qa-manager.teams',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerTeamsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/campaigns',
										id: 'qa.qa-manager.campaigns',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerCampaignsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/agents',
										id: 'qa.qa-manager.agents',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerAgentsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/coaching',
										id: 'qa.qa-manager.coaching',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerCoachingPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/lms',
										id: 'qa.qa-manager.lms',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerLmsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/settings',
										id: 'qa.qa-manager.settings',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerSettingsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/calls',
										id: 'qa.qa-manager.calls',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerCallsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qa-manager/reports',
										id: 'qa.qa-manager.reports',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QAManagerReportsPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'operation-manager/inbox',
										id: 'qa.operation-manager.inbox',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaInboxPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'profiles/customer/:customerId',
										id: 'qa.profiles.customer',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<CustomerProfilePage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'auto-triggers',
										id: 'qa.auto-triggers',
										element: <Navigate to='/qa/qa-manager/triggers' replace />,
									},
									{
										path: 'reporting',
										id: 'qa.reporting',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<ReportingPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'evaluations',
										id: 'qa.evaluations',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaEvaluationsListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'evaluations/new',
										id: 'qa.evaluations.new',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaEvaluationsListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'evaluations/:evaluationId',
										id: 'qa.evaluations.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaManualEvaluationPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'evaluator-agents',
										id: 'qa.evaluator-agents',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaEvaluatorAgentsListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agents',
										id: 'qa.agents',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaAgentsListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'agents/:agentId',
										id: 'qa.agents.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaAgentDetailPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'disputes',
										id: 'qa.disputes',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaDisputesListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'disputes/:disputeId',
										id: 'qa.disputes.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaDisputeDetailPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'campaigns',
										id: 'qa.campaigns',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<CampaignsList />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'campaigns/:id',
										id: 'qa.campaigns.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<CampaignDetail />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'forms',
										id: 'qa.forms',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaFormsListPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'forms/error-types',
										id: 'qa.forms.error-types',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaErrorTypesPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'forms/:formId',
										id: 'qa.forms.detail',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<QaFormBuilderPage />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									// Phase 4: QA Manager Global Triggers Configuration
									{
										path: 'qamanager/admin/triggers',
										id: 'qa.qamanager.admin.triggers',
										element: <Navigate to='/qa/qa-manager/triggers' replace />,
									},
									// Phase 4: Operation Manager Supervisor Rankings Configuration
									{
										path: 'operationmanager/rankings',
										id: 'qa.operationmanager.rankings',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<SupervisorRankingsConfigPanel />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									// Phase 4: Disputes Management (used by Supervisor and QA Manager)
									{
										path: 'supervisor/disputes',
										id: 'qa.supervisor.disputes',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<DisputesManagement />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
									{
										path: 'qamanager/disputes',
										id: 'qa.qamanager.disputes',
										element: (
											<I18nNamespaceLoader>
												<Suspense fallback={<SuspenseFallback />}>
													<DisputesManagement />
												</Suspense>
											</I18nNamespaceLoader>
										),
									},
								],
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
										path: 'agent-behaviors',
										id: 'agent-behaviors',
										element: (
											<ModuleGuard
												module={ModuleEnum.SETTINGS}
												permission={PermissionEnum.MANAGE}
												superAdminOnly
											>
												<Suspense fallback={<SuspenseFallback />}>
													<AgentBehaviorsPage />
												</Suspense>
											</ModuleGuard>
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
									{
										path: 'elevenlabs-llms',
										id: 'elevenlabs-llms',
										element: (
											<ModuleGuard masterOnly superAdminOnly>
												<I18nNamespaceLoader>
													<Suspense fallback={<SuspenseFallback />}>
														<ElevenLabsLlmCatalogPage />
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
							{
								path: 'role-preview/agent-dashboard/evaluations',
								id: 'role-preview.agent-dashboard.evaluations',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentEvaluationsPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-dashboard/evaluations/:callId',
								id: 'role-preview.agent-dashboard.evaluations.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentEvaluationDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-dashboard/coaching',
								id: 'role-preview.agent-dashboard.coaching',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentCoachingPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-dashboard/coaching/:reportId',
								id: 'role-preview.agent-dashboard.coaching.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentCoachingDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-dashboard/lms',
								id: 'role-preview.agent-dashboard.lms',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentLmsPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-dashboard/lms/:contentId',
								id: 'role-preview.agent-dashboard.lms.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentLmsDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-analytics',
								id: 'role-preview.agent-analytics',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentAnalyticsPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-forms',
								id: 'role-preview.qa-forms',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoQaFormsListPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/new-qa-form',
								id: 'role-preview.new-qa-form',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoCreateQaTestPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-forms/:formId/edit',
								id: 'role-preview.qa-forms.edit',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoQaFormEditPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-campaigns',
								id: 'role-preview.qa-campaigns',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoCampaignsListPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/new-campaign',
								id: 'role-preview.new-campaign',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoNewCampaignWizardPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-campaigns/:campaignId',
								id: 'role-preview.qa-campaigns.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoCampaignDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-campaigns/:campaignId/result/:callId',
								id: 'role-preview.qa-campaigns.result.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoResultCallDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-campaigns/:campaignId/call/:callId',
								id: 'role-preview.qa-campaigns.call.detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<DemoCallDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/emotion-sentiment',
								id: 'role-preview.emotion-sentiment',
								element: (
									<I18nNamespaceLoader>
										<Suspense fallback={<SuspenseFallback />}>
											<EmotionSentimentDashboardPage />
										</Suspense>
									</I18nNamespaceLoader>
								),
							},
							{
								path: 'role-preview/emotion-display-showcase',
								id: 'role-preview.emotion-display-showcase',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<EmotionDisplayShowcase />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agents-roster',
								id: 'role-preview.agents-roster',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<AgentsRosterPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/agent-detail/:agentId',
								id: 'role-preview.agent-detail',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<RolePreviewAgentDetailPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/supervisor-analytics',
								id: 'role-preview.supervisor-analytics',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<SupervisorAnalyticsPage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/qa-manager-analytics',
								id: 'role-preview.qa-manager-analytics',
								element: <Suspense fallback={<SuspenseFallback />}></Suspense>,
							},
							{
								path: 'role-preview/:section',
								id: 'role-preview',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<RolePreviewPlaceholderPage />
									</Suspense>
								),
							},
						],
					},
				],
			},
		],
	},
]);

export default function AppRoutes() {
	return <RouterProvider router={router} />;
}
