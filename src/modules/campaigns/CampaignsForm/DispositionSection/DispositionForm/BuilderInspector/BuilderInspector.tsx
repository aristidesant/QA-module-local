import React, { useMemo } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconFileDescription,
	IconFolder,
	IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import DispositionNodeForm from '../DispositionBuilder/DispositionNodeForm';
import DispositionGroupPreview from '../DispositionBuilder/DispositionGroupPreview';
import { isLeafNode } from '~/utils/dispositionNodeStyles';
import { findNodeById } from '~/utils/dragDropUtils';
import styles from './BuilderInspector.module.css';
import {
	getActiveChildren,
	getActiveLeafIds,
} from '../../dispositionSelection';

interface FlowStats {
	total: number;
	groups: number;
	outcomes: number;
	flagged: number;
}

function computeFlowStats(nodes: DispositionNode[]): FlowStats {
	let total = 0;
	let groups = 0;
	let outcomes = 0;
	let flagged = 0;
	const walk = (node: DispositionNode) => {
		total++;
		if (!node.children || node.children.length === 0) {
			outcomes++;
		} else {
			groups++;
			node.children.forEach(walk);
		}
		if (
			node.doNotCall ||
			node.do_not_call ||
			node.isAbandoned ||
			node.isInvalidatesNumber ||
			node.requiresReschedule
		) {
			flagged++;
		}
	};
	nodes.forEach(walk);
	return { total, groups, outcomes, flagged };
}

interface StatChipProps {
	value: number;
	label: string;
	amber?: boolean;
}

const StatChip: React.FC<StatChipProps> = ({ value, label, amber = false }) => (
	<div className={styles.statChip}>
		<Text
			className={styles.statValue}
			data-amber={amber && value > 0 ? 'true' : 'false'}
		>
			{value}
		</Text>
		<Text
			className={styles.statLabel}
			data-amber={amber && value > 0 ? 'true' : 'false'}
		>
			{label}
		</Text>
	</div>
);

interface BuilderInspectorProps {
	selectedNode: DispositionNode | null;
	parentNode: DispositionNode | null;
	onDeselect: () => void;
}

const BuilderSummary: React.FC = () => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const { flowJson } = useDispositionBuilderStore();
	const nodes = flowJson?.dispositionNodes ?? [];
	const stats = useMemo(() => computeFlowStats(nodes), [nodes]);

	return (
		<Stack gap='md' className={styles.summary}>
			<Text size='xs' fw={650} c='dimmed' className={styles.summaryLabel}>
				{t('disposition.builder.header')}
			</Text>

			<SimpleGrid cols={2}>
				<StatChip
					value={stats.total}
					label={t('disposition.summary.totalNodes')}
				/>
				<StatChip
					value={stats.groups}
					label={t('disposition.summary.groups')}
				/>
				<StatChip
					value={stats.outcomes}
					label={t('disposition.summary.outcomes')}
				/>
				<StatChip
					value={stats.flagged}
					label={t('disposition.summary.flagged')}
					amber
				/>
			</SimpleGrid>

			{stats.flagged > 0 && (
				<Alert
					color='yellow'
					variant='light'
					icon={<IconAlertTriangle size={16} />}
					radius='md'
					className={styles.warningAlert}
				>
					<Text size='xs'>
						{t('disposition.summary.warningBanner', { count: stats.flagged })}
					</Text>
				</Alert>
			)}

			{nodes.length === 0 && (
				<Text size='xs' c='dimmed' ta='center' className={styles.emptyHint}>
					{t('disposition.builder.emptyDescription')}
				</Text>
			)}
		</Stack>
	);
};

const CatalogNodeInspector: React.FC<{
	node: DispositionNode;
	parentNode: DispositionNode | null;
}> = ({ node, parentNode }) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const selectSubtree = useDispositionBuilderStore(
		(state) => state.selectSubtree
	);
	const childCount = getActiveChildren(node).length;
	const outcomeCount = getActiveLeafIds(node).length;
	const isLeaf = childCount === 0;

	return (
		<Stack gap='md' className={styles.catalogPreview}>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Group gap='sm' wrap='nowrap'>
					<ThemeIcon variant='light' color='gray' size='lg'>
						{isLeaf ? (
							<IconFileDescription size={18} />
						) : (
							<IconFolder size={18} />
						)}
					</ThemeIcon>
					<div>
						<Text fw={650}>{node.name}</Text>
						<Text size='xs' c='dimmed'>
							{isLeaf
								? t('disposition.tree.outcomeType')
								: t('disposition.tree.groupType')}
						</Text>
					</div>
				</Group>
				<Badge color='gray' variant='light'>
					{t('disposition.tree.excluded')}
				</Badge>
			</Group>

			<div className={styles.previewSection}>
				<Text size='xs' fw={600} c='dimmed'>
					{t('disposition.nodeForm.descriptionLabel')}
				</Text>
				<Text size='sm'>
					{node.description?.trim()
						? node.description
						: t('disposition.nodeForm.noDescription')}
				</Text>
			</div>

			<Group gap='xs'>
				{parentNode && (
					<Badge variant='light' color='gray'>
						{t('disposition.detailPanel.parent')}: {parentNode.name}
					</Badge>
				)}
				{!isLeaf && (
					<Badge variant='light' color='blue'>
						{t('disposition.tree.groupContents', {
							children: childCount,
							outcomes: outcomeCount,
						})}
					</Badge>
				)}
			</Group>

			<Alert color='blue' variant='light'>
				<Text size='xs'>
					{isLeaf
						? t('disposition.tree.addLeafDescription')
						: t('disposition.tree.addGroupDescription', {
								count: outcomeCount,
							})}
				</Text>
			</Alert>

			<Button
				variant='light'
				color='green'
				leftSection={<IconPlus size={16} />}
				onClick={() => selectSubtree(node.id)}
			>
				{isLeaf
					? t('disposition.tree.addOutcome')
					: t('disposition.tree.addGroup')}
			</Button>
		</Stack>
	);
};

const BuilderInspector: React.FC<BuilderInspectorProps> = ({
	selectedNode,
	parentNode,
	onDeselect,
}) => {
	const { flowJson } = useDispositionBuilderStore();

	if (!selectedNode) {
		return <BuilderSummary />;
	}

	// Always read the node from flowJson to get the latest values (behaviors may have changed)
	const flowNode = findNodeById(
		flowJson?.dispositionNodes ?? [],
		selectedNode.id
	);

	// Keep excluded catalog nodes inspectable and offer a clear add action.
	if (!flowNode) {
		return <CatalogNodeInspector node={selectedNode} parentNode={parentNode} />;
	}

	const isLeaf = isLeafNode(flowNode);

	if (isLeaf) {
		return (
			<DispositionNodeForm
				key={flowNode.id}
				node={flowNode}
				parentNode={parentNode}
				onCancel={onDeselect}
				onSubmit={onDeselect}
			/>
		);
	}

	return <DispositionGroupPreview node={flowNode} />;
};

export default BuilderInspector;
