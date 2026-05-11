import BaseTable from '~/components/BaseTable/BaseTable';
import type { AgentBehavior } from '~/models/AgentBehavior';
import useAgentBehaviorsColumns from './useAgentBehaviorsColumns';

interface AgentBehaviorsListProps {
	data: AgentBehavior[];
	isLoading?: boolean;
	onRowClick?: (param: AgentBehavior) => void;
	onDelete?: (param: AgentBehavior) => void;
	onReplace?: (param: AgentBehavior) => void;
}

const AgentBehaviorsList: React.FC<AgentBehaviorsListProps> = ({
	data,
	isLoading,
	onRowClick,
	onDelete,
	onReplace,
}) => {
	const columns = useAgentBehaviorsColumns({ onDelete, onReplace });

	return (
		<BaseTable
			data={data}
			columns={columns}
			isLoading={isLoading}
			onRowClick={onRowClick}
		/>
	);
};

export default AgentBehaviorsList;
