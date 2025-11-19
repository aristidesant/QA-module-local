import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import React, { Suspense } from 'react';

// Route components (lazy-loaded where appropriate to split bundles)
const AgentList = React.lazy(
	() => import('./modules/agents/AgentList/AgentList')
);
const AgentPage = React.lazy(
	() => import('./modules/agent/AgentPage/AgentPage')
);
import RouteProtecter, {
	clientLoader as routeProtecterLoader,
} from './components/RouteProtecter/RouteProtecter';
import SuspenseFallback from './components/SuspenseFallback';
const Layout = React.lazy(() => import('./components/Layout'));

const CampaignContactListPage = React.lazy(
	() =>
		import(
			'./modules/campaigns/CampaignContactListPage/CampaignContactListPage'
		)
);
const ForcePasswordChangePage = React.lazy(
	() => import('./modules/auth/ForcePasswordChangePage/ForcePasswordChangePage')
);
const CampaignCategoriesPage = React.lazy(
	() =>
		import(
			'./modules/campaigns/CampaignManagementPage/Categories/CampaignCategoriesPage'
		)
);
const CampaignObjectivesPage = React.lazy(
	() =>
		import(
			'./modules/campaigns/CampaignManagementPage/Objectives/CampaignObjectivesPage'
		)
);
const CampaignSchemasPage = React.lazy(
	() =>
		import(
			'./modules/campaigns/CampaignManagementPage/Schemas/CampaignSchemasPage'
		)
);
const ClientConfigsPage = React.lazy(
	() => import('./modules/configurations/client-configs/ClientConfigsPage')
);
const ToolsPage = React.lazy(
	() => import('./modules/tools/ToolsPage/ToolsPage')
);
const UsersPage = React.lazy(
	() => import('./modules/users/UsersPage/UsersPage')
);
const PrompterPage = React.lazy(() =>
	import('./modules/prompter/PrompterPage').then((m) => ({
		default: m.PrompterPage,
	}))
);
const DispositionPage = React.lazy(
	() =>
		import(
			'./modules/campaigns/CampaignManagementPage/Outcomes/DispositionPage'
		)
);
const ConversationPage = React.lazy(
	() => import('./modules/conversations/ConversationsPage/ConversationPage')
);
const ContactsPage = React.lazy(
	() => import('./modules/contacts/ContactsPage/ContactsPage')
);
const WelcomeCard = React.lazy(
	() => import('./modules/overview/WelcomeCard/WelcomeCard')
);
import { LoginForm } from './modules/auth/LoginForm';
import CampaignLiveMetricPage from './modules/campaigns/CampaignLiveMetricPage/CampaignLiveMetricPage';
const KnowledgeBasePage = React.lazy(
	() => import('./modules/knowledge-bases/KnowledgeBasePage/KnowledgeBasePage')
);
const ProfilePage = React.lazy(() => import('./modules/profile/ProfilePage'));
const DoNotCallPage = React.lazy(
	() => import('./modules/do-not-call/DoNotCallPage/DoNotCallPage')
);
const CampaignPredefinedParamsPage = React.lazy(
	() =>
		import(
			'./modules/configurations/CampaignPredefinedParamsPage/CampaignPredefinedParamsPage'
		)
);
const RegionalSettingsParamsPage = React.lazy(
	() =>
		import(
			'./modules/configurations/RegionalSettingsParamsPage/RegionalSettingsParamsPage'
		)
);
const ConfigurationsPage = React.lazy(
	() => import('./modules/configurations/ConfigurationsPage')
);
const CampaignManagementPage = React.lazy(
	() => import('./modules/campaigns/CampaignManagementPage')
);
const CampaignPage = React.lazy(
	() => import('./modules/campaigns/CampaignPage/CampaignPage')
);
const CampaignViewPage = React.lazy(
	() => import('./modules/campaigns/CampaignViewPage/CampaignViewPage')
);

