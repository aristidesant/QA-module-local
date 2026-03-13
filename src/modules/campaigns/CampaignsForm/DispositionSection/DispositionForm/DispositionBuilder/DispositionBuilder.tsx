import React, { useState } from 'react';
import {
	Box,
	Button,
	Flex,
	Group,
	Modal,
	Paper,
	ScrollArea,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import styles from './DispositionBuilder.module.css';
import { useTranslation } from 'react-i18next';
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
	onCancel?: () => void;
};

const DispositionBuilder: React.FC<DispositionBuilderProps> = ({
	onComplete,
	onCancel,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const createMutation = useCreateDispositionFlow();
	const updateMutation = useUpdateDispositionFlow();
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
				title: t('status.error', { ns: 'common' }),
				message: t('disposition.builder.errors.minNodes'),
				color: 'red',
			});
			return;
		}

		if (!flowJson.name || flowJson.name.trim() === '') {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('disposition.builder.errors.nameRequired'),
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
				title: t('status.error', { ns: 'common' }),
				message: t('disposition.builder.errors.saveError'),
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
					label={t('disposition.builder.nameLabel')}
					labelProps={{
						title: `Campaign ID: ${campaignId || 'N/A'}`,
					}}
					w='50%'
					placeholder={t('disposition.builder.namePlaceholder')}
					description={t('disposition.builder.nameDescription')}
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
										{t('disposition.builder.header')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('disposition.builder.headerDescription')}
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
													catalogNodes={selectedCatalog?.dispositionNodes}
												/>
											))}
										</Stack>
									</Box>
								) : (
									<Box className={styles.emptyState}>
										<Text fw={600} c='var(--mantine-color-gray-6)' size='xs'>
											{t('disposition.builder.emptyTitle')}
										</Text>
										<Text size='xs' c='var(--mantine-color-gray-5)'>
											{t('disposition.builder.emptyDescription')}
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
									<DispositionGroupPreview node={selectedNode} />
								)
							) : (
								<Box className={styles.emptyRightPanel}>
									<div className={styles.emptyPanelText}>
										{t('disposition.builder.emptyRightPanel')}
									</div>
								</Box>
							)}
						</Box>
					</ScrollArea>
				</Box>
			</Box>
			<Paper withBorder className={styles.footer}>
				<Group justify='space-between'>
					{onCancel && (
						<Button onClick={onCancel} size='sm' variant='default'>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
					)}
					<Button
						onClick={handleSave}
						loading={createMutation.isPending || updateMutation.isPending}
						size='sm'
						variant='filled'
					>
						{dispositionFlow?.id
							? t('disposition.builder.updateFlow')
							: t('disposition.builder.createFlow')}
					</Button>
				</Group>
			</Paper>
			<Modal
				opened={Boolean(previewNode)}
				onClose={handleClosePreview}
				size='lg'
				title={t('disposition.builder.previewTitle')}
				withinPortal={false}
			>
				{previewNode ? <DispositionGroupPreview node={previewNode} /> : null}
			</Modal>
		</Box>
	);
};

export default DispositionBuilder;
