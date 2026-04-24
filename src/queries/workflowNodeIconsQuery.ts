import { useQuery } from '@tanstack/react-query';
import { getClientConfigByName } from '~/api/clientConfigApi';
import {
	WORKFLOW_ICON_REGISTRY,
	DEFAULT_NODE_ICON_KEY,
} from '~/modules/campaigns/CampaignsForm/WorkflowSection/utils/workflowIconRegistry';

const CONFIG_NAME = 'workflow_node_icons';

/**
 * Fetches the list of allowed workflow-node icon keys from client config.
 *
 * The config value is expected to be a JSON-stringified array of icon keys,
 * e.g. `["headset","brain","shield","phone_call"]`.
 *
 * When the config doesn't exist or is empty the hook returns every key
 * present in WORKFLOW_ICON_REGISTRY so the feature is never blocked.
 */
export const useWorkflowNodeIcons = () => {
	return useQuery<string[]>({
		queryKey: ['client-config', CONFIG_NAME],
		queryFn: async () => {
			try {
				const config = await getClientConfigByName(CONFIG_NAME);
				const parsed: unknown = JSON.parse(config.value);
				if (Array.isArray(parsed)) {
					// Only keep keys that actually map to a known icon
					const valid = (parsed as string[]).filter(
						(key) => typeof key === 'string' && key in WORKFLOW_ICON_REGISTRY
					);
					return valid.length > 0 ? valid : Object.keys(WORKFLOW_ICON_REGISTRY);
				}
			} catch {
				// Config missing or not JSON — fall back to full registry
			}
			return Object.keys(WORKFLOW_ICON_REGISTRY);
		},
		// Do not cache: the config can be added/deleted at any time and the
		// UI must reflect the current state on every mount without a hard reload.
		staleTime: 0,
		gcTime: 0,
		retry: false,
	});
};

export { DEFAULT_NODE_ICON_KEY };
