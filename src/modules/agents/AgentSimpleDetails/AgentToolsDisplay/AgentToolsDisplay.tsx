import { Badge, Loader, Text } from '@mantine/core';
import { IconPlugConnected } from '@tabler/icons-react';
import { useAssignedTools } from '~/queries/toolQueries';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './AgentToolsDisplay.module.css';

type AgentToolsDisplayProps = {
	agentId?: string;
};

export const AgentToolsDisplay: React.FC<AgentToolsDisplayProps> = ({
	agentId,
}) => {
	const { data: assignedTools, isLoading } = useAssignedTools(agentId);
	const totalTools = assignedTools?.length ?? 0;

	return (
		<RightSectionCard
			title='Active Tools'
			description='Connected integrations available to this agent'
			icon={IconPlugConnected}
			rightSection={
				<Badge
					variant='light'
					size='sm'
					color={totalTools > 0 ? 'teal' : 'gray'}
				>
					{totalTools} active
				</Badge>
			}
		>
			{isLoading ? (
				<div className={styles.loadingState}>
					<Loader size='sm' />
					<Text size='xs' c='dimmed'>
						Loading tools…
					</Text>
				</div>
			) : totalTools > 0 ? (
				<div className={styles.toolsList}>
					{assignedTools!.map((assignedTool) => (
						<div key={assignedTool.tool.identifier} className={styles.toolItem}>
							<div className={styles.toolInfo}>
								<Text className={styles.toolName}>
									{assignedTool.tool.name}
								</Text>
								{assignedTool.tool.description && (
									<Text size='xs' c='dimmed'>
										{assignedTool.tool.description}
									</Text>
								)}
							</div>
							<Badge variant='light' color='teal' size='sm'>
								Active
							</Badge>
						</div>
					))}
				</div>
			) : (
				<Text className={styles.emptyState}>
					No tools assigned yet. Connect integrations to unlock automations.
				</Text>
			)}
		</RightSectionCard>
	);
};

export default AgentToolsDisplay;
