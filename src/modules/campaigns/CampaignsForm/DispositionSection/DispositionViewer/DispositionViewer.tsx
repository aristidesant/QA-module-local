import React, { useState } from 'react';
import {
	ActionIcon,
	Badge,
	Divider,
	Flex,
	Group,
	Stack,
	Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconChevronDown,
	IconChevronRight,
	IconFileDescription,
	IconFolder,
} from '@tabler/icons-react';
import styles from './DispositionViewer.module.css';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle, isLeafNode } from '~/utils/dispositionNodeStyles';
import { useCampaignsStore } from '~/stores/campaignsStore';
import NodeDetailPanel from '~/modules/campaigns/CampaignsForm/DispositionSection/NodeDetailPanel';
import OutcomeNodeFlags from '../OutcomeNodeFlags';

interface DispositionViewerProps {
	flow: DispositionFlowModel;
	interactive?: boolean;
	showHeader?: boolean;
}

interface NodeViewerProps {
	node: DispositionNode;
	parentNode?: DispositionNode;
	level?: number;
	branchTone?: string;
	interactive: boolean;
}

const NodeViewer: React.FC<NodeViewerProps> = ({
	node,
	parentNode,
	level = 0,
	branchTone,
	interactive,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const { setRightComponent } = useCampaignsStore();
	const [isExpanded, setIsExpanded] = useState(true);
	const isLeaf = isLeafNode(node);
	const hasChildren = !isLeaf;
	const isClickable = interactive && isLeaf;
	const childCount = node.children?.length ?? 0;
	const tone = level === 0 ? getNodeStyle(node, 0) : (branchTone ?? 'default');

	const openDetail = () => {
		if (!isClickable) return;
		setRightComponent(<NodeDetailPanel node={node} parentNode={parentNode} />);
	};

	return (
		<div className={styles.nodeShell} role='none'>
			<div
				className={styles.row}
				data-tone={tone}
				data-clickable={isClickable ? 'true' : 'false'}
				tabIndex={isClickable ? 0 : -1}
				role='treeitem'
				aria-level={level + 1}
				aria-expanded={hasChildren ? isExpanded : undefined}
				aria-label={t('disposition.viewer.nodeAria', { name: node.name })}
				onClick={openDetail}
				onKeyDown={(event) => {
					if (!isClickable) return;
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
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
							aria-label={t(
								isExpanded
									? 'disposition.nodeEditor.collapse'
									: 'disposition.nodeEditor.expand'
							)}
							onClick={(event) => {
								event.stopPropagation();
								setIsExpanded((value) => !value);
							}}
						>
							{isExpanded ? (
								<IconChevronDown size={15} />
							) : (
								<IconChevronRight size={15} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.chevronSpacer} />
					)}
				</div>

				<span className={styles.icon} aria-hidden='true'>
					{isLeaf ? (
						<IconFileDescription size={15} stroke={1.9} />
					) : (
						<IconFolder size={15} stroke={1.9} />
					)}
				</span>

				<Text className={styles.name} size='sm' fw={level === 0 ? 650 : 500}>
					{node.name}
				</Text>

				<div className={styles.rowAside}>
					<OutcomeNodeFlags node={node} size={14} />
					<Badge
						size='sm'
						variant='light'
						color={hasChildren ? 'gray' : 'green'}
						radius='sm'
					>
						{hasChildren
							? t('disposition.viewer.childOutcomes', { count: childCount })
							: t('disposition.viewer.outcome')}
					</Badge>
				</div>
			</div>

			{isExpanded && node.children && node.children.length > 0 && (
				<div className={styles.nodeChildren} data-tone={tone} role='group'>
					{node.children.map((child) => (
						<NodeViewer
							key={child.id}
							node={child}
							parentNode={node}
							level={level + 1}
							branchTone={tone}
							interactive={interactive}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const DispositionViewer: React.FC<DispositionViewerProps> = ({
	flow,
	interactive = true,
	showHeader = true,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const nodes = flow.flowJson?.dispositionNodes ?? [];

	if (nodes.length === 0) {
		return (
			<div className={styles.emptyState}>
				<Text size='sm' c='dimmed'>
					{t('disposition.viewer.noNodes')}
				</Text>
			</div>
		);
	}

	return (
		<div className={styles.viewer}>
			<Stack gap='xs'>
				{showHeader && (
					<>
						<Group justify='space-between' align='center'>
							<Flex direction='column' gap={2}>
								<Text fz='xs' c='dimmed' fw={600}>
									{t('disposition.viewer.flowLabel')}
								</Text>
								<Text className={styles.title}>{flow.flowJson.name}</Text>
							</Flex>
						</Group>
						<Divider />
					</>
				)}
				<div
					className={styles.nodesContainer}
					role='tree'
					aria-label={t('disposition.viewer.nodesListAria')}
				>
					{nodes.map((node) => (
						<NodeViewer key={node.id} node={node} interactive={interactive} />
					))}
				</div>
			</Stack>
		</div>
	);
};

export default DispositionViewer;
