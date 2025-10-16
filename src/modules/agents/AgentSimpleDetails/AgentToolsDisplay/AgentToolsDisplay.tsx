import { Badge, Loader, Text, Tooltip } from '@mantine/core';
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
					{assignedTools!.map((assignedTool) => {
						const categoryIcon = assignedTool.tool.category?.icon;
						const toolDescription = assignedTool.tool.description;

						return (
							<Tooltip
								key={assignedTool.tool.identifier}
								label={toolDescription || 'No description available'}
								disabled={!toolDescription}
								position='top'
								withArrow
								multiline
								w={200}
							>
								<div className={styles.toolItem}>
									{categoryIcon && (
										<img
											src={categoryIcon}
											alt={assignedTool.tool.category.name}
											className={styles.toolIcon}
										/>
									)}
									<div className={styles.toolInfo}>
										<Text className={styles.toolName}>
											{assignedTool.tool.name}
										</Text>
									</div>
									<Badge variant='light' color='teal' size='sm'>
										Active
									</Badge>
								</div>
							</Tooltip>
						);
					})}
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
