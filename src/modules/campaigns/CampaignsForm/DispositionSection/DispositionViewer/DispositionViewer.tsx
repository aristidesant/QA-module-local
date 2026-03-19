import React, { useState } from 'react';
import {
	Card,
	Text,
	Group,
	Tooltip,
	Flex,
	Divider,
	Stack,
	ActionIcon,
	Badge,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconClock,
	IconPhoneOff,
	IconPhoneX,
	IconChevronDown,
	IconChevronRight,
	IconFolder,
	IconFileDescription,
} from '@tabler/icons-react';
import styles from './DispositionViewer.module.css';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle, isLeafNode } from '~/utils/dispositionNodeStyles';
import { useCampaignsStore } from '~/stores/campaignsStore';
import NodeDetailPanel from '~/modules/campaigns/CampaignsForm/DispositionSection/NodeDetailPanel';

interface DispositionViewerProps {
	flow: DispositionFlowModel;
}

interface NodeViewerProps {
	node: DispositionNode;
	parentNode?: DispositionNode;
	level?: number;
}

const NodeViewer: React.FC<NodeViewerProps> = ({
	node,
	parentNode,
	level = 0,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const { setRightComponent } = useCampaignsStore();
	const [isExpanded, setIsExpanded] = useState(true);
	const isLeaf = isLeafNode(node);
	const nodeStyle = getNodeStyle(node, level);
	const hasChildren = !isLeaf;
	const isClickable = isLeaf;
	const childCount = node.children?.length || 0;
	const levelIndent = level * 16;
	const cardOffset = level > 0 ? Math.min(levelIndent, 80) : 0;
	const nodeTypeLabel = hasChildren
		? t('disposition.viewer.group')
		: t('disposition.viewer.outcome');

	const handleNodeClick = (e: React.MouseEvent) => {
		if (!isClickable) return;
		e.stopPropagation();
		setRightComponent(<NodeDetailPanel node={node} parentNode={parentNode} />);
	};

	const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (hasChildren) {
			setIsExpanded(!isExpanded);
		}
	};

	const cardStyle: React.CSSProperties = cardOffset
		? ({ '--node-offset': `${cardOffset}px` } as React.CSSProperties)
		: {};

	const innerStyle: React.CSSProperties = {
		'--node-indent': `${Math.max(cardOffset - 12, 0)}px`,
	} as React.CSSProperties;

	const isDoNotCall = Boolean(node.doNotCall ?? node.do_not_call);

	return (
		<>
			<div
				className={`${styles.nodeCard} ${isClickable ? styles.clickable : styles.nonClickable}`}
				tabIndex={isClickable ? 0 : -1}
				aria-label={t('disposition.viewer.nodeAria', { name: node.name })}
				data-level={level}
				style={cardStyle}
				onClick={handleNodeClick}
				onKeyDown={(e) => {
					if (!isClickable) return;
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						setRightComponent(
							<NodeDetailPanel node={node} parentNode={parentNode} />
						);
					}
				}}
			>
				<div className={styles.nodeInner} style={innerStyle}>
					<div className={styles.nodeLead}>
						<span
							className={styles.statusPill}
							data-type={nodeStyle}
							aria-hidden='true'
						/>
						<div className={styles.nodeToggleArea}>
							{hasChildren ? (
								<ActionIcon
									size='sm'
									variant='subtle'
									className={styles.chevronIcon}
									aria-label={
										isExpanded
											? t('disposition.nodeEditor.collapse')
											: t('disposition.nodeEditor.expand')
									}
									onClick={handleToggle}
								>
									{isExpanded ? (
										<IconChevronDown size={18} />
									) : (
										<IconChevronRight size={18} />
									)}
								</ActionIcon>
							) : (
								<span className={styles.chevronPlaceholder} />
							)}
						</div>
					</div>

					<div className={styles.nodeContent}>
						<div className={styles.nodeHeader}>
							<div className={styles.nodeTitle}>
								<span className={styles.nodeIcon} aria-hidden='true'>
									{isLeaf ? (
										<IconFileDescription
											size={18}
											color='var(--mantine-color-blue-6)'
										/>
									) : (
										<IconFolder
											size={18}
											color='var(--mantine-color-yellow-7)'
										/>
									)}
								</span>
								<Text className={styles.nodeName} size='sm' fw={600}>
									{node.name}
								</Text>
							</div>
							<div className={styles.nodeBadges}>
								<Badge size='xs' variant='light' color='blue' radius='sm'>
									{nodeTypeLabel}
								</Badge>
							</div>
						</div>
						<Text className={styles.nodeMetaText} size='xs'>
							{hasChildren
								? t('disposition.viewer.childOutcomes', { count: childCount })
								: t('disposition.viewer.terminalOutcome')}
						</Text>
					</div>

					<div className={styles.nodeAside}>
						<div className={styles.nodeIcons}>
							{isDoNotCall ? (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.doNotCall')}
								>
									<IconPhoneX
										size={16}
										color='var(--mantine-color-red-6)'
										aria-label={t('disposition.nodeEditor.doNotCall')}
									/>
								</Tooltip>
							) : null}
							{node?.isInvalidatesNumber && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.invalidatesNumber')}
								>
									<IconPhoneOff
										size={16}
										color='var(--mantine-color-red-6)'
										aria-label={t('disposition.nodeEditor.invalidatesNumber')}
									/>
								</Tooltip>
							)}
							{node?.requiresReschedule && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.requiresReschedule')}
								>
									<IconClock
										size={16}
										color='var(--mantine-color-orange-6)'
										aria-label={t('disposition.nodeEditor.requiresReschedule')}
									/>
								</Tooltip>
							)}
						</div>
					</div>
				</div>
			</div>

			{isExpanded &&
				node.children &&
				node.children.length > 0 &&
				node.children.map((child) => (
					<NodeViewer
						key={child.id}
						node={child}
						parentNode={node}
						level={level + 1}
					/>
				))}
		</>
	);
};

const DispositionViewer: React.FC<DispositionViewerProps> = ({ flow }) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const nodes = flow?.flowJson?.dispositionNodes ?? [];

	if (!nodes || nodes.length === 0) {
		return <Text>{t('disposition.viewer.noNodes')}</Text>;
	}

	return (
		<Card className={styles.viewer} withBorder>
			<Stack gap='xs'>
				<Group justify='space-between' align='center'>
					<Flex direction='column'>
						<Text fz='xs' c='dimmed' fw={700}>
							{t('disposition.viewer.nameHeader')}
						</Text>
						<Text className={styles.title}>{flow.flowJson.name}</Text>
					</Flex>
				</Group>
				<Divider />
				<div
					className={styles.nodesContainer}
					aria-label={t('disposition.viewer.nodesListAria')}
				>
					{nodes.map((node) => (
						<NodeViewer key={node.id} node={node} />
					))}
				</div>
			</Stack>
		</Card>
	);
};

export default DispositionViewer;
