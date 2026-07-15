import React, { useState } from 'react';
import { Badge, Button, Group, Text, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCircleCheck, IconEdit, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	useCreateDispositionFlow,
	useUpdateDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import { useDispositionBuilderStore } from '../dispositionStore';
import UnifiedOutcomeTree from './UnifiedOutcomeTree';
import BuilderInspector from './BuilderInspector';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import AppDrawer from '~/components/AppDrawer';
import {
	getSelectedLeafIds,
	rebuildFlowSelection,
} from '../dispositionSelection';
import styles from './DispositionForm.module.css';

interface DispositionFormProps {
	onComplete?: () => void;
	onCancel?: () => void;
}

interface BuilderErrors {
	name?: string;
	selection?: string;
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
	const isCompact = useMediaQuery('(max-width: 64em)');
	const [initialSnapshot] = useState(() => JSON.stringify(flowJson));
	const [selectedNode, setSelectedNode] = useState<DispositionNode | null>(
		null
	);
	const [parentNode, setParentNode] = useState<DispositionNode | null>(null);
	const [errors, setErrors] = useState<BuilderErrors>({});
	const isDirty = initialSnapshot !== JSON.stringify(flowJson);

	const handleNodeSelect = (
		node: DispositionNode | null,
		parent?: DispositionNode
	) => {
		setSelectedNode(node);
		setParentNode(parent ?? null);
	};

	const handleSave = async () => {
		const nextErrors: BuilderErrors = {};
		if (!flowJson.name?.trim()) {
			nextErrors.name = t('disposition.builder.errors.nameRequired');
		}
		if (!flowJson.dispositionNodes?.length) {
			nextErrors.selection = t('disposition.builder.errors.minNodes');
		}
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) return;

		const catalogNodes = selectedCatalog?.dispositionNodes ?? [];
		const currentFlowNodes = flowJson.dispositionNodes ?? [];
		const selectedLeafIds = getSelectedLeafIds(catalogNodes, currentFlowNodes);
		const now = new Date().toISOString();
		const filledFlowJson: DispositionCatalogModel = {
			id: flowJson.id ?? selectedCatalog?.id ?? 0,
			name: flowJson.name!.trim(),
			clientId: flowJson.clientId ?? selectedCatalog?.clientId ?? 0,
			type: flowJson.type ?? selectedCatalog?.type ?? 'OUTBOUND',
			isActive: flowJson.isActive ?? true,
			isDefault: flowJson.isDefault ?? false,
			createdAt: flowJson.createdAt ?? selectedCatalog?.createdAt ?? now,
			updatedAt: now,
			dispositionNodes: rebuildFlowSelection(
				catalogNodes,
				selectedLeafIds,
				currentFlowNodes
			),
			description: flowJson.description ?? selectedCatalog?.description,
			campaignId,
		};

		try {
			if (dispositionFlow?.id) {
				await updateMutation.mutateAsync({
					id: dispositionFlow.id,
					data: { ...dispositionFlow, flowJson: filledFlowJson },
				});
			} else {
				await createMutation.mutateAsync({
					flowJson: filledFlowJson,
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

	const handleCancel = () => {
		if (!onCancel) return;
		if (!isDirty) {
			onCancel();
			return;
		}

		modals.openConfirmModal({
			title: t('disposition.builder.discardTitle'),
			children: (
				<Text size='sm'>{t('disposition.builder.discardDescription')}</Text>
			),
			labels: {
				confirm: t('disposition.builder.discardChanges'),
				cancel: t('disposition.builder.keepEditing'),
			},
			confirmProps: { color: 'red' },
			onConfirm: onCancel,
		});
	};

	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<div className={styles.wrapper}>
			<header className={styles.header}>
				<div className={styles.headerIntro}>
					<Group gap='xs' wrap='nowrap'>
						<IconEdit size={19} className={styles.headerIcon} />
						<Text className={styles.headerTitle}>
							{t('disposition.builder.header')}
						</Text>
						<Badge
							variant='light'
							color={isDirty ? 'orange' : 'green'}
							radius='sm'
							leftSection={
								isDirty ? <IconEdit size={12} /> : <IconCircleCheck size={12} />
							}
						>
							{isDirty
								? t('disposition.builder.unsaved')
								: t('disposition.builder.savedState')}
						</Badge>
					</Group>
					<Text size='xs' className={styles.headerDescription}>
						{t('disposition.builder.headerDescription')}
					</Text>
				</div>

				<TextInput
					label={t('disposition.builder.nameLabel')}
					placeholder={t('disposition.builder.namePlaceholder')}
					value={flowJson.name ?? ''}
					onChange={(event) => {
						setFlowJson({ ...flowJson, name: event.currentTarget.value });
						if (errors.name) {
							setErrors((current) => ({ ...current, name: undefined }));
						}
					}}
					error={errors.name}
					required
					size='sm'
					className={styles.nameInput}
				/>
			</header>

			<div className={styles.body}>
				<main className={styles.treePane}>
					<UnifiedOutcomeTree
						onNodeSelect={handleNodeSelect}
						selectedNodeId={selectedNode?.id}
						selectionError={errors.selection}
					/>
				</main>
				<aside className={styles.inspectorPane}>
					<BuilderInspector
						selectedNode={selectedNode}
						parentNode={parentNode}
						onDeselect={() => handleNodeSelect(null)}
					/>
				</aside>
			</div>

			<footer className={styles.footer}>
				<Group justify='flex-end' gap='xs'>
					{onCancel && (
						<Button
							variant='default'
							size='sm'
							leftSection={<IconX size={16} />}
							onClick={handleCancel}
						>
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
			</footer>

			<AppDrawer
				opened={Boolean(isCompact && selectedNode)}
				onClose={() => handleNodeSelect(null)}
				title={selectedNode?.name ?? t('disposition.tree.outcomeDetails')}
				size='lg'
				keepMounted
			>
				<BuilderInspector
					selectedNode={selectedNode}
					parentNode={parentNode}
					onDeselect={() => handleNodeSelect(null)}
				/>
			</AppDrawer>
		</div>
	);
};

export default DispositionForm;
