import React, { useState } from 'react';
import { Button, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateDispositionFlow,
	useUpdateDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import { useDispositionBuilderStore } from '../dispositionStore';
import UnifiedOutcomeTree from './UnifiedOutcomeTree';
import BuilderInspector from './BuilderInspector';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { findNodeById } from '~/utils/dragDropUtils';
import styles from './DispositionForm.module.css';

/**
 * Rebuilds a clean flow node from the catalog, merging any behavior flags
 * the user set via the node form. Returns null if the node is not included.
 */
function rebuildFlowNode(
	catalogNode: DispositionNode,
	flowNodes: DispositionNode[]
): DispositionNode | null {
	const flowNode = findNodeById(flowNodes, catalogNode.id);
	if (!flowNode) return null;

	const rebuiltChildren = (catalogNode.children ?? [])
		.filter((c) => c.isActive !== false)
		.map((c) => rebuildFlowNode(c, flowNodes))
		.filter(Boolean) as DispositionNode[];

	return {
		...catalogNode,
		// Preserve behavior flags the user may have changed
		doNotCall:
			flowNode.doNotCall ?? flowNode.do_not_call ?? catalogNode.doNotCall,
		do_not_call: flowNode.do_not_call ?? catalogNode.do_not_call,
		requiresReschedule:
			flowNode.requiresReschedule ?? catalogNode.requiresReschedule,
		isInvalidatesNumber:
			flowNode.isInvalidatesNumber ?? catalogNode.isInvalidatesNumber,
		isAbandoned: flowNode.isAbandoned ?? catalogNode.isAbandoned,
		isFinal: flowNode.isFinal ?? catalogNode.isFinal,
		children: rebuiltChildren,
	};
}

function rebuildFlowFromCatalog(
	catalogNodes: DispositionNode[],
	flowNodes: DispositionNode[]
): DispositionNode[] {
	return catalogNodes
		.filter((n) => n.isActive !== false)
		.map((n) => rebuildFlowNode(n, flowNodes))
		.filter(Boolean) as DispositionNode[];
}

interface DispositionFormProps {
	onComplete?: () => void;
	onCancel?: () => void;
}

const DispositionForm: React.FC<DispositionFormProps> = ({
	onComplete,
	onCancel,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes', 'common']);
	const createMutation = useCreateDispositionFlow();
	const updateMutation = useUpdateDispositionFlow();
	const {
		flowJson,
		campaignId,
		dispositionFlow,
		setFlowJson,
		selectedCatalog,
	} = useDispositionBuilderStore();

	const [selectedNode, setSelectedNode] = useState<DispositionNode | null>(
		null
	);
	const [parentNode, setParentNode] = useState<DispositionNode | null>(null);

	const handleNodeSelect = (
		node: DispositionNode | null,
		parent?: DispositionNode
	) => {
		setSelectedNode(node ?? null);
		setParentNode(parent ?? null);
	};

	const handleSave = async () => {
		if (!flowJson?.dispositionNodes || flowJson.dispositionNodes.length === 0) {
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

		// Rebuild from catalog so the saved flow is always clean and complete,
		// merging any behavior flags the user set on individual nodes.
		const catalogNodes: DispositionNode[] =
			selectedCatalog?.dispositionNodes ?? [];
		const currentFlowNodes: DispositionNode[] = flowJson.dispositionNodes ?? [];
		const rebuiltNodes = rebuildFlowFromCatalog(catalogNodes, currentFlowNodes);

		const filledFlowJson = {
			id: flowJson.id ?? 0,
			name: flowJson.name,
			clientId: flowJson.clientId ?? 0,
			type: flowJson.type ?? 'OUTBOUND',
			isActive: flowJson.isActive ?? true,
			isDefault: flowJson.isDefault ?? false,
			createdAt: flowJson.createdAt ?? new Date().toISOString(),
			updatedAt: flowJson.updatedAt ?? new Date().toISOString(),
			dispositionNodes: rebuiltNodes,
			description: flowJson.description,
			campaignId,
		};

		try {
			if (dispositionFlow?.id) {
				await updateMutation.mutateAsync({
					id: dispositionFlow.id,
					data: { ...dispositionFlow, flowJson: filledFlowJson as any },
				});
			} else {
				await createMutation.mutateAsync({
					flowJson: filledFlowJson as any,
					campaignId,
				});
			}
			onComplete?.();
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('disposition.builder.errors.saveError'),
				color: 'red',
			});
		}
	};

	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<div className={styles.wrapper}>
			<div className={styles.header}>
				<TextInput
					placeholder={t('disposition.builder.namePlaceholder')}
					value={flowJson.name || ''}
					onChange={(e) =>
						setFlowJson({ ...flowJson, name: e.currentTarget.value })
					}
					required
					size='sm'
					className={styles.nameInput}
					aria-label={t('disposition.builder.nameLabel')}
				/>
			</div>

			<div className={styles.body}>
				<div className={styles.treePane}>
					<UnifiedOutcomeTree
						onNodeSelect={handleNodeSelect}
						selectedNodeId={selectedNode?.id}
					/>
				</div>
				<div className={styles.inspectorPane}>
					<BuilderInspector
						selectedNode={selectedNode}
						parentNode={parentNode}
						onDeselect={() => handleNodeSelect(null)}
					/>
				</div>
			</div>

			<div className={styles.footer}>
				<Group justify={onCancel ? 'space-between' : 'flex-end'}>
					{onCancel && (
						<Button variant='default' size='sm' onClick={onCancel}>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
					)}
					<Button
						size='sm'
						variant='filled'
						color='green'
						onClick={handleSave}
						loading={isSaving}
					>
						{dispositionFlow?.id
							? t('disposition.builder.updateFlow')
							: t('disposition.builder.createFlow')}
					</Button>
				</Group>
			</div>
		</div>
	);
};

export default DispositionForm;
