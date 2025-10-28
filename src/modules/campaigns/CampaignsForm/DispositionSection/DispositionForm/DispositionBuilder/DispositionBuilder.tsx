import React, { useState } from 'react';
import {
	Box,
	Button,
	Flex,
	Modal,
	Paper,
	ScrollArea,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import styles from './DispositionBuilder.module.css';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import {
	useCreateDispositionFlow,
	useUpdateDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import NodeEditor from './NodeEditor';
import DispositionNodeForm from './DispositionNodeForm';
import DispositionGroupPreview from './DispositionGroupPreview';

type DispositionBuilderProps = {
	onComplete?: () => void;
};

const DispositionBuilder: React.FC<DispositionBuilderProps> = ({
	onComplete,
}) => {
	const createMutation = useCreateDispositionFlow();
	const updateMutation = useUpdateDispositionFlow();
	const dispositionLabel = useDispositionLabel();
	const {
		flowJson,
		campaignId,
		dispositionFlow,
		removeNode,
		setFlowJson,
		previewNode,
		setPreviewNode,
		populateNodeWithChildren,
		addMissingSiblingsToParent,
		selectedCatalog,
	} = useDispositionBuilderStore();

	const [selectedNode, setSelectedNode] = useState<DispositionNode | null>(
		null
	);
	const [parentNode, setParentNode] = useState<DispositionNode | null>(null);

	const handleNodeSelect = (
		node: DispositionNode,
		parent?: DispositionNode
	) => {
		setSelectedNode(node);
		setParentNode(parent ?? null);
	};

	const handleNodeFormCancel = () => {
		setSelectedNode(null);
		setParentNode(null);
	};

	const handleClosePreview = () => {
		setPreviewNode(null);
	};

	const handleSave = async () => {
		if (
			!flowJson?.dispositionNodes ||
			flowJson?.dispositionNodes?.length === 0
		) {
			notifications.show({
				title: 'Error',
				message: dispositionLabel('Please add at least one outcome node.'),
				color: 'red',
			});
			return;
		}

		if (!flowJson.name || flowJson.name.trim() === '') {
			notifications.show({
				title: 'Error',
				message: dispositionLabel('Outcome name is required.'),
				color: 'red',
			});
			return;
		}

		const filledFlowJson = {
			id: flowJson.id ?? 0,
			name: flowJson.name ?? 'Untitled Catalog',
			clientId: flowJson.clientId ?? 0,
			type: flowJson.type ?? 'OUTBOUND',
			isActive: flowJson.isActive ?? true,
			isDefault: flowJson.isDefault ?? false,
			createdAt: flowJson.createdAt ?? new Date().toISOString(),
			updatedAt: flowJson.updatedAt ?? new Date().toISOString(),
			dispositionNodes: flowJson.dispositionNodes ?? [],
			description: flowJson.description,
			campaignId: campaignId,
		};

		try {
			if (dispositionFlow?.id) {
				await updateMutation.mutateAsync({
					id: dispositionFlow?.id,
					data: { ...dispositionFlow, flowJson: filledFlowJson as any },
				});
				onComplete?.();
			} else {
				await createMutation.mutateAsync({
					flowJson: filledFlowJson as any,
					campaignId,
				});
				onComplete?.();
			}
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'An error occurred while saving the outcome flow.',
				color: 'red',
			});
		}
	};

	const isLeafSelected =
		selectedNode &&
		(!selectedNode.children || selectedNode.children.length === 0);

	return (
		<Box className={styles.builderContainer}>
			{null}
			<Flex mb={4}>
				<TextInput
					label='Outcome Name'
					labelProps={{
						title: `Campaign ID: ${campaignId || 'N/A'}`,
					}}
					w='50%'
					placeholder='Outcome Name'
					description='Enter the name of the outcome'
					value={flowJson.name || ''}
					onChange={(event) =>
						setFlowJson({ ...flowJson, name: event.currentTarget.value })
					}
					required
					size='xs'
				/>
			</Flex>
			<Box className={styles.panelsContainer}>
				<Box className={styles.leftPanel}>
					<ScrollArea
						type='hover'
						scrollbarSize={6}
						className={styles.scrollArea}
						styles={{
							scrollbar: {
								backgroundColor: 'transparent',
								'&:hover': {
									backgroundColor: 'var(--mantine-color-gray-1)',
								},
							},
							thumb: {
								backgroundColor: 'var(--mantine-color-gray-4)',
								'&:hover': {
									backgroundColor: 'var(--mantine-color-gray-6)',
								},
							},
						}}
					>
						<Box className={styles.leftPanelContent}>
							<Stack gap={4}>
								<Box className={styles.leftPanelHeader}>
									<Text fw={600} size='sm'>
										Outcome flow
									</Text>
									<Text size='xs' c='dimmed'>
										Use the catalog to add outcomes. Select a node to edit or
										preview its group.
									</Text>
								</Box>
								{flowJson?.dispositionNodes &&
								flowJson.dispositionNodes.length > 0 ? (
									<Box className={styles.treeContainer}>
										<Stack gap={3} className={styles.nodesStack}>
											{flowJson.dispositionNodes.map((node) => (
												<NodeEditor
													key={node.id}
													node={node}
													removeNode={removeNode}
													onNodeSelect={handleNodeSelect}
													selectedNodeId={selectedNode?.id}
													onPopulateChildren={populateNodeWithChildren}
													onAddMissingSiblings={addMissingSiblingsToParent}
													onPreviewGroup={setPreviewNode}
													catalogNodes={selectedCatalog?.dispositionNodes}
												/>
											))}
										</Stack>
									</Box>
								) : (
									<Box className={styles.emptyState}>
										<Text fw={600} c='var(--mantine-color-gray-6)' size='xs'>
											No outcomes selected yet
										</Text>
										<Text size='xs' c='var(--mantine-color-gray-5)'>
											Add outcomes from the catalog to build this flow.
										</Text>
									</Box>
								)}
							</Stack>
						</Box>
					</ScrollArea>
				</Box>
				<Box className={styles.rightPanel}>
					<ScrollArea
						type='hover'
						scrollbarSize={6}
						className={styles.scrollArea}
						styles={{
							scrollbar: {
								backgroundColor: 'transparent',
								'&:hover': {
									backgroundColor: 'var(--mantine-color-gray-1)',
								},
							},
							thumb: {
								backgroundColor: 'var(--mantine-color-gray-4)',
								'&:hover': {
									backgroundColor: 'var(--mantine-color-gray-6)',
								},
							},
						}}
					>
						<Box className={styles.rightPanelContent}>
							{selectedNode ? (
								isLeafSelected ? (
									<DispositionNodeForm
										key={selectedNode.id}
										node={selectedNode}
										parentNode={parentNode}
										onSubmit={() => {
											setSelectedNode(null);
											setParentNode(null);
										}}
										onCancel={handleNodeFormCancel}
									/>
								) : (
									<Stack gap={4}>
										<Text fw={600} size='sm'>
											Group preview
										</Text>
										<DispositionGroupPreview node={selectedNode} />
									</Stack>
								)
							) : (
								<Box className={styles.emptyRightPanel}>
									<div className={styles.emptyPanelText}>
										Select a node to edit its properties or preview a group
									</div>
								</Box>
							)}
						</Box>
					</ScrollArea>
				</Box>
			</Box>

			<Paper withBorder className={styles.footer}>
				<Button
					onClick={handleSave}
					loading={createMutation.isPending || updateMutation.isPending}
					size='sm'
					variant='filled'
				>
					{dispositionFlow?.id ? 'Update Flow' : 'Create Flow'}
				</Button>
			</Paper>

			<Modal
				opened={Boolean(previewNode)}
				onClose={handleClosePreview}
				size='lg'
				title='Outcome group preview'
				withinPortal={false}
			>
				{previewNode ? <DispositionGroupPreview node={previewNode} /> : null}
			</Modal>
		</Box>
	);
};

export default DispositionBuilder;
