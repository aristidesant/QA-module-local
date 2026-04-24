import React from 'react';
import { ActionIcon, Box, Group, Paper, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconFolder,
	IconPlus,
	IconHierarchy3,
	IconPointFilled,
	IconChevronRight,
	IconChevronDown,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import styles from './DispositionCatalogMenuItem.module.css';

interface Props {
	node: DispositionNode;
	onAdd: (node: DispositionNode) => void;
	onAddGroup?: (node: DispositionNode) => void;
	isCollapsible?: boolean;
	isCollapsed?: boolean;
	onToggleCollapse?: () => void;
}

const DispositionCatalogMenuItem: React.FC<Props> = ({
	node,
	onAdd,
	onAddGroup,
	isCollapsible,
	isCollapsed,
	onToggleCollapse,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const hasChildren = Array.isArray(node.children) && node.children.length > 0;
	const nodeStyle = getNodeStyle(node, 0);

	return (
		<Paper withBorder radius='md' className={styles.item}>
			<Group justify='space-between' align='center' gap='xs' wrap='nowrap'>
				<Group gap='xs' wrap='nowrap' style={{ flex: 1, minWidth: 0 }}>
					{isCollapsible ? (
						<ActionIcon
							variant='subtle'
							color='gray'
							size='xs'
							onClick={onToggleCollapse}
							aria-label={
								isCollapsed
									? t('disposition.catalog.expand')
									: t('disposition.catalog.collapse')
							}
						>
							{isCollapsed ? (
								<IconChevronRight size={14} />
							) : (
								<IconChevronDown size={14} />
							)}
						</ActionIcon>
					) : (
						<Box w={22} />
					)}
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
					<Box className={styles.textContent}>
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
						<Tooltip label={t('disposition.catalog.addAll')} withArrow>
							<ActionIcon
								variant='subtle'
								color='teal'
								onClick={() => onAddGroup(node)}
								aria-label={t('disposition.catalog.addAllAria')}
								size='sm'
							>
								<IconHierarchy3 size={14} />
							</ActionIcon>
						</Tooltip>
					) : null}
					<Tooltip label={t('disposition.catalog.addToFlow')} withArrow>
						<ActionIcon
							variant='filled'
							color='blue'
							onClick={() => onAdd(node)}
							aria-label={t('disposition.catalog.addToFlowAria')}
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
