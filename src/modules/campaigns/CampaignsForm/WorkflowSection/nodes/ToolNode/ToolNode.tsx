import { memo, useMemo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { useTranslation } from 'react-i18next';
import { IconTool } from '@tabler/icons-react';
import type { ToolNode as ToolNodeModel } from '~/models/AgentWorkflowModel';
import { useTools } from '~/queries/toolQueries';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import styles from './ToolNode.module.css';

const ToolNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as ToolNodeModel;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const fallbackLabel = t('form.workflow.nodes.tool');
	const toolCount = nodeData.tools?.length ?? 0;
	const { data: tools } = useTools();

	const toolNameMap = useMemo(() => {
		const map = new Map<string, string>();
		(tools ?? []).forEach((tool) => {
			if (tool.identifier) {
				map.set(tool.identifier, tool.name || tool.identifier);
			}
		});
		return map;
	}, [tools]);

	return (
		<>
			<WorkflowNodeWrapper
				{...props}
				sideActions={
					<WorkflowNodeActions
						nodeId={props.id}
						nodeData={props.data as WorkflowNodeData}
						nodeType={nodeType}
					/>
				}
			>
				<div className={`${workflowNodeStyles.nodeSurface} ${styles.node}`}>
					<WorkflowNodeHeader
						className={styles.header}
						icon={<IconTool size={18} className={styles.icon} />}
						title={nodeData.label || fallbackLabel}
						subtitle={t('form.workflow.nodeStatus.toolsAttached', {
							count: toolCount,
						})}
						titleClassName={styles.title}
					/>
					{toolCount > 0 && (
						<div className={styles.footer}>
							<div className={styles.toolsList}>
								{nodeData.tools.map((tool, index) => (
									<span
										key={`${tool.toolId}-${index}`}
										className={styles.toolBadge}
									>
										{toolNameMap.get(tool.toolId) || tool.toolId}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</WorkflowNodeWrapper>
			<WorkflowNodeDrawer nodeId={props.id} />
		</>
	);
};

export default memo(ToolNodeComponent);
