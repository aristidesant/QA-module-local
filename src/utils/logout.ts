// Centralized logout utility: clears local auth data and redirects to login
import { useSessionStore } from '~/stores/sessionStore';
import { usePasswordResetStore } from '~/stores/passwordResetStore';
import { useImpersonationLoadingStore } from '~/stores/impersonationLoadingStore';
import { useAgentStore } from '~/stores/agentStore';
import { useClientStore } from '~/stores/clientStore';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useCampaignContactListStore } from '~/stores/campaignContactListStore';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import { useContactEditStore } from '~/stores/contactEditStore';
import { useKnowledgeBaseModalStore } from '~/stores/knowledgeBaseModalStore';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';
import { useOverviewStore } from '~/stores/overviewStore';
import { useSchedulerCalculatorStore } from '~/stores/schedulerCalculatorStore';
import useToolsStore from '~/stores/toolsStore';
import { useConversationStore } from '~/stores/useConversationStore';

type LogoutReason = 'manual' | 'expired';

type LogoutOptions = {
	reason?: LogoutReason;
};

let logoutInProgress = false;

function resetAllStores() {
	try {
		const session = useSessionStore.getState();
		session.setUser(null);
		session.setTargetClient(null);
		session.setToken(null);
	} catch {}

	try {
		usePasswordResetStore.getState().clearPendingCredentials();
	} catch {}

	try {
		useImpersonationLoadingStore.getState().setLoading(false, 'Processing...');
	} catch {}

	try {
		const agent = useAgentStore.getState();
		agent.setSelectedAgent(null);
		agent.setSelectedElement(null);
	} catch {}

	try {
		const client = useClientStore.getState();
		client.setSelectedClient(null);
		client.setSearchQuery('');
	} catch {}

	try {
		useCampaignWizardStore.getState().reset();
	} catch {}
	try {
		useCampaignContactListStore.getState().setRightComponent(null);
	} catch {}
	try {
		useCampaignsStore.getState().resetView();
	} catch {}
	try {
		useClientConfigsStore.getState().resetFilters();
	} catch {}
	try {
		useContactEditStore.getState().clear();
	} catch {}
	try {
		useKnowledgeBaseModalStore.getState().reset();
	} catch {}
	try {
		useKnowledgeBaseSelectionStore.getState().reset();
	} catch {}
	try {
		useOverviewStore.getState().setCallStats({
			totalCalls: 424456,
			effectiveContact: 23.1,
			noEffectiveContact: 52.5,
			noContact: 24.4,
		});
	} catch {}
	try {
		const scheduler = useSchedulerCalculatorStore.getState();
		scheduler.setMode('resources');
		scheduler.resetSummary();
	} catch {}
	try {
		useToolsStore.getState().setToolsCategory(null);
	} catch {}
	try {
		useConversationStore.getState().clearSelection();
	} catch {}
}

/**
 * Clears auth-related client state and redirects to the login page.
 * Safe no-op on server.
 */
export function logout(redirectTo: string = '/login', options?: LogoutOptions) {
	console.log(
		'Logging out user, clearing session and redirecting to login page...'
	);
	if (typeof window === 'undefined') return;
	if (logoutInProgress) return;
	logoutInProgress = true;

	const reason = options?.reason ?? 'manual';

	try {
		// Ensure tokens are removed even if clear() fails.
		window.sessionStorage.removeItem('accessToken');
		window.sessionStorage.removeItem('refreshToken');

		// Clear all sessionStorage for a clean slate between users.
		window.sessionStorage.clear();
	} catch {
		// ignore storage errors
	}

	try {
		resetAllStores();
	} catch {
		// ignore store errors
	}

	const url = new URL(redirectTo, window.location.origin);
	if (reason === 'expired') url.searchParams.set('reason', 'expired');
	if (reason === 'manual') url.searchParams.delete('reason');

	// Full reload ensures React Query + all in-memory state is wiped.
	window.location.replace(url.toString());
}

export default logout;
