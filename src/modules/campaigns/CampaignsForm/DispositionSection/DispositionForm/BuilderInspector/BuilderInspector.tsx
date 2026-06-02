import React, { useMemo } from 'react';
import { Alert, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import DispositionNodeForm from '../DispositionBuilder/DispositionNodeForm';
import DispositionGroupPreview from '../DispositionBuilder/DispositionGroupPreview';
import { isLeafNode } from '~/utils/dispositionNodeStyles';
import { findNodeById } from '~/utils/dragDropUtils';
import styles from './BuilderInspector.module.css';

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
			<Text
				size='xs'
				fw={700}
				tt='uppercase'
				c='dimmed'
				className={styles.summaryLabel}
			>
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

	// Node was deselected or removed — show summary
	if (!flowNode) {
		return <BuilderSummary />;
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
