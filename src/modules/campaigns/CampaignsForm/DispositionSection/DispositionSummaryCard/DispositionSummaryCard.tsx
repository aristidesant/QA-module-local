import React from 'react';
import { Alert, Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconHierarchy3 } from '@tabler/icons-react';
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
		<div className={styles.summarySurface}>
			<div className={styles.summaryHeader}>
				<Group gap='sm' wrap='nowrap'>
					<div className={styles.flowIcon} aria-hidden='true'>
						<IconHierarchy3 size={18} />
					</div>
					<div className={styles.flowIdentity}>
						<Text size='xs' c='dimmed' fw={600}>
							{t('disposition.viewer.flowLabel')}
						</Text>
						<Text className={styles.flowName}>{flow.flowJson.name}</Text>
					</div>
				</Group>
				{flow.flowJson.type && (
					<Badge variant='light' color='gray' radius='sm'>
						{flow.flowJson.type === 'INBOUND'
							? t('disposition.catalog.typeInbound')
							: t('disposition.catalog.typeOutbound')}
					</Badge>
				)}
			</div>

			<div className={styles.statsBar}>
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
			</div>

			<Stack gap='sm' className={styles.flowContent}>
				{stats.flagged > 0 && (
					<Alert
						color='yellow'
						variant='light'
						icon={<IconAlertTriangle size={18} />}
						radius='sm'
						className={styles.warningBanner}
					>
						{t('disposition.summary.warningBanner', { count: stats.flagged })}
					</Alert>
				)}

				<DispositionViewer flow={flow} showHeader={false} />
			</Stack>
		</div>
	);
};

export default DispositionSummaryCard;
