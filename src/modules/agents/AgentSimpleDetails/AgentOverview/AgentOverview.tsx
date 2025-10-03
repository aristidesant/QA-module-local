import { Badge } from '@mantine/core';
import AgentProfile from '../AgentProfile';
import RightSectionCard from '~/components/RightSectionCard';
import type AgentListObject from '~/models/AgentListObject';

type AgentOverviewProps = {
	agent: AgentListObject;
};

const statusColorMap: Record<string, string> = {
	ACTIVE: 'teal',
	PAUSED: 'yellow',
	INACTIVE: 'gray',
	DRAFT: 'gray',
	ARCHIVED: 'gray',
};

export const AgentOverview: React.FC<AgentOverviewProps> = ({ agent }) => {
	const status = agent.status ?? 'UNKNOWN';
	const statusBadgeColor = statusColorMap[status] ?? 'gray';
	const statusLabel = status.replace(/_/g, ' ').toLowerCase();

	return (
		<RightSectionCard
			title='Agent Overview'
			rightSection={
				<Badge variant='light' size='sm' color={statusBadgeColor}>
					{statusLabel}
				</Badge>
			}
		>
			<AgentProfile agent={agent} size='md' />
		</RightSectionCard>
	);
};

export default AgentOverview;
