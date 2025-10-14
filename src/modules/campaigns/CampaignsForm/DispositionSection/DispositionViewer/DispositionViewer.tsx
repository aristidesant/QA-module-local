import React from 'react';
import {
	Card,
	Text,
	Box,
	Group,
	Tooltip,
	Flex,
	Divider,
	Stack,
} from '@mantine/core';
import { IconClock, IconPhoneOff } from '@tabler/icons-react';
import styles from './DispositionViewer.module.css';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle, isLeafNode } from '~/utils/dispositionNodeStyles';
import { useCampaignsStore } from '~/stores/campaignsStore';
import NodeDetailPanel from '~/modules/campaigns/CampaignsForm/DispositionSection/NodeDetailPanel';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';

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
	const { setRightComponent } = useCampaignsStore();
	const isLeaf = isLeafNode(node);
	const nodeStyle = getNodeStyle(node, level);
	const hasChildren = !isLeaf;
	const isClickable = isLeaf; // Only leaf nodes are clickable

	const handleNodeClick = (e: React.MouseEvent) => {
		if (!isClickable) return; // Ignore clicks on parents
		e.stopPropagation();
		setRightComponent(<NodeDetailPanel node={node} parentNode={parentNode} />);
	};

	return (
		<>
			<Box
				key={node.id}
				role={isClickable ? 'button' : 'group'}
				aria-label={`Outcome node: ${node.name}`}
				tabIndex={isClickable ? 0 : -1}
				className={`${styles.nodeViewer} ${styles[nodeStyle]} ${
					isClickable ? styles.clickable : styles.nonClickable
				} ${hasChildren ? styles.parentNode : styles.leafNode} ${
					hasChildren ? styles.disabledNode : ''
				}`}
				style={{
					marginLeft: level > 0 ? `${level * 16 + 8}px` : '0px',
					width: level > 0 ? `calc(100% - ${level * 16 + 8}px)` : '100%',
					position: 'relative',
				}}
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
				aria-disabled={!isClickable}
			>
				{/* Connection line for child nodes */}
				{level > 0 && (
					<>
						<div className={styles.connectionLine} />
						<div className={styles.connectionDot} />
					</>
				)}

				{/* Status indicator dot */}
				<div className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`} />

				<Group
					justify='space-between'
					style={{ flex: 1 }}
					wrap='nowrap'
					gap='sm'
				>
					<Group gap='xs' wrap='nowrap' style={{ minWidth: 0, flex: 1 }}>
						<Text
							size={level === 0 ? 'md' : 'sm'}
							fw={level === 0 ? 600 : 500}
							className={`${styles.nodeText} ${
								hasChildren ? styles.disabledText : ''
							}`}
							truncate
							title={node.name}
						>
							{node.name}
						</Text>
					</Group>

					<Group gap={6} wrap='nowrap'>
						{node?.isInvalidatesNumber && (
							<Tooltip withArrow label='Invalidates number'>
								<IconPhoneOff size={16} color='var(--mantine-color-red-6)' />
							</Tooltip>
						)}
						{node?.requiresReschedule && (
							<Tooltip withArrow label='Requires reschedule'>
								<IconClock size={16} color={'var(--mantine-color-orange-6)'} />
							</Tooltip>
						)}
					</Group>
				</Group>
			</Box>

			{/* Render children with increased indentation */}
			{node.children &&
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
	const nodes = flow?.flowJson?.dispositionNodes ?? [];
	const dispositionLabel = useDispositionLabel();

	if (!nodes || nodes.length === 0) {
		return <Text>{dispositionLabel('No disposition nodes found.')}</Text>;
	}

	return (
		<Card className={styles.viewer} withBorder>
			<Stack gap={'xs'}>
				<Group justify='space-between' align='center'>
					<Flex direction={'column'}>
						<Text fz='xs' c='dimmed' fw={700}>
							NAME
						</Text>
						<Text className={styles.title}>{flow.flowJson.name}</Text>
					</Flex>
				</Group>
				<Divider />
				<Box
					className={styles.nodesContainer}
					aria-label={dispositionLabel('Outcome nodes list')}
				>
					{nodes.map((node) => (
						<NodeViewer key={node.id} node={node} />
					))}
				</Box>
			</Stack>
		</Card>
	);
};

export default DispositionViewer;
