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
const Layout = React.lazy(() => import('./components/Layout'));
const CampaignsPage = React.lazy(
	() => import('./modules/campaigns/CampaignsPage/CampaignsPage')
);
const CampaignPage = React.lazy(
	() => import('./modules/campaigns/CampaignPage/CampaignPage')
);
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
		import('./modules/campaigns/CampaignCategoriesPage/CampaignCategoriesPage')
);
const CampaignObjectivesPage = React.lazy(
	() =>
		import('./modules/campaigns/CampaignObjectivesPage/CampaignObjectivesPage')
);
const CampaignSchemasPage = React.lazy(
	() => import('./modules/campaigns/CampaignSchemasPage/CampaignSchemasPage')
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
	() => import('./modules/dispositions/DispositionPage/DispositionPage')
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
					<Suspense fallback={<div>Preparing security flow...</div>}>
						<ForcePasswordChangePage />
					</Suspense>
				),
			},
			{
				element: (
					<Suspense fallback={<div>Loading app...</div>}>
						<Layout />
					</Suspense>
				),
				children: [
					{
						index: true,
						element: (
							<Suspense fallback={<div>Loading...</div>}>
								<WelcomeCard />
							</Suspense>
						),
					},
					{
						path: 'agents',
						element: (
							<Suspense fallback={<div>Loading agents...</div>}>
								<AgentList />
							</Suspense>
						),
					},
					{
						path: 'agent/:agent_id',
						element: (
							<Suspense fallback={<div>Loading agent...</div>}>
								<AgentPage />
							</Suspense>
						),
					},
					{
						path: 'campaigns',
						element: (
							<Suspense fallback={<div>Loading campaigns...</div>}>
								<CampaignsPage />
							</Suspense>
						),
					},
					{
						path: 'campaign/:campaignId',
						element: (
							<Suspense fallback={<div>Loading campaign...</div>}>
								<CampaignPage />
							</Suspense>
						),
					},
					{
						path: 'campaign/47/contact-list/:contactGroupId',
						element: (
							<Suspense fallback={<div>Loading contact list...</div>}>
								<CampaignContactListPage />
							</Suspense>
						),
					},
					{
						path: 'campaigns/metrics/:campaignId',
						element: (
							<Suspense fallback={<div>Loading campaigns...</div>}>
								<CampaignLiveMetricPage />
							</Suspense>
						),
					},
					{
						path: 'contacts',
						element: (
							<Suspense fallback={<div>Loading contacts...</div>}>
								<ContactsPage />
							</Suspense>
						),
					},
					{
						path: 'users',
						element: (
							<Suspense fallback={<div>Loading users...</div>}>
								<UsersPage />
							</Suspense>
						),
					},
					{
						path: 'conversations',
						element: (
							<Suspense fallback={<div>Loading conversations...</div>}>
								<ConversationPage />
							</Suspense>
						),
					},
					{
						path: 'outcomes',
						element: (
							<Suspense fallback={<div>Loading outcomes...</div>}>
								<DispositionPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-categories',
						element: (
							<Suspense fallback={<div>Loading campaign categories...</div>}>
								<CampaignCategoriesPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-objectives',
						element: (
							<Suspense fallback={<div>Loading campaign objectives...</div>}>
								<CampaignObjectivesPage />
							</Suspense>
						),
					},
					{
						path: 'campaign-schemas',
						element: (
							<Suspense fallback={<div>Loading campaign schemas...</div>}>
								<CampaignSchemasPage />
							</Suspense>
						),
					},
					{
						path: 'configurations',
						element: (
							<Suspense fallback={<div>Loading configurations...</div>}>
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
									<Suspense fallback={<div>Loading client configs...</div>}>
										<ClientConfigsPage />
									</Suspense>
								),
							},
							{
								path: 'campaign-predefined-params',
								element: (
									<Suspense
										fallback={<div>Loading campaign predefined params...</div>}
									>
										<CampaignPredefinedParamsPage />
									</Suspense>
								),
							},
							{
								path: 'regional-settings-params',
								element: (
									<Suspense
										fallback={<div>Loading regional settings params...</div>}
									>
										<RegionalSettingsParamsPage />
									</Suspense>
								),
							},
						],
					},
					{
						path: 'prompter',
						element: (
							<Suspense fallback={<div>Loading prompter...</div>}>
								<PrompterPage />
							</Suspense>
						),
					},
					{
						path: 'tools',
						element: (
							<Suspense fallback={<div>Loading tools...</div>}>
								<ToolsPage />
							</Suspense>
						),
					},
					{
						path: 'knowledge-bases',
						element: (
							<Suspense fallback={<div>Loading knowledge bases...</div>}>
								<KnowledgeBasePage />
							</Suspense>
						),
					},
					{
						path: 'do-not-call',
						element: (
							<Suspense fallback={<div>Loading Do Not Call...</div>}>
								<DoNotCallPage />
							</Suspense>
						),
					},

					{
						path: 'profile',
						element: (
							<Suspense fallback={<div>Loading profile...</div>}>
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
