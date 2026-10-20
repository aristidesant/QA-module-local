import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Text } from '@mantine/core';
import { IconChevronDown, IconUserOff } from '@tabler/icons-react';
import { UNASSIGNED_SUPERVISOR_ID } from '../../constants';
import styles from '../TeamConfigPage.module.css';
import { MoveToMenu, type MoveTarget } from './MoveToMenu';

interface SelectionBarProps {
	count: number;
	targets: MoveTarget[];
	currentTargetId: string;
	onMove: (targetId: string) => void;
	onClear: () => void;
}

/** Bulk actions for the rows ticked in the members table. */
export const SelectionBar: React.FC<SelectionBarProps> = ({
	count,
	targets,
	currentTargetId,
	onMove,
	onClear,
}) => {
	const { t } = useTranslation('qa.team');
	if (count === 0) return null;

	return (
		<Paper radius='md' p='xs' className={styles.selectionBar}>
			<Group justify='space-between' wrap='wrap' gap='sm'>
				<Text size='sm' fw={600}>
					{t('teamConfig.selection.count', { count })}
				</Text>
				<Group gap='xs'>
					<MoveToMenu
						targets={targets}
						currentTargetId={currentTargetId}
						onSelect={onMove}
						position='bottom-start'
					>
						<Button
							size='xs'
							variant='filled'
							rightSection={<IconChevronDown size={14} />}
						>
							{t('teamConfig.selection.moveTo')}
						</Button>
					</MoveToMenu>
					{currentTargetId !== UNASSIGNED_SUPERVISOR_ID && (
						<Button
							size='xs'
							variant='light'
							color='gray'
							leftSection={<IconUserOff size={14} />}
							onClick={() => onMove(UNASSIGNED_SUPERVISOR_ID)}
						>
							{t('teamConfig.selection.unassign')}
						</Button>
					)}
					<Button size='xs' variant='subtle' color='gray' onClick={onClear}>
						{t('teamConfig.selection.clear')}
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};

export default SelectionBar;
