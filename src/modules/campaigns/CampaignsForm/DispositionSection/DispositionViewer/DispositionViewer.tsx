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
	IconPhonePause,
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
	/** Tone inherited from the branch root; colors the connector guides. */
	branchTone?: string;
}

const NodeViewer: React.FC<NodeViewerProps> = ({
	node,
	parentNode,
	level = 0,
	branchTone,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const { setRightComponent } = useCampaignsStore();
	const [isExpanded, setIsExpanded] = useState(true);
	const isLeaf = isLeafNode(node);
	const hasChildren = !isLeaf;
	const isClickable = isLeaf;
	const childCount = node.children?.length || 0;
	// Branch root decides the tone; it flows down to every descendant guide.
	const tone = level === 0 ? getNodeStyle(node, 0) : (branchTone ?? 'default');
	const nodeTypeLabel = hasChildren
		? t('disposition.viewer.group')
		: t('disposition.viewer.outcome');

	const isDoNotCall = Boolean(node.doNotCall ?? node.do_not_call);
	const isAbandoned = Boolean(node.isAbandoned);

	const openDetail = () => {
		setRightComponent(<NodeDetailPanel node={node} parentNode={parentNode} />);
	};

	const handleNodeClick = (e: React.MouseEvent) => {
		if (!isClickable) return;
		e.stopPropagation();
		openDetail();
	};

	const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (hasChildren) {
			setIsExpanded(!isExpanded);
		}
	};

	return (
		<div className={styles.nodeShell} data-level={level}>
			<div
				className={styles.row}
				data-tone={tone}
				data-clickable={isClickable ? 'true' : 'false'}
				tabIndex={isClickable ? 0 : -1}
				role={isClickable ? 'button' : undefined}
				aria-label={t('disposition.viewer.nodeAria', { name: node.name })}
				onClick={handleNodeClick}
				onKeyDown={(e) => {
					if (!isClickable) return;
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openDetail();
					}
				}}
			>
				<div className={styles.rowToggle}>
					{hasChildren ? (
						<ActionIcon
							size='sm'
							variant='subtle'
							className={styles.chevron}
							aria-label={
								isExpanded
									? t('disposition.nodeEditor.collapse')
									: t('disposition.nodeEditor.expand')
							}
							onClick={handleToggle}
						>
							{isExpanded ? (
								<IconChevronDown size={16} />
							) : (
								<IconChevronRight size={16} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.chevronSpacer} />
					)}
				</div>

				<span className={styles.icon} data-tone={tone} aria-hidden='true'>
					{isLeaf ? (
						<IconFileDescription size={15} stroke={1.9} />
					) : (
						<IconFolder size={15} stroke={1.9} />
					)}
				</span>

				<Text className={styles.name} size='sm' fw={600}>
					{node.name}
				</Text>

				<div className={styles.rowAside}>
					<div className={styles.hoverMeta}>
						<Text className={styles.metaText} size='xs'>
							{hasChildren
								? t('disposition.viewer.childOutcomes', { count: childCount })
								: t('disposition.viewer.terminalOutcome')}
						</Text>
						<Badge size='xs' variant='light' color='blue' radius='sm'>
							{nodeTypeLabel}
						</Badge>
					</div>

					<div className={styles.flags}>
						{isDoNotCall && (
							<Tooltip withArrow label={t('disposition.nodeEditor.doNotCall')}>
								<IconPhoneX
									size={16}
									color='var(--mantine-color-red-6)'
									aria-label={t('disposition.nodeEditor.doNotCall')}
								/>
							</Tooltip>
						)}
						{isAbandoned && (
							<Tooltip withArrow label={t('disposition.nodeEditor.abandoned')}>
								<IconPhonePause
									size={16}
									color='var(--mantine-color-orange-6)'
									aria-label={t('disposition.nodeEditor.abandoned')}
								/>
							</Tooltip>
						)}
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

			{isExpanded && node.children && node.children.length > 0 && (
				<div className={styles.nodeChildren} data-tone={tone}>
					{node.children.map((child) => (
						<NodeViewer
							key={child.id}
							node={child}
							parentNode={node}
							level={level + 1}
							branchTone={tone}
						/>
					))}
				</div>
			)}
		</div>
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
