import { createBrowserRouter, RouterProvider } from 'react-router';
import React, { Suspense } from 'react';

// Route components (lazy-loaded where appropriate to split bundles)
const AgentList = React.lazy(() => import('./modules/agents/AgentList'));
const AgentPage = React.lazy(() => import('./modules/agent/AgentPage'));
import RouteProtecter, {
	clientLoader as routeProtecterLoader,
} from './components/RouteProtecter/RouteProtecter';
const Layout = React.lazy(() => import('./components/Layout/Layout'));
const CampaignsPage = React.lazy(
	() => import('./modules/campaigns/CampaignsPage/CampaignsPage')
);
const CampaignCategoriesPage = React.lazy(
	() => import('./modules/campaigns/CampaignCategoriesPage')
);
const CampaignObjectivesPage = React.lazy(
	() => import('./modules/campaigns/CampaignObjectivesPage')
);
const ToolsPage = React.lazy(() => import('./modules/tools/ToolsPage'));
const PrompterPage = React.lazy(() =>
	import('./modules/prompter/PrompterPage').then((m) => ({
		default: m.PrompterPage,
	}))
);
const DispositionPage = React.lazy(() =>
	import('./modules/dispositions').then((m) => ({ default: m.DispositionPage }))
);
const ConversationPage = React.lazy(
	() => import('./modules/conversations/ConversationsPage/ConversationPage')
);
const ContactsPage = React.lazy(
	() => import('./modules/contacts/ContactsPage')
);
const WelcomeCard = React.lazy(() => import('./modules/overview/WelcomeCard'));
import { LoginForm } from './modules/auth/LoginForm';
const KnowledgeBasePage = React.lazy(
	() => import('./modules/knowledge-bases/KnowledgeBasePage')
);
const ProfilePage = React.lazy(() => import('./modules/profile'));

const router = createBrowserRouter([
	// Public routes
	{ path: '/login', element: <LoginForm /> },

	// Protected routes
	{
		element: <RouteProtecter />,
		loader: routeProtecterLoader,
		children: [
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
						path: 'contacts',
						element: (
							<Suspense fallback={<div>Loading contacts...</div>}>
								<ContactsPage />
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
