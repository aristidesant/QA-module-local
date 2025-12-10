import React from 'react';
import {
	Text as MantineText,
	Badge,
	ScrollArea,
	Stack,
	UnstyledButton,
} from '@mantine/core';
import styles from './ModalMenu.module.css';

export interface ModalMenuItem {
	id: string;
	label: string;
	icon?: React.FC<any>;
}

interface ModalMenuProps {
	items: ModalMenuItem[];
	activeId: string;
	onSelect: (id: string) => void;
	title?: string;
}

export const ModalMenu: React.FC<ModalMenuProps> = ({
	items,
	activeId,
	onSelect,
	title = 'Sections',
}) => {
	return (
		<div className={styles.menuColumn}>
			<div className={styles.menuHeader}>
				<MantineText size='xs' fw={500} c='dimmed'>
					{title}
				</MantineText>
				<Badge size='xs' variant='light' color='gray' radius='sm'>
					{items.length}
				</Badge>
			</div>
			<ScrollArea className={styles.menuScroll} type='auto'>
				<Stack gap={2}>
					{items.map((item) => (
						<UnstyledButton
							key={item.id}
							className={styles.menuItem}
							data-active={activeId === item.id}
							onClick={() => onSelect(item.id)}
						>
							<div className={styles.menuItemHeader}>
								{item.icon && <item.icon size={16} />}
								<div className={styles.menuText}>
									<MantineText className={styles.menuTitle}>
										{item.label}
									</MantineText>
								</div>
							</div>
						</UnstyledButton>
					))}
				</Stack>
			</ScrollArea>
		</div>
	);
};
