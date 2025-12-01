import { Card } from '@mantine/core';
import { Outlet } from 'react-router';
import Sidebar from '../Sidebar';
import { Header } from '../Header';
import { useScrollEffect } from '../../hooks/useScrollEffect';
import styles from './Layout.module.css';

export default function Layout() {
	// Enable scroll-based UI effects
	useScrollEffect();

	return (
		<div className={styles.layout}>
			<div className={styles.container}>
				<aside className={styles.navbar}>
					<Sidebar />
				</aside>
				<div className={styles.content}>
					<header className={styles.header}>
						<Card withBorder className={styles.headerCard}>
							<Header />
						</Card>
					</header>
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
