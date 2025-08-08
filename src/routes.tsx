import { createBrowserRouter, RouterProvider } from "react-router";

// Route components
import Overview from "./routes/overview";
import AgentsRoute, { clientLoader as agentsLoader } from "./routes/agents";
import AgentPage from "./modules/agent/AgentPage";
import CampaignsRoute from "./routes/campaigns";
import ContactsRoute from "./routes/contacts";
import ConversationRoute from "./routes/conversations";
import DispositionsRoute from "./routes/dispositions";
import LoginPage from "./routes/login";
import LogoutPage, { clientLoader as logoutLoader } from "./routes/logout";
import PromptForm from "./routes/prompt_form";
import PromptGenerator from "./routes/prompt_generator";
import ToolsRoute from "./routes/tools";
import RouteProtecter, {
  clientLoader as routeProtecterLoader,
} from "./components/RouteProtecter/RouteProtecter";
import Layout from "./components/Layout/Layout";

const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/logout", element: <LogoutPage />, loader: logoutLoader },

  // Protected routes
  {
    element: <RouteProtecter />,
    loader: routeProtecterLoader,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Overview /> },
          { path: "agents", element: <AgentsRoute />, loader: agentsLoader },
          { path: "agent/:agent_id", element: <AgentPage /> },
          { path: "campaigns", element: <CampaignsRoute /> },
          { path: "contacts", element: <ContactsRoute /> },
          { path: "conversations", element: <ConversationRoute /> },
          { path: "dispositions", element: <DispositionsRoute /> },
          { path: "prompt-form", element: <PromptForm /> },
          { path: "prompt-generator", element: <PromptGenerator /> },
          { path: "tools", element: <ToolsRoute /> },
        ],
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
