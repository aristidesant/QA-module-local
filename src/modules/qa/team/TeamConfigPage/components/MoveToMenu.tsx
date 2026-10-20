import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, type MenuProps } from '@mantine/core';
import { IconUserOff, IconUsersGroup } from '@tabler/icons-react';
import { UNASSIGNED_SUPERVISOR_ID } from '../../constants';

export interface MoveTarget {
	id: string;
	label: string;
}

interface MoveToMenuProps {
	targets: MoveTarget[];
	/** Left out of the list. */
	currentTargetId: string;
	onSelect: (targetId: string) => void;
	/** The trigger (ActionIcon or Button). */
	children: React.ReactNode;
	position?: MenuProps['position'];
}

/** The "Move to…" menu shared by each row and the selection bar. */
export const MoveToMenu: React.FC<MoveToMenuProps> = ({
	targets,
	currentTargetId,
	onSelect,
	children,
	position,
}) => {
	const { t } = useTranslation('qa.team');

	return (
		<Menu position={position ?? 'bottom-end'} withinPortal shadow='md'>
			<Menu.Target>{children}</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>{t('teamConfig.row.moveTo')}</Menu.Label>
				{targets
					.filter((target) => target.id !== currentTargetId)
					.map((target) => (
						<Menu.Item
							key={target.id}
							leftSection={
								target.id === UNASSIGNED_SUPERVISOR_ID ? (
									<IconUserOff size={14} />
								) : (
									<IconUsersGroup size={14} />
								)
							}
							onClick={() => onSelect(target.id)}
						>
							{target.label}
						</Menu.Item>
					))}
			</Menu.Dropdown>
		</Menu>
	);
};

export default MoveToMenu;
