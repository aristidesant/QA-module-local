import React from 'react';
import { UnstyledButton, Text, Badge } from '@mantine/core';
import styles from './CampaignConfigurationPromptEditModal.module.css';
import { useTranslation } from 'react-i18next';

interface PromptMenuItemProps {
	typeId: number;
	label: string;
	isActive: boolean;
	onClick: () => void;
	isDrafted: boolean;
	hasValue: boolean;
}

const PromptMenuItem: React.FC<PromptMenuItemProps> = ({
	typeId,
	label,
	isActive,
	onClick,
	isDrafted,
	hasValue,
}) => {
	const { t } = useTranslation('campaigns');
	return (
		<UnstyledButton
			onClick={onClick}
			className={styles.menuItem}
			data-active={isActive}
			aria-pressed={isActive}
			data-testid={`prompt-menu-item-${typeId}`}
		>
			<div className={styles.menuItemHeader}>
				<span className={styles.statusDot} data-filled={hasValue} />
				<Text size='xs' className={styles.menuTitle}>
					{label}
				</Text>
			</div>
			<Badge
				size='xs'
				variant='light'
				color={isDrafted ? 'blue' : 'gray'}
				radius='sm'
				className={styles.menuStatusBadge}
			>
				{isDrafted
					? t('form.agent.prompt.editor.status.drafted')
					: hasValue
						? t('form.agent.prompt.editor.status.saved')
						: t('form.agent.prompt.editor.status.empty')}
			</Badge>
		</UnstyledButton>
	);
};

export default PromptMenuItem;
