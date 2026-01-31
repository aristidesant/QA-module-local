import { ActionIcon, Stack, Text, Alert } from '@mantine/core';
import {
	IconGripVertical,
	IconTrash,
	IconAlertCircle,
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
} from '../../../nodeFormUtils';
import { hasEdgeCondition } from '~/modules/campaigns/CampaignsForm/WorkflowSection/utils/workflowValidation';
import { useAgentForm } from '../../context';
import mainStyles from '../../AgentForm.module.css';

const EdgesTab = () => {
	const { t } = useTranslation('campaigns');
	const { workflow, nodeId, onWorkflowChange } = useAgentForm();

	const outgoingEdges = getOutgoingEdges(workflow, nodeId);

	// Find edges without conditions for validation warning
	const edgesWithoutConditions = outgoingEdges.filter(
		({ id }) => !hasEdgeCondition(id, workflow)
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

	const handleDragEnd = (result: DropResult) => {
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
		<Stack gap='sm'>
			<Text size='sm' c='dimmed'>
				{t('form.workflow.forms.agent.edgesTab.description')}
			</Text>

			{edgesWithoutConditions.length > 0 && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title={t('form.workflow.forms.agent.edgesTab.warning.title', {
						defaultValue: 'Incomplete Edge Configuration',
					})}
					color='yellow'
				>
					<Text size='sm'>
						{t('form.workflow.forms.agent.edgesTab.warning.message', {
							defaultValue: `${edgesWithoutConditions.length} edge(s) need condition configuration before saving`,
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
								const targetLabel = resolveNodeLabel(
									targetNode?.label ?? targetNode?.type,
									t('form.workflow.nodes.end')
								);
								const conditionLabel = getEdgeConditionLabel(
									edge,
									t('form.workflow.forms.agent.edgesTab.unnamedCondition')
								);
								const isWithoutCondition = !hasEdgeCondition(id, workflow);

								return (
									<Draggable key={id} draggableId={id} index={index}>
										{(providedDraggable, snapshot) => (
											<div
												ref={providedDraggable.innerRef}
												{...providedDraggable.draggableProps}
												className={`${mainStyles.edgeItem} ${
													snapshot.isDragging ? mainStyles.edgeItemDragging : ''
												} ${isWithoutCondition ? mainStyles.edgeItemWarning : ''}`}
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
													<Text size='sm' className={mainStyles.edgeCondition}>
														{conditionLabel}
													</Text>
													<Text
														size='xs'
														c='dimmed'
														className={mainStyles.edgeTarget}
													>
														{t(
															'form.workflow.forms.agent.edgesTab.targetLabel',
															{ target: targetLabel }
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
														{ target: targetLabel }
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
	);
};

export default EdgesTab;
