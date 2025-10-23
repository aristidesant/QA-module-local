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
	disabled?: boolean;
	onAdd: (node: DispositionNode) => void;
	onAddGroup?: (node: DispositionNode) => void;
}

const DispositionCatalogMenuItem: React.FC<Props> = ({
	node,
	disabled = false,
	onAdd,
	onAddGroup,
}) => {
	const hasChildren = Array.isArray(node.children) && node.children.length > 0;
	const nodeStyle = getNodeStyle(node, 0);

	return (
		<Paper
			withBorder
			radius='md'
			className={`${styles.item} ${disabled ? styles.itemDisabled : ''}`}
		>
			<Group justify='space-between' align='center' gap='sm' wrap='nowrap'>
				<Group gap='sm' wrap='nowrap'>
					<IconPointFilled
						size={12}
						className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`}
					/>
					<Box className={styles.iconWrapper}>
						{hasChildren ? (
							<IconFolder
								size={16}
								className={styles.iconFolder}
								stroke={1.5}
							/>
						) : (
							<IconHierarchy3
								size={16}
								className={styles.iconLeaf}
								stroke={1.5}
							/>
						)}
					</Box>
					<Box className={styles.textContent}>
						<Tooltip
							label={node.description || node.name}
							withArrow
							disabled={!node.description}
						>
							<Text fw={hasChildren ? 600 : 500} className={styles.nodeName}>
								{node.name}
							</Text>
						</Tooltip>
					</Box>
				</Group>

				<Group gap='xs' wrap='nowrap' className={styles.actions}>
					{hasChildren && onAddGroup ? (
						<Tooltip label='Add all' withArrow>
							<ActionIcon
								variant='subtle'
								color='teal'
								onClick={() => onAddGroup(node)}
								aria-label='Add disposition and all children'
								disabled={false}
							>
								<IconHierarchy3 size={16} />
							</ActionIcon>
						</Tooltip>
					) : null}
					<Tooltip label='Add to flow' withArrow>
						<ActionIcon
							variant='filled'
							color='blue'
							onClick={() => onAdd(node)}
							aria-label='Add disposition to flow'
							disabled={disabled}
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>
		</Paper>
	);
};

export default DispositionCatalogMenuItem;
