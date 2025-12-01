import {
	IconLayoutDashboard,
	IconListDetails,
	IconPhoneCall,
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import styles from './Sidebar.module.css';

export type MenuItem = {
	label: string;
	icon: ReactNode;
	to: string;
	exact?: boolean;
};

export const menuItems: MenuItem[] = [
	{
		label: 'Overview',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/',
		exact: true,
	},
	{
		label: 'Campaigns',
		icon: <IconListDetails size={20} className={styles.menuIcon} />,
		to: '/campaigns',
	},
	{
		label: 'Conversations',
		icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
		to: '/conversations',
	},
];
