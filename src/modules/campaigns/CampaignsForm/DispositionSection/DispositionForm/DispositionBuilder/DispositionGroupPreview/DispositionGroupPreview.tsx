import React from 'react';
import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import styles from './DispositionGroupPreview.module.css';

type DispositionGroupPreviewProps = {
	node: DispositionNode;
};

const DispositionGroupPreview: React.FC<DispositionGroupPreviewProps> = ({
	node,
}) => {
	const renderNode = (
		current: DispositionNode,
		level: number = 0
	): React.ReactNode => {
		const nodeStyle = getNodeStyle(current, level);
		return (
			<React.Fragment key={current.id}>
				<Box
					className={`${styles.nodeRow} ${styles[nodeStyle]}`}
					style={{ paddingLeft: `${level * 16}px` }}
				>
					<div className={styles.connector} />
					<Box className={styles.content}>
						<Text
							fw={level === 0 ? 600 : 500}
							className={styles.nodeName}
							size={level === 0 ? 'md' : 'sm'}
						>
							{current.name}
						</Text>
						{current.description ? (
							<Text size='xs' c='dimmed'>
								{current.description}
							</Text>
						) : null}
						<Group gap='xs' mt={current.description ? 'xs' : 4}>
							{current.requiresReschedule ? (
								<Badge color='orange' variant='light' size='xs'>
									Requires reschedule
								</Badge>
							) : null}
							{current.isInvalidatesNumber ? (
								<Badge color='red' variant='light' size='xs'>
									Do not retry
								</Badge>
							) : null}
							{current.isFinal ? (
								<Badge color='green' variant='light' size='xs'>
									Final outcome
								</Badge>
							) : null}
						</Group>
					</Box>
				</Box>
				{current.children && current.children.length > 0
					? current.children.map((child) => renderNode(child, level + 1))
					: null}
			</React.Fragment>
		);
	};

	return (
		<Stack gap='xs' className={styles.previewContainer}>
			{renderNode(node, 0)}
		</Stack>
	);
};

export default DispositionGroupPreview;