const CampaignsPage = React.lazy(
	() => import('./modules/campaigns/CampaignsPage/CampaignsPage')
);

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
				element: (
					<Suspense
						fallback={<SuspenseFallback message='Preparing security flow...' />}
					>
						<ForcePasswordChangePage />
					</Suspense>
				),
			},
			{
				element: (
					<Suspense fallback={<SuspenseFallback message='Loading app...' />}>
						<Layout />
					</Suspense>
				),
				children: [
					{
						index: true,
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading dashboard...' />}
							>
								<WelcomeCard />
							</Suspense>
						),
					},
					{
						path: 'agents',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading agents...' />}
							>
								<AgentList />
							</Suspense>
						),
					},
					{
						path: 'agent/:agent_id',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading agent...' />}
							>
								<AgentPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-management',
						element: (
							<Suspense fallback={<div>Loading campaign management...</div>}>
								<CampaignManagementPage />
							</Suspense>
						),
					},
					{
						path: 'campaigns',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading campaigns...' />}
							>
								<CampaignsPage />
							</Suspense>
						),
					},
					{
						path: 'campaign/:campaignId',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading campaign...' />}
							>
								<CampaignPage />
							</Suspense>
						),
					},
					{
						path: 'campaign/view/:campaignId',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading campaign view...' />
								}
							>
								<CampaignViewPage />
							</Suspense>
						),
					},
					{
						path: 'campaign/:campaignId/contact-list/:contactGroupId',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading contact list...' />
								}
							>
								<CampaignContactListPage />
							</Suspense>
						),
					},
					{
						path: 'campaigns/metrics/:campaignId',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading campaign metrics...' />
								}
							>
								<CampaignLiveMetricPage />
							</Suspense>
						),
					},
					{
						path: 'contacts',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading contacts...' />}
							>
								<ContactsPage />
							</Suspense>
						),
					},
					{
						path: 'users',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading users...' />}
							>
								<UsersPage />
							</Suspense>
						),
					},
					{
						path: 'conversations',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading conversations...' />
								}
							>
								<ConversationPage />
							</Suspense>
						),
					},
					{
						path: 'outcomes',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading outcomes...' />}
							>
								<DispositionPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-categories',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading campaign categories...' />
								}
							>
								<CampaignCategoriesPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-objectives',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading campaign objectives...' />
								}
							>
								<CampaignObjectivesPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-schemas',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading campaign schemas...' />
								}
							>
								<CampaignSchemasPage />
							</Suspense>
						),
					},
					{
						path: 'configurations',
						element: (
							<Suspense
								fallback={
									<SuspenseFallback message='Loading configurations...' />
								}
							>
								<ConfigurationsPage />
							</Suspense>
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
								element: (
									<Suspense
										fallback={
											<SuspenseFallback message='Loading client configs...' />
										}
									>
										<ClientConfigsPage />
									</Suspense>
								),
							},
							{
								path: 'campaign-predefined-params',
								element: (
									<Suspense
										fallback={
											<SuspenseFallback message='Loading campaign predefined params...' />
										}
									>
										<CampaignPredefinedParamsPage />
									</Suspense>
								),
							},
							{
								path: 'regional-settings-params',
								element: (
									<Suspense
										fallback={
											<SuspenseFallback message='Loading regional settings params...' />
										}
									>
										<RegionalSettingsParamsPage />
									</Suspense>
								),
							},
							{
								path: 'do-not-call',
								element: (
									<Suspense
										fallback={
											<SuspenseFallback message='Loading Do Not Call...' />
										}
									>
										<DoNotCallPage />
									</Suspense>
								),
							},
							{
								path: 'knowledge-bases',
								element: (
									<Suspense
										fallback={
											<SuspenseFallback message='Loading knowledge bases...' />
										}
									>
										<KnowledgeBasePage />
									</Suspense>
								),
							},
						],
					},
					{
						path: 'prompter',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading prompter...' />}
							>
								<PrompterPage />
							</Suspense>
						),
					},
					{
						path: 'tools',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading tools...' />}
							>
								<ToolsPage />
							</Suspense>
						),
					},
					{
						path: 'profile',
						element: (
							<Suspense
								fallback={<SuspenseFallback message='Loading profile...' />}
							>
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
