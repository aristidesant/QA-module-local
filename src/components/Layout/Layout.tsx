import { Outlet } from 'react-router';
import { Burger, Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import Sidebar from '../Sidebar';
import Logo from '../Logo';
import { useScrollEffect } from '../../hooks/useScrollEffect';
import styles from './Layout.module.css';
import { useSidebarStore } from '~/stores/sidebarStore';

export default function Layout() {
	useScrollEffect();
	const { t } = useTranslation('common');
	const { collapsed, mobileOpen, openMobile, closeMobile } = useSidebarStore();
	const isMobile = useMediaQuery('(max-width: 768px)', false, {
		getInitialValueInEffect: false,
	});

	return (
		<div className={styles.layout}>
			{/* Mobile top bar */}
			<div className={styles.mobileHeader}>
				<Burger
					opened={mobileOpen}
					onClick={mobileOpen ? closeMobile : openMobile}
					aria-label={t('sidebar.mobileMenuToggle')}
					size='sm'
					className={styles.burger}
				/>
				<Logo textOnly />
			</div>

			{/* Mobile sidebar drawer */}
			{isMobile && (
				<Drawer
					opened={mobileOpen}
					onClose={closeMobile}
					position='left'
					size={304}
					withCloseButton={false}
					padding={0}
					styles={{
						body: {
							height: '100%',
							padding: 0,
							display: 'flex',
							flexDirection: 'column',
						},
						content: { display: 'flex', flexDirection: 'column' },
					}}
					transitionProps={{
						duration: 250,
						timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
					}}
				>
					<Sidebar />
				</Drawer>
			)}

			{/* Desktop: sidebar + content */}
			<div className={styles.container}>
				{!isMobile && (
					<aside
						className={`${styles.navbar} ${collapsed ? styles.navbarCollapsed : ''}`}
					>
						<Sidebar />
					</aside>
				)}
				<div className={styles.content}>
					<main className={styles.mainWrapper}>
						<div className={styles.main}>
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
