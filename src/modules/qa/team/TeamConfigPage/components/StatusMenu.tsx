import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Menu } from '@mantine/core';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import type { AgentStatus } from '../../types';
import styles from '../TeamConfigPage.module.css';

const STATUSES: AgentStatus[] = ['active', 'inactive'];

interface StatusMenuProps {
	status: AgentStatus;
	onChange: (status: AgentStatus) => void;
}

/** The status badge as a menu: click it to set another status on an agent or a supervisor. */
export const StatusMenu: React.FC<StatusMenuProps> = ({ status, onChange }) => {
	const { t } = useTranslation('qa.team');

	return (
		<Menu position='bottom-start' withinPortal shadow='md'>
			<Menu.Target>
				<Badge
					component='button'
					type='button'
					variant='light'
					color='gray'
					className={styles.statusBadge}
					aria-label={t('teamConfig.statusMenu.change')}
					rightSection={<IconChevronDown size={10} />}
				>
					{t(`status.${status}`)}
				</Badge>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>{t('teamConfig.statusMenu.change')}</Menu.Label>
				{STATUSES.map((option) => (
					<Menu.Item
						key={option}
						rightSection={option === status ? <IconCheck size={14} /> : null}
						onClick={() => option !== status && onChange(option)}
					>
						{t(`status.${option}`)}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

export default StatusMenu;
