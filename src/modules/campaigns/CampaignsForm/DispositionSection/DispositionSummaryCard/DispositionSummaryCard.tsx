import React from 'react';
import { Alert, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import DispositionViewer from '../DispositionViewer';
import styles from './DispositionSummaryCard.module.css';

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
		const isLeaf = !node.children || node.children.length === 0;
		if (isLeaf) {
			outcomes++;
		} else {
			groups++;
			node.children!.forEach(walk);
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
	isFlagged?: boolean;
}

const StatChip: React.FC<StatChipProps> = ({
	value,
	label,
	isFlagged = false,
}) => {
	const active = isFlagged && value > 0;
	return (
		<div className={styles.statChip}>
			<Text
				className={styles.statValue}
				data-flagged={active ? 'true' : 'false'}
			>
				{value}
			</Text>
			<Text
				className={styles.statLabel}
				data-flagged={active ? 'true' : 'false'}
			>
				{label}
			</Text>
		</div>
	);
};

interface DispositionSummaryCardProps {
	flow: DispositionFlowModel;
}

const DispositionSummaryCard: React.FC<DispositionSummaryCardProps> = ({
	flow,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const nodes = flow?.flowJson?.dispositionNodes ?? [];
	const stats = computeFlowStats(nodes);

	return (
		<Stack gap='md'>
			<Paper withBorder className={styles.statsBar} p='md' radius='md'>
				<SimpleGrid cols={{ base: 2, sm: 4 }}>
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
						isFlagged
					/>
				</SimpleGrid>
			</Paper>

			{stats.flagged > 0 && (
				<Alert
					color='yellow'
					variant='light'
					icon={<IconAlertTriangle size={18} />}
					radius='md'
					className={styles.warningBanner}
				>
					{t('disposition.summary.warningBanner', { count: stats.flagged })}
				</Alert>
			)}

			<DispositionViewer flow={flow} />
		</Stack>
	);
};

export default DispositionSummaryCard;
