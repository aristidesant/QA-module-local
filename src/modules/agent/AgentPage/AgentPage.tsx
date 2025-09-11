import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import AgentDetails from '~/modules/agent/AgentDetails';
import { useGetAgent } from '~/queries/agentQueries';
import { useAgentStore } from '~/stores/agentStore';

const AgentPage: React.FC = () => {
	const { agent_id } = useParams();
	const setSelectedAgent = useAgentStore((state) => state.setSelectedAgent);

	if (!agent_id) {
		return <div>Agent id is missing.</div>;
	}

	const {
		data: agent,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetAgent(agent_id);

	useEffect(() => {
		setSelectedAgent(agent || null);
	}, [agent]);

	if (isLoading) {
		return <div>Loading agent…</div>;
	}

	if (isError || !agent) {
		const message = (error as any)?.message || 'Agent not found';
		return <div>{message}</div>;
	}

	return <AgentDetails agent={agent} onAgentUpdated={() => refetch()} />;
};

export default AgentPage;
