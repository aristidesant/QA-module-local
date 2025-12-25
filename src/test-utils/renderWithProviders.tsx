import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all locale files for tests
import enAuth from '~/locales/en/auth.json';
import enAuthForcePasswordChange from '~/locales/en/auth.force-password-change.json';
import enCampaignManagement from '~/locales/en/campaign-management.json';
import enCampaignPredefinedParams from '~/locales/en/campaign-predefined-params.json';
import enCampaignContactList from '~/locales/en/campaign.contact-list.json';
import enCampaignDetail from '~/locales/en/campaign.detail.json';
import enCampaignView from '~/locales/en/campaign.view.json';
import enCampaigns from '~/locales/en/campaigns.json';
import enClientConfigs from '~/locales/en/client-configs.json';
import enClients from '~/locales/en/clients.json';
import enCommon from '~/locales/en/common.json';
import enConfigurations from '~/locales/en/configurations.json';
import enConversations from '~/locales/en/conversations.json';
import enDoNotCall from '~/locales/en/do-not-call.json';
import enKnowledgeBases from '~/locales/en/knowledge-bases.json';
import enOutcomes from '~/locales/en/outcomes.json';
import enOverview from '~/locales/en/overview.json';
import enProfile from '~/locales/en/profile.json';
import enPrompter from '~/locales/en/prompter.json';
import enRegionalSettingsParams from '~/locales/en/regional-settings-params.json';
import enRoles from '~/locales/en/roles.json';
import enSchedulerPredefinedParams from '~/locales/en/scheduler-predefined-params.json';
import enTools from '~/locales/en/tools.json';
import enUsers from '~/locales/en/users.json';

import esAuth from '~/locales/es/auth.json';
import esAuthForcePasswordChange from '~/locales/es/auth.force-password-change.json';
import esCampaignManagement from '~/locales/es/campaign-management.json';
import esCampaignPredefinedParams from '~/locales/es/campaign-predefined-params.json';
import esCampaignContactList from '~/locales/es/campaign.contact-list.json';
import esCampaignDetail from '~/locales/es/campaign.detail.json';
import esCampaignView from '~/locales/es/campaign.view.json';
import esCampaigns from '~/locales/es/campaigns.json';
import esClientConfigs from '~/locales/es/client-configs.json';
import esClients from '~/locales/es/clients.json';
import esCommon from '~/locales/es/common.json';
import esConfigurations from '~/locales/es/configurations.json';
import esConversations from '~/locales/es/conversations.json';
import esDoNotCall from '~/locales/es/do-not-call.json';
import esKnowledgeBases from '~/locales/es/knowledge-bases.json';
import esOutcomes from '~/locales/es/outcomes.json';
import esOverview from '~/locales/es/overview.json';
import esProfile from '~/locales/es/profile.json';
import esPrompter from '~/locales/es/prompter.json';
import esRegionalSettingsParams from '~/locales/es/regional-settings-params.json';
import esRoles from '~/locales/es/roles.json';
import esSchedulerPredefinedParams from '~/locales/es/scheduler-predefined-params.json';
import esTools from '~/locales/es/tools.json';
import esUsers from '~/locales/es/users.json';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

// Initialize i18n for tests
export const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
	lng: 'en',
	fallbackLng: 'en',
	defaultNS: 'common',
	ns: [
		'auth',
		'auth.force-password-change',
		'campaign-management',
		'campaign-predefined-params',
		'campaign.contact-list',
		'campaign.detail',
		'campaign.view',
		'campaigns',
		'client-configs',
		'clients',
		'common',
		'configurations',
		'conversations',
		'do-not-call',
		'knowledge-bases',
		'outcomes',
		'overview',
		'profile',
		'prompter',
		'regional-settings-params',
		'roles',
		'scheduler-predefined-params',
		'tools',
		'users',
	],
	resources: {
		en: {
			auth: enAuth,
			'auth.force-password-change': enAuthForcePasswordChange,
			'campaign-management': enCampaignManagement,
			'campaign-predefined-params': enCampaignPredefinedParams,
			'campaign.contact-list': enCampaignContactList,
			'campaign.detail': enCampaignDetail,
			'campaign.view': enCampaignView,
			campaigns: enCampaigns,
			'client-configs': enClientConfigs,
			clients: enClients,
			common: enCommon,
			configurations: enConfigurations,
			conversations: enConversations,
			'do-not-call': enDoNotCall,
			'knowledge-bases': enKnowledgeBases,
			outcomes: enOutcomes,
			overview: enOverview,
			profile: enProfile,
			prompter: enPrompter,
			'regional-settings-params': enRegionalSettingsParams,
			roles: enRoles,
			'scheduler-predefined-params': enSchedulerPredefinedParams,
			tools: enTools,
			users: enUsers,
		},
		es: {
			auth: esAuth,
			'auth.force-password-change': esAuthForcePasswordChange,
			'campaign-management': esCampaignManagement,
			'campaign-predefined-params': esCampaignPredefinedParams,
			'campaign.contact-list': esCampaignContactList,
			'campaign.detail': esCampaignDetail,
			'campaign.view': esCampaignView,
			campaigns: esCampaigns,
			'client-configs': esClientConfigs,
			clients: esClients,
			common: esCommon,
			configurations: esConfigurations,
			conversations: esConversations,
			'do-not-call': esDoNotCall,
			'knowledge-bases': esKnowledgeBases,
			outcomes: esOutcomes,
			overview: esOverview,
			profile: esProfile,
			prompter: esPrompter,
			'regional-settings-params': esRegionalSettingsParams,
			roles: esRoles,
			'scheduler-predefined-params': esSchedulerPredefinedParams,
			tools: esTools,
			users: esUsers,
		},
	},
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
});

// Reusable wrapper component for tests that use renderHook
export const TestProviders = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={queryClient}>
		<I18nextProvider i18n={testI18n}>
			<MantineProvider>{children}</MantineProvider>
		</I18nextProvider>
	</QueryClientProvider>
);

export const renderWithProviders = (children: ReactNode) => {
	return render(children, { wrapper: TestProviders });
};

export default renderWithProviders;
