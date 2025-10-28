import React from 'react';
import { ActionIcon, Box, Group, Paper, Text, Tooltip } from '@mantine/core';
import {
	IconFolder,
	IconPlus,
	IconHierarchy3,
	IconPointFilled,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import styles from './DispositionCatalogMenuItem.module.css';

interface Props {
	node: DispositionNode;
	onAdd: (node: DispositionNode) => void;
	onAddGroup?: (node: DispositionNode) => void;
}

const DispositionCatalogMenuItem: React.FC<Props> = ({
	node,
	onAdd,
	onAddGroup,
}) => {
	const hasChildren = Array.isArray(node.children) && node.children.length > 0;
	const nodeStyle = getNodeStyle(node, 0);

	return (
		<Paper withBorder radius='md' className={styles.item}>
			<Group justify='space-between' align='center' gap='xs' wrap='nowrap'>
				<Group gap='xs' wrap='nowrap' style={{ flex: 1, minWidth: 0 }}>
					<IconPointFilled
						size={10}
						className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`}
					/>
					<Box className={styles.iconWrapper}>
						{hasChildren ? (
							<IconFolder
								size={12}
								className={styles.iconFolder}
								stroke={1.5}
							/>
						) : (
							<IconHierarchy3
								size={12}
								className={styles.iconLeaf}
								stroke={1.5}
							/>
						)}
					</Box>
					<Box className={styles.textContent} style={{ minWidth: 0, flex: 1 }}>
						<Tooltip
							label={
								node.description ? (
									<Box>
										<Text fw={600} size='xs'>
											{node.name}
										</Text>
										<Text size='xs' mt={2}>
											{node.description}
										</Text>
									</Box>
								) : (
									node.name
								)
							}
							withArrow
							multiline
							maw={300}
						>
							<Text fw={hasChildren ? 600 : 500} className={styles.nodeName}>
								{node.name}
							</Text>
						</Tooltip>
					</Box>
				</Group>

				<Group gap={4} wrap='nowrap' className={styles.actions}>
					{hasChildren && onAddGroup ? (
						<Tooltip label='Add all' withArrow>
							<ActionIcon
								variant='subtle'
								color='teal'
								onClick={() => onAddGroup(node)}
								aria-label='Add disposition and all children'
								size='sm'
							>
								<IconHierarchy3 size={14} />
							</ActionIcon>
						</Tooltip>
					) : null}
					<Tooltip label='Add to flow' withArrow>
						<ActionIcon
							variant='filled'
							color='blue'
							onClick={() => onAdd(node)}
							aria-label='Add disposition to flow'
							size='sm'
						>
							<IconPlus size={14} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>
		</Paper>
	);
};

export default DispositionCatalogMenuItem;
