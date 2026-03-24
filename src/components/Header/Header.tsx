import { useTranslation } from 'react-i18next';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
	const { t } = useTranslation('common');

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>
				<div className={styles.headerLeft} />
				<div className={styles.headerRight}>
					<Tooltip
						label={t('header.notifications')}
						position='bottom'
						withArrow
					>
						<ActionIcon
							radius='xl'
							size='md'
							variant='subtle'
							aria-label={t('header.notifications')}
						>
							<IconBell />
						</ActionIcon>
					</Tooltip>
				</div>
			</div>
		</header>
	);
};
