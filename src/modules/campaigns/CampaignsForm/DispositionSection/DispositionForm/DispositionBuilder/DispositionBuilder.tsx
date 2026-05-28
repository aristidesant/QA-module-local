import React, { useMemo, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Flex,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconCursorText,
	IconHierarchy3,
	IconLayoutList,
	IconLayoutRows,
	IconSitemap,
} from '@tabler/icons-react';
import styles from './DispositionBuilder.module.css';
import { useTranslation } from 'react-i18next';
import {
	useCreateDispositionFlow,
	useUpdateDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { findNodeById } from '~/utils/dragDropUtils';
import NodeEditor from './NodeEditor';
import DispositionNodeForm from './DispositionNodeForm';
import DispositionGroupPreview from './DispositionGroupPreview';

type DispositionBuilderProps = {
	onComplete?: () => void;
	onCancel?: () => void;
};

function countAllNodes(nodes: DispositionNode[]): number {
	return nodes.reduce(
		(acc, node) => acc + 1 + (node.children ? countAllNodes(node.children) : 0),
		0
	);
}

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
		populateNodeWithChildren,
		addMissingSiblingsToParent,
		selectedCatalog,
	} = useDispositionBuilderStore();

	const [selectedNode, setSelectedNode] = useState<DispositionNode | null>(
		null
	);
	const [parentNode, setParentNode] = useState<DispositionNode | null>(null);
	const [collapseAllKey, setCollapseAllKey] = useState(0);
	const [expandAllKey, setExpandAllKey] = useState(0);

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

	const totalNodeCount = useMemo(
		() =>
			flowJson?.dispositionNodes ? countAllNodes(flowJson.dispositionNodes) : 0,
		[flowJson?.dispositionNodes]
	);

	const missingChildrenForSelected = useMemo(() => {
		if (!selectedNode || !selectedCatalog?.dispositionNodes) return 0;
		const catalogNode = findNodeById(
			selectedCatalog.dispositionNodes,
			selectedNode.id
		);
		const catalogChildren = (catalogNode?.children ?? []).filter(
			(c) => c.isActive
		);
		const existingIds = new Set((selectedNode.children ?? []).map((c) => c.id));
		return catalogChildren.filter((c) => !existingIds.has(c.id)).length;
	}, [selectedNode, selectedCatalog]);

	const missingSiblingsForSelected = useMemo(() => {
		if (!selectedNode || !selectedCatalog?.dispositionNodes || !parentNode)
			return 0;
		const catalogNode = findNodeById(
			selectedCatalog.dispositionNodes,
			selectedNode.id
		);
		if (!catalogNode?.parentId) return 0;
		const parentCatalog = findNodeById(
			selectedCatalog.dispositionNodes,
			catalogNode.parentId
		);
		const activeSiblings = (parentCatalog?.children ?? []).filter(
			(c) => c.isActive
		);
		const existingIds = new Set((parentNode.children ?? []).map((c) => c.id));
		return activeSiblings.filter((s) => !existingIds.has(s.id)).length;
	}, [selectedNode, selectedCatalog, parentNode]);

	return (
		<Box className={styles.builderContainer}>
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
									backgroundColor: 'var(--disposition-surface-muted)',
								},
							},
							thumb: {
								backgroundColor: 'var(--disposition-scrollbar-thumb)',
								'&:hover': {
									backgroundColor: 'var(--disposition-scrollbar-thumb-hover)',
								},
							},
						}}
					>
						<Box className={styles.leftPanelContent}>
							<Stack gap={4}>
								<Group
									justify='space-between'
									align='center'
									className={styles.leftPanelHeader}
								>
									<Box>
										<Text fw={600} size='sm'>
											{t('disposition.builder.header')}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('disposition.builder.headerDescription')}
										</Text>
									</Box>
									{totalNodeCount > 0 && (
										<Group gap={4} wrap='nowrap'>
											<Badge size='xs' variant='light' color='green'>
												{totalNodeCount}
											</Badge>
											<Tooltip
												label={t('disposition.builder.collapseAll')}
												withArrow
											>
												<ActionIcon
													size='xs'
													variant='subtle'
													onClick={() => setCollapseAllKey((k) => k + 1)}
													aria-label={t('disposition.builder.collapseAll')}
												>
													<IconLayoutList size={13} />
												</ActionIcon>
											</Tooltip>
											<Tooltip
												label={t('disposition.builder.expandAll')}
												withArrow
											>
												<ActionIcon
													size='xs'
													variant='subtle'
													onClick={() => setExpandAllKey((k) => k + 1)}
													aria-label={t('disposition.builder.expandAll')}
												>
													<IconLayoutRows size={13} />
												</ActionIcon>
											</Tooltip>
										</Group>
									)}
								</Group>
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
													collapseAllKey={collapseAllKey}
													expandAllKey={expandAllKey}
												/>
											))}
										</Stack>
									</Box>
								) : (
									<Box className={styles.emptyState}>
										<IconSitemap
											size={40}
											// inline-style-allow: CSS variable applied to icon element which does not support className-based color overrides
											style={{ color: 'var(--disposition-text-muted)' }}
										/>
										<Text fw={600} c='dimmed' size='xs'>
											{t('disposition.builder.emptyTitle')}
										</Text>
										<Text size='xs' c='dimmed'>
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
									backgroundColor: 'var(--disposition-surface-muted)',
								},
							},
							thumb: {
								backgroundColor: 'var(--disposition-scrollbar-thumb)',
								'&:hover': {
									backgroundColor: 'var(--disposition-scrollbar-thumb-hover)',
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
									<Stack gap={0}>
										{(missingChildrenForSelected > 0 ||
											missingSiblingsForSelected > 0) && (
											<Group gap='xs' className={styles.parentActions}>
												{missingChildrenForSelected > 0 && (
													<Button
														size='xs'
														variant='light'
														color='blue'
														leftSection={<IconHierarchy3 size={13} />}
														onClick={() =>
															populateNodeWithChildren(selectedNode.id)
														}
													>
														{t('disposition.nodeEditor.addChildren', {
															count: missingChildrenForSelected,
														})}
													</Button>
												)}
												{missingSiblingsForSelected > 0 && (
													<Button
														size='xs'
														variant='light'
														color='green'
														leftSection={<IconHierarchy3 size={13} />}
														onClick={() =>
															addMissingSiblingsToParent(selectedNode.id)
														}
													>
														{t('disposition.nodeEditor.addSiblings', {
															count: missingSiblingsForSelected,
														})}
													</Button>
												)}
											</Group>
										)}
										<DispositionGroupPreview node={selectedNode} />
									</Stack>
								)
							) : (
								<Box className={styles.emptyRightPanel}>
									<Stack align='center' gap={6}>
										<IconCursorText
											size={36}
											// inline-style-allow: CSS variable applied to icon element which does not support className-based color overrides
											style={{ color: 'var(--disposition-text-muted)' }}
										/>
										<div className={styles.emptyPanelText}>
											{t('disposition.builder.emptyRightPanel')}
										</div>
									</Stack>
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
						color='green'
					>
						{dispositionFlow?.id
							? t('disposition.builder.updateFlow')
							: t('disposition.builder.createFlow')}
					</Button>
				</Group>
			</Paper>
		</Box>
	);
};

export default DispositionBuilder;
