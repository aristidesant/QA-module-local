import React from 'react';
import { UnstyledButton, Text, Badge } from '@mantine/core';
import styles from './CampaignConfigurationPromptEditModal.module.css';

interface PromptMenuItemProps {
	typeId: number;
	label: string;
	isActive: boolean;
	onClick: () => void;
	isDrafted: boolean;
	lines: number;
}

const PromptMenuItem: React.FC<PromptMenuItemProps> = ({
	typeId,
	label,
	isActive,
	onClick,
	isDrafted,
}) => {
	return (
		<UnstyledButton
			onClick={onClick}
			className={styles.menuItem}
			data-active={isActive}
			aria-pressed={isActive}
			data-testid={`prompt-menu-item-${typeId}`}
		>
			<div className={styles.menuItemHeader}>
				<span className={styles.statusDot} data-filled={isDrafted} />
				<Text size='xs' className={styles.menuTitle}>
					{label}
				</Text>
			</div>
			{isDrafted && (
				<Badge size='xs' variant='light' color='blue' radius='sm'>
					Drafted
				</Badge>
			)}
		</UnstyledButton>
	);
};

export default PromptMenuItem;
