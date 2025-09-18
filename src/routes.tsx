import { createBrowserRouter, RouterProvider } from 'react-router';

// Route components
import AgentList from './modules/agents/AgentList';
import AgentPage from './modules/agent/AgentPage';
import RouteProtecter, {
	clientLoader as routeProtecterLoader,
} from './components/RouteProtecter/RouteProtecter';
import Layout from './components/Layout/Layout';
import CampaignsPage from './modules/campaigns/CampaignsPage/CampaignsPage';
import ToolsPage from './modules/tools/ToolsPage';
import { PrompterPage } from './modules/prompter/PrompterPage';
import { DispositionPage } from './modules/dispositions';
import ConversationPage from './modules/conversations/ConversationsPage/ConversationPage';
import ContactsPage from './modules/contacts/ContactsPage';
import WelcomeCard from './modules/overview/WelcomeCard';
import { LoginForm } from './modules/auth/LoginForm';
import KnowledgeBasePage from './modules/knowledge-bases/KnowledgeBasePage';

const router = createBrowserRouter([
	// Public routes
	{ path: '/login', element: <LoginForm /> },

	// Protected routes
	{
		element: <RouteProtecter />,
		loader: routeProtecterLoader,
		children: [
			{
				element: <Layout />,
				children: [
					{ index: true, element: <WelcomeCard /> },
					{ path: 'agents', element: <AgentList /> },
					{ path: 'agent/:agent_id', element: <AgentPage /> },
					{ path: 'campaigns', element: <CampaignsPage /> },
					{ path: 'contacts', element: <ContactsPage /> },
					{ path: 'conversations', element: <ConversationPage /> },
					{ path: 'outcomes', element: <DispositionPage /> },
					{ path: 'prompter', element: <PrompterPage /> },
					{ path: 'tools', element: <ToolsPage /> },
					{ path: 'knowledge-bases', element: <KnowledgeBasePage /> },
				],
			},
		],
	},
]);

export default function AppRoutes() {
	return <RouterProvider router={router} />;
}
