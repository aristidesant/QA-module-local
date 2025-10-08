import {
	IconLayoutDashboard,
	IconListDetails,
	IconPhoneCall,
	IconTools,
	IconRobot,
	IconLibrary,
	IconCheckupList,
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import styles from './Sidebar.module.css';

export type MenuItem = {
	label: string;
	icon: ReactNode;
	to: string;
	exact?: boolean;
	opened?: boolean;
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
		label: 'Agents',
		icon: <IconRobot size={20} className={styles.menuIcon} />,
		to: '/agents',
	},
	{
		label: 'Conversations',
		icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
		to: '/conversations',
	},
];

export const maintenanceItems: MenuItem[] = [
	{
		label: 'Outcomes',
		icon: <IconCheckupList size={20} className={styles.menuIcon} />,
		to: '/outcomes',
	},
	{
		label: 'Knowledge Bases',
		icon: <IconLibrary size={20} className={styles.menuIcon} />,
		to: '/knowledge-bases',
	},
	{
		label: 'Tools',
		icon: <IconTools size={20} className={styles.menuIcon} />,
		to: '/tools',
	},
	{
		label: 'Prompter',
		icon: <IconLibrary size={20} className={styles.menuIcon} />,
		to: '/prompter',
	},
];
