import { useAgentBehaviors } from '~/queries/useAgentBehaviors';
export type { CampaignPredefinedParam } from '~/models/CampaignPredefinedParam';

/**
 * Note: The backend concept of 'Campaign Predefined Params' has been refactored
 * into the 'Agent Behavior' module.
 * This hook acts as a bridge for legacy wizard components to consume
 * the new relational AgentBehavior data while maintaining their expected interface.
 */
const useCampaignsPredefinedParams = () => {
	const { data } = useAgentBehaviors();

	// data is an AgentBehaviorsResponse object, we need to return the data array
	return data?.data || [];
};

export default useCampaignsPredefinedParams;
