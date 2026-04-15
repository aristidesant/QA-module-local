import { memo, useCallback } from 'react';
import { useStore } from '@xyflow/react';
import type { ReactFlowState } from '@xyflow/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconBoxMultiple } from '@tabler/icons-react';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';
import { useWorkflowCanvasActions } from '../WorkflowCanvasActionsContext';
import styles from './SelectionToolbar.module.css';

/**
 * Selector that extracts only the count of groupable selected nodes.
 * Because the return type is a primitive number, React will skip re-renders
 * whenever the count hasn't changed — even if the nodes array itself is new
 * (e.g. during drag).
 */
const selectGroupableCount = (state: ReactFlowState): number =>
	state.nodes.filter(
		(n) =>
			n.selected &&
			n.type !== WORKFLOW_NODE_TYPES.START &&
			n.type !== WORKFLOW_NODE_TYPES.END &&
			n.type !== WORKFLOW_NODE_TYPES.GROUP
	).length;

/** Floating pill that appears when ≥ 2 groupable nodes are selected. */
const SelectionToolbar = () => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const { groupSelectedNodes } = useWorkflowCanvasActions();
	const selectedCount = useStore(
		useCallback((s: ReactFlowState) => selectGroupableCount(s), [])
	);

	if (selectedCount < 2) return null;

	return (
		<div className={`${styles.toolbar} nodrag nopan`}>
			<span className={styles.selectionBadge}>
				{t('form.workflow.selection.count', { count: selectedCount })}
			</span>

			<span className={styles.divider} />

			<Tooltip label={t('form.workflow.group.create')} withArrow>
				<ActionIcon
					size='xs'
					variant='subtle'
					color='blue'
					radius='xl'
					onClick={groupSelectedNodes}
				>
					<IconBoxMultiple size={14} />
				</ActionIcon>
			</Tooltip>
		</div>
	);
};

export default memo(SelectionToolbar);
