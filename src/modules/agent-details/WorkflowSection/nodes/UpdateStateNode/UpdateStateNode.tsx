import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconPencil } from '@tabler/icons-react';
import type { UpdateStateNode as UpdateStateNodeModel } from '~/models/AgentWorkflowModel';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import { resolveWorkflowIcon } from '../../utils/workflowIconRegistry';
import { useNodeStyle } from '../../NodeStylesContext';
import { useWorkflowNodeEditor } from '../../WorkflowNodeEditorContext';
import { useWorkflowNodeToneStyle } from '../../utils/workflowNodeColors';
import { isWorkflowMultiSelectClick } from '../../utils/workflowSelectionUtils';
import { normalizeUpdateStateUpdates } from '../../utils/updateStateUtils';
import styles from './UpdateStateNode.module.css';

const MAX_VISIBLE_VARIABLES = 2;

const getTrimmedString = (value: unknown): string =>
	typeof value === 'string' ? value.trim() : '';

const UpdateStateNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as UpdateStateNodeModel;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const { openNodeDrawer } = useWorkflowNodeEditor();
	const persistedStyle = useNodeStyle(props.id);
	const fallbackLabel = t('form.workflow.nodes.update_state', {
		defaultValue: 'Update state',
	});
	const baseStyle = useWorkflowNodeToneStyle(
		nodeData.label || fallbackLabel,
		persistedStyle
	);

	const updates = normalizeUpdateStateUpdates(nodeData.updates);
	const nodeTitle =
		getTrimmedString(nodeData.label) ||
		t('form.workflow.forms.updateState.noTitle', {
			defaultValue: 'No title',
		});
	const variableNames = updates
		.map((update) => getTrimmedString(update.variable_name))
		.filter(Boolean);
	const visibleVariables = variableNames.slice(0, MAX_VISIBLE_VARIABLES);
	const hiddenVariablesCount = Math.max(
		variableNames.length - visibleVariables.length,
		0
	);
	const updateSummary =
		updates.length > 0
			? t('form.workflow.forms.updateState.updateCount', {
					count: updates.length,
					defaultValue: '{{count}} updates',
				})
			: t('form.workflow.forms.updateState.empty', {
					defaultValue: 'No updates configured',
				});
	const CustomIcon = resolveWorkflowIcon(persistedStyle?.iconName);
	const nodeIcon = CustomIcon ? (
		<CustomIcon size={18} className={styles.icon} />
	) : (
		<IconPencil size={18} className={styles.icon} />
	);

	const handleOpenDrawer = () => {
		openNodeDrawer(props.id);
	};

	return (
		<>
			<WorkflowNodeWrapper {...props}>
				<div
					className={`${workflowNodeStyles.nodeSurface} ${styles.node}`}
					// inline-style-allow: per-node CSS variables are derived dynamically from persisted node tones.
					style={baseStyle}
					onClick={(event) => {
						if (isWorkflowMultiSelectClick(event)) return;
						handleOpenDrawer();
					}}
					role='button'
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							handleOpenDrawer();
						}
					}}
				>
					<WorkflowNodeHeader
						className={styles.header}
						icon={nodeIcon}
						title={nodeTitle}
						subtitle={fallbackLabel}
						titleClassName={styles.title}
					/>
					<div className={styles.body}>
						<div className={styles.summaryRow}>
							<Text size='xs' fw={600} className={styles.summaryText}>
								{updateSummary}
							</Text>
						</div>
						{visibleVariables.length > 0 ? (
							<div className={styles.variableList}>
								{visibleVariables.map((variable_name) => (
									<span key={variable_name} className={styles.variablePill}>
										{variable_name}
									</span>
								))}
								{hiddenVariablesCount > 0 ? (
									<span className={styles.variablePill}>
										{t('form.workflow.forms.updateState.moreVariables', {
											count: hiddenVariablesCount,
											defaultValue: '+{{count}} more',
										})}
									</span>
								) : null}
							</div>
						) : null}
					</div>
				</div>
			</WorkflowNodeWrapper>
			<WorkflowNodeDrawer nodeId={props.id} />
		</>
	);
};

export default memo(UpdateStateNodeComponent);
