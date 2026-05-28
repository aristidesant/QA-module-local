import { useMemo, useState } from 'react';
import { ActionIcon, Alert, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconAlertTriangle, IconGripVertical, IconTrash } from '@tabler/icons-react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow, WorkflowEdge } from '~/models/AgentWorkflowModel';
import {
	getEdgeConditionLabel,
	getOutgoingEdges,
	removeWorkflowEdge,
	resolveNodeLabel,
	updateWorkflowEdgeOrder,
	updateWorkflowEdge,
} from '../nodeFormUtils';
import { getEdgeWarningLevel } from '../../utils/workflowValidation';
import { EdgeConditionModal } from '../EdgeConditionModal';
import WorkflowNodeForm from '../WorkflowNodeForm';
import styles from '../AgentForm/AgentForm.module.css';

interface NodeEdgesTabProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	title: string;
	description: string;
	emptyMessage: string;
}

const NodeEdgesTab = ({
	nodeId,
	workflow,
	onWorkflowChange,
	title,
	description,
	emptyMessage,
}: NodeEdgesTabProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const [modalOpened, setModalOpened] = useState(false);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

	const outgoingEdges = getOutgoingEdges(workflow, nodeId);

	const selectedEdge = selectedEdgeId
		? outgoingEdges.find(({ id }) => id === selectedEdgeId)
		: undefined;

	const sourceNode = workflow?.nodes[nodeId];
	const sourceLabel = resolveNodeLabel(
		sourceNode?.label ?? sourceNode?.type,
		t('form.workflow.nodes.start')
	);
	const sourceNodeType = sourceNode?.type;
	const targetNode = selectedEdge
		? workflow?.nodes[selectedEdge.edge.target]
		: undefined;
	const targetLabel = selectedEdge
		? resolveNodeLabel(
				targetNode?.label ?? targetNode?.type,
				t('form.workflow.nodes.end')
			)
		: undefined;
	const targetNodeType = targetNode?.type;

	const edgesByWarningLevel = useMemo(
		() =>
			outgoingEdges.reduce(
				(acc, { id }) => {
					const level = getEdgeWarningLevel(id, workflow);
					if (level === 'error') {
						acc.errors.push(id);
					} else if (level === 'warning') {
						acc.warnings.push(id);
					}
					return acc;
				},
				{ errors: [] as string[], warnings: [] as string[] }
			),
		[outgoingEdges, workflow]
	);

	const handleOpenEdgeModal = (edgeId: string) => {
		setSelectedEdgeId(edgeId);
		setModalOpened(true);
	};

	const handleCloseModal = () => {
		setModalOpened(false);
		setSelectedEdgeId(null);
	};

	const handleSaveEdgeCondition = (
		edgeId: string,
		forward_condition?: WorkflowEdge['forward_condition'],
		backward_condition?: WorkflowEdge['backward_condition']
	) => {
		const nextWorkflow = updateWorkflowEdge(workflow, edgeId, {
			forward_condition,
			backward_condition,
		});

		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		if (sourceIndex === destinationIndex) return;

		const newOrder = Array.from(outgoingEdges);
		const [moved] = newOrder.splice(sourceIndex, 1);
		newOrder.splice(destinationIndex, 0, moved);

		const nextEdgeOrder = newOrder.map((edge) => edge.id);
		const nextWorkflow = updateWorkflowEdgeOrder(workflow, nodeId, nextEdgeOrder);

		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleRemoveEdge = (edgeId: string) => {
		const nextWorkflow = removeWorkflowEdge(workflow, edgeId);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	return (
	<>
		<WorkflowNodeForm title={title} description={description}>
			<Stack gap='sm'>
				{edgesByWarningLevel.errors.length > 0 && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('form.workflow.forms.agent.edgesTab.error.title', {
							defaultValue: 'Missing Edge Conditions',
						})}
						color='red'
					>
						<Text size='sm'>
							{t('form.workflow.forms.agent.edgesTab.error.message', {
								defaultValue: `${edgesByWarningLevel.errors.length} edge(s) are missing all conditions and must be configured`,
							})}
						</Text>
					</Alert>
				)}

				{edgesByWarningLevel.warnings.length > 0 && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						title={t('form.workflow.forms.agent.edgesTab.warning.title', {
							defaultValue: 'Default Edge Configuration',
						})}
						color='yellow'
					>
						<Text size='sm'>
							{t('form.workflow.forms.agent.edgesTab.warning.message', {
								defaultValue: `${edgesByWarningLevel.warnings.length} edge(s) have default unconditional routing. Consider configuring specific conditions`,
							})}
						</Text>
					</Alert>
				)}

				{outgoingEdges.length === 0 ? (
					<div className={styles.emptyState}>
						<Text size='xs' c='dimmed'>
							{emptyMessage}
						</Text>
					</div>
				) : (
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId={`edges-list-${nodeId}`}>
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={styles.edgesList}
								>
									{outgoingEdges.map(({ id, edge }, index) => {
										const targetNodeLocal = workflow?.nodes[edge.target];
										const targetLabelLocal = resolveNodeLabel(
											targetNodeLocal?.label ?? targetNodeLocal?.type,
											t('form.workflow.nodes.end')
										);
										const conditionLabel = getEdgeConditionLabel(
											edge,
											t('form.workflow.forms.agent.edgesTab.unnamedCondition')
										);
										const warningLevel = getEdgeWarningLevel(id, workflow);

										return (
											<Draggable key={id} draggableId={id} index={index}>
												{(providedDraggable, snapshot) => (
													<div
														ref={providedDraggable.innerRef}
														{...providedDraggable.draggableProps}
														className={`${styles.edgeItem} ${
															snapshot.isDragging
																? styles.edgeItemDragging
																: ''
														} ${
															warningLevel === 'error'
																? styles.edgeItemError
																: warningLevel === 'warning'
																	? styles.edgeItemWarning
																	: ''
														}`}
													>
														<div
															{...providedDraggable.dragHandleProps}
															className={styles.edgeDragHandle}
														>
															<IconGripVertical
																size={16}
																className={styles.edgeGripIcon}
															/>
														</div>
														<div className={styles.edgeInfo}>
															<Text
																size='sm'
																className={styles.edgeCondition}
																onClick={() => handleOpenEdgeModal(id)}
															>
																{conditionLabel}
															</Text>
															<Text
																size='xs'
																c='dimmed'
																className={styles.edgeTarget}
															>
																{t('form.workflow.forms.agent.edgesTab.targetLabel', {
																	target: targetLabelLocal,
																})}
															</Text>
														</div>
														<ActionIcon
															variant='subtle'
															color='gray'
															size='sm'
															onClick={() => handleRemoveEdge(id)}
															aria-label={t(
																'form.workflow.forms.agent.edgesTab.removeAria',
																{ target: targetLabelLocal }
															)}
														>
															<IconTrash size={16} />
														</ActionIcon>
													</div>
												)}
											</Draggable>
										);
									})}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				)}
			</Stack>
		</WorkflowNodeForm>
		<EdgeConditionModal
			opened={modalOpened}
			edgeId={selectedEdgeId ?? undefined}
			edge={selectedEdge?.edge}
			sourceLabel={sourceLabel}
			targetLabel={targetLabel}
			sourceNodeType={sourceNodeType}
			targetNodeType={targetNodeType}
			onClose={handleCloseModal}
			onSave={handleSaveEdgeCondition}
		/>
	</>
	);
};

export default NodeEdgesTab;
