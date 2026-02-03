import { useState } from 'react';
import { ActionIcon, Stack, Text, Alert } from '@mantine/core';
import {
	IconGripVertical,
	IconTrash,
	IconAlertCircle,
	IconAlertTriangle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from '@hello-pangea/dnd';
import {
	getEdgeConditionLabel,
	getOutgoingEdges,
	removeWorkflowEdge,
	resolveNodeLabel,
	updateWorkflowEdgeOrder,
	updateWorkflowEdge,
} from '../../../nodeFormUtils';
import { getEdgeWarningLevel } from '~/modules/campaigns/CampaignsForm/WorkflowSection/utils/workflowValidation';
import { EdgeConditionModal } from '../../../EdgeConditionModal';
import { useAgentForm } from '../../context';
import mainStyles from '../../AgentForm.module.css';

const EdgesTab = () => {
	const { t } = useTranslation('campaigns');
	const { workflow, nodeId, onWorkflowChange } = useAgentForm();

	const [modalOpened, setModalOpened] = useState(false);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

	const outgoingEdges = getOutgoingEdges(workflow, nodeId);

	// Find the selected edge
	const selectedEdge = selectedEdgeId
		? outgoingEdges.find(({ id }) => id === selectedEdgeId)
		: undefined;

	// Get labels for the selected edge
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

	// Find edges by warning level
	const edgesByWarningLevel = outgoingEdges.reduce(
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
	);

	if (outgoingEdges.length === 0) {
		return (
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.agent.edgesTab.description')}
				</Text>
				<div className={mainStyles.emptyState}>
					<Text size='xs' c='dimmed'>
						{t('form.workflow.forms.agent.edgesTab.empty')}
					</Text>
				</div>
			</Stack>
		);
	}

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
		forwardCondition?: any,
		backwardCondition?: any
	) => {
		const updates = {
			forwardCondition,
			backwardCondition,
		};

		const nextWorkflow = updateWorkflowEdge(workflow, edgeId, updates);

		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleDragEnd = (result: DropResult, _provided?: any) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		if (sourceIndex === destinationIndex) return;

		const newOrder = Array.from(outgoingEdges);
		const [moved] = newOrder.splice(sourceIndex, 1);
		newOrder.splice(destinationIndex, 0, moved);

		const nextEdgeOrder = newOrder.map((e) => e.id);
		const nextWorkflow = updateWorkflowEdgeOrder(
			workflow,
			nodeId,
			nextEdgeOrder
		);

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
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.agent.edgesTab.description')}
				</Text>

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

				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId='edges-list'>
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className={mainStyles.edgesList}
							>
								{outgoingEdges.map(({ id, edge }, index) => {
									const targetNode = workflow?.nodes[edge.target];
									const targetLabelLocal = resolveNodeLabel(
										targetNode?.label ?? targetNode?.type,
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
													className={`${mainStyles.edgeItem} ${
														snapshot.isDragging
															? mainStyles.edgeItemDragging
															: ''
													} ${
														warningLevel === 'error'
															? mainStyles.edgeItemError
															: warningLevel === 'warning'
																? mainStyles.edgeItemWarning
																: ''
													}`}
												>
													<div
														{...providedDraggable.dragHandleProps}
														className={mainStyles.edgeDragHandle}
													>
														<IconGripVertical
															size={16}
															className={mainStyles.edgeGripIcon}
														/>
													</div>
													<div className={mainStyles.edgeInfo}>
														<Text
															size='sm'
															className={mainStyles.edgeCondition}
															style={{ cursor: 'pointer' }}
															onClick={() => handleOpenEdgeModal(id)}
														>
															{conditionLabel}
														</Text>
														<Text
															size='xs'
															c='dimmed'
															className={mainStyles.edgeTarget}
														>
															{t(
																'form.workflow.forms.agent.edgesTab.targetLabel',
																{ target: targetLabelLocal }
															)}
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
			</Stack>

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

export default EdgesTab;
