import BaseTable from '~/components/BaseTable/BaseTable';
import type { AgentBehavior } from '~/models/AgentBehavior';
import useAgentBehaviorsColumns from './useAgentBehaviorsColumns';

interface AgentBehaviorsListProps {
	data: AgentBehavior[];
	isLoading?: boolean;
	onRowClick?: (param: AgentBehavior) => void;
	onClone?: (param: AgentBehavior) => void;
	onDelete?: (param: AgentBehavior) => void;
	onReplace?: (param: AgentBehavior) => void;
	onReplaceWithBackup?: (param: AgentBehavior) => void;
}

const AgentBehaviorsList: React.FC<AgentBehaviorsListProps> = ({
	data,
	isLoading,
	onRowClick,
	onClone,
	onDelete,
	onReplace,
	onReplaceWithBackup,
}) => {
	const columns = useAgentBehaviorsColumns({
		allBehaviors: data,
		onClone,
		onDelete,
		onReplace,
		onReplaceWithBackup,
	});

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
