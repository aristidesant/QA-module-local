import { IconBell, IconChevronDown } from '@tabler/icons-react';
import { ActionIcon, Divider, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import UserMenu from '../UserMenu';
import ClientSwitcherModal from '../ClientSwitcherModal';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import styles from './Header.module.css';

export const Header: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useSessionStore();
	const { isImpersonating } = useImpersonationState();
	const client = user?.client || null;
	const [switcherOpened, { open: openSwitcher, close: closeSwitcher }] =
		useDisclosure(false);

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>
				<div className={styles.headerLeft}>
					{client && (
						<Tooltip
							label={
								isImpersonating
									? client.name
									: t('userMenu.clientSwitcher.tooltip')
							}
							position='bottom'
							withArrow
						>
							<div
								className={`${styles.clientBadge} ${!isImpersonating ? styles.clientBadgeClickable : ''}`}
								title={client.name}
								onClick={isImpersonating ? undefined : openSwitcher}
								role={isImpersonating ? undefined : 'button'}
								tabIndex={isImpersonating ? undefined : 0}
								onKeyDown={
									isImpersonating
										? undefined
										: (e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													openSwitcher();
												}
											}
								}
							>
								<div className={styles.clientAvatar}>
									{client.name?.slice(0, 2).toUpperCase()}
								</div>
								<div className={styles.clientInfo}>
									<Text size='sm' fw={700} className={styles.clientName}>
										{client.name}
									</Text>
								</div>
								{!isImpersonating && (
									<IconChevronDown size={14} className={styles.clientChevron} />
								)}
							</div>
						</Tooltip>
					)}
				</div>
				<div className={styles.headerRight}>
					<ActionIcon radius={'xl'} size={'md'} variant='subtle'>
						<IconBell />
					</ActionIcon>
					<Divider orientation='vertical' />
					<UserMenu />
				</div>
			</div>

			<ClientSwitcherModal opened={switcherOpened} onClose={closeSwitcher} />
		</header>
	);
};
