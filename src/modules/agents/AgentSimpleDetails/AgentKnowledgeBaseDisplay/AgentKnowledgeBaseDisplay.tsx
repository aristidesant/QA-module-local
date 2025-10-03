import { Badge, Loader, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import { useGetAgentKnowledgeBases } from '~/queries/agentKnowledgeBaseQueries';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './AgentKnowledgeBaseDisplay.module.css';

type AgentKnowledgeBaseDisplayProps = {
	agentId?: string;
};

export const AgentKnowledgeBaseDisplay: React.FC<
	AgentKnowledgeBaseDisplayProps
> = ({ agentId }) => {
	const {
		data: knowledgeBases,
		isLoading,
		error,
	} = useGetAgentKnowledgeBases(agentId || '');

	const count = knowledgeBases?.length ?? 0;

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'active':
				return 'teal';
			case 'pending':
				return 'yellow';
			case 'failed':
				return 'red';
			default:
				return 'gray';
		}
	};

	return (
		<RightSectionCard
			title='Knowledge Bases'
			description='Documents and datasets the agent can reference'
			icon={IconBook}
			rightSection={
				<Badge variant='light' size='sm' color={count > 0 ? 'teal' : 'gray'}>
					{count} linked
				</Badge>
			}
		>
			{isLoading ? (
				<div className={styles.loadingState}>
					<Loader size='sm' />
					<Text size='xs' c='dimmed'>
						Loading knowledge bases…
					</Text>
				</div>
			) : error ? (
				<Text className={styles.errorState}>
					Unable to load knowledge bases. Please retry later.
				</Text>
			) : count > 0 ? (
				<ul className={styles.kbList}>
					{knowledgeBases!.map((item) => (
						<li key={item.id} className={styles.kbItem}>
							<div className={styles.kbInfo}>
								<Text className={styles.kbName}>{item.knowledgeBaseName}</Text>
								{item.assignedAt && (
									<Text size='xs' c='dimmed'>
										Assigned {new Date(item.assignedAt).toLocaleDateString()}
									</Text>
								)}
							</div>
							<Badge
								variant='light'
								size='sm'
								color={getStatusColor(item.knowledgeBaseStatus)}
							>
								{item.knowledgeBaseStatus}
							</Badge>
						</li>
					))}
				</ul>
			) : (
				<Text className={styles.emptyState}>
					No knowledge bases linked. Attach curated content to improve accuracy.
				</Text>
			)}
		</RightSectionCard>
	);
};

export default AgentKnowledgeBaseDisplay;
