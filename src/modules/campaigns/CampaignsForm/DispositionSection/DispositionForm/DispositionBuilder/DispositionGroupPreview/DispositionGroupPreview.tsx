import React, { useMemo } from 'react';
import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCircleOff,
	IconFlag3,
	IconHierarchy3,
	IconRepeat,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import styles from './DispositionGroupPreview.module.css';

type DispositionGroupPreviewProps = {
	node: DispositionNode;
};

type NodeStats = {
	total: number;
	final: number;
	reschedule: number;
	blocked: number;
	depth: number;
};

export const collectNodeStats = (
	current: DispositionNode,
	level: number = 0
): NodeStats => {
	let stats: NodeStats = {
		total: 1,
		final: current.isFinal ? 1 : 0,
		reschedule: current.requiresReschedule ? 1 : 0,
		blocked: current.isInvalidatesNumber ? 1 : 0,
		depth: level,
	};

	if (current.children && current.children.length > 0) {
		current.children.forEach((child) => {
			const childStats = collectNodeStats(child, level + 1);
			stats = {
				total: stats.total + childStats.total,
				final: stats.final + childStats.final,
				reschedule: stats.reschedule + childStats.reschedule,
				blocked: stats.blocked + childStats.blocked,
				depth: Math.max(stats.depth, childStats.depth),
			};
		});
	}

	return stats;
};

export const NodeItem: React.FC<{
	current: DispositionNode;
	level?: number;
}> = ({ current, level = 0 }) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const nodeStyle = getNodeStyle(current, level);
	const childCount = current.children?.length ?? 0;
	const badgeLabel =
		level === 0
			? t('disposition.groupPreview.rootGroup')
			: t('disposition.groupPreview.level', { level });

	return (
		<li key={current.id} className={styles.nodeItem}>
			<Box
				className={`${styles.nodeCard} ${styles[nodeStyle]} ${
					level === 0 ? styles.nodeCardRoot : ''
				}`}
				style={{ '--indent-level': level } as React.CSSProperties}
			>
				<Group
					className={styles.nodeHeader}
					align='flex-start'
					justify='space-between'
					gap='xs'
				>
					<Box className={styles.nodeHeaderContent}>
						<Text
							fw={level === 0 ? 600 : 500}
							className={styles.nodeTitle}
							size={level === 0 ? 'sm' : 'xs'}
						>
							{current.name}
						</Text>
						<Text size='xs' c='dimmed' className={styles.nodeMeta}>
							{childCount > 0
								? t('disposition.groupPreview.linkedOutcomes', {
										count: childCount,
									})
								: t('disposition.groupPreview.leafOutcome')}
						</Text>
					</Box>
					<Badge color='gray' variant='light' size='xs'>
						{badgeLabel}
					</Badge>
				</Group>

				{current.description ? (
					<Text size='xs' c='dimmed' className={styles.nodeDescription}>
						{current.description}
					</Text>
				) : null}

				<Group gap='xs' wrap='wrap' className={styles.nodeBadges}>
					{current.requiresReschedule ? (
						<Badge color='orange' variant='light' size='xs'>
							{t('disposition.nodeForm.badges.reschedule')}
						</Badge>
					) : null}
					{current.isInvalidatesNumber ? (
						<Badge color='red' variant='light' size='xs'>
							{t('disposition.nodeForm.badges.noRetry')}
						</Badge>
					) : null}
					{current.isFinal ? (
						<Badge color='green' variant='light' size='xs'>
							{t('disposition.nodeForm.badges.final')}
						</Badge>
					) : null}
				</Group>
			</Box>

			{current.children && current.children.length > 0 ? (
				<ul className={styles.nodeChildren}>
					{current.children.map((child) => (
						<NodeItem key={child.id} current={child} level={level + 1} />
					))}
				</ul>
			) : null}
		</li>
	);
};

const DispositionGroupPreview: React.FC<DispositionGroupPreviewProps> = ({
	node,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const stats = useMemo(() => collectNodeStats(node), [node]);
	const totalLevels = stats.depth + 1;

	const statItems = [
		{
			label: t('disposition.groupPreview.stats.total'),
			value: stats.total,
			icon: <IconHierarchy3 size={16} stroke={1.6} />,
			iconClassName: styles.statIconPrimary,
		},
		{
			label: t('disposition.groupPreview.stats.final'),
			value: stats.final,
			icon: <IconFlag3 size={16} stroke={1.6} />,
			iconClassName: styles.statIconSuccess,
		},
		{
			label: t('disposition.groupPreview.stats.reschedule'),
			value: stats.reschedule,
			icon: <IconRepeat size={16} stroke={1.6} />,
			iconClassName: styles.statIconWarning,
		},
		{
			label: t('disposition.groupPreview.stats.noRetry'),
			value: stats.blocked,
			icon: <IconCircleOff size={16} stroke={1.6} />,
			iconClassName: styles.statIconDanger,
		},
	];

	return (
		<Stack gap='sm' className={styles.previewContainer}>
			<div className={styles.header}>
				<Group gap='xs' className={styles.headerTitle}>
					<IconHierarchy3 size={18} stroke={1.6} />
					<Text fw={600} size='sm'>
						{node.name}
					</Text>
				</Group>
				<Text size='xs' c='dimmed' className={styles.headerDescription}>
					{t('disposition.groupPreview.stats.summary', {
						count: stats.total,
						levels: totalLevels,
					})}
				</Text>
			</div>

			<div className={styles.statsGrid}>
				{statItems.map((item) => (
					<div key={item.label} className={styles.statCard}>
						<div className={`${styles.statIcon} ${item.iconClassName}`}>
							{item.icon}
						</div>
						<div className={styles.statContent}>
							<Text size='xs' c='dimmed'>
								{item.label}
							</Text>
							<Text size='sm' fw={600}>
								{item.value}
							</Text>
						</div>
					</div>
				))}
			</div>

			<ul className={styles.nodeList}>
				<NodeItem current={node} level={0} />
			</ul>
		</Stack>
	);
};

export default DispositionGroupPreview;
