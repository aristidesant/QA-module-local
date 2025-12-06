import {
	IconLayoutDashboard,
	IconListDetails,
	IconPhoneCall,
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
import styles from './Sidebar.module.css';

export type MenuItem = {
	label: string;
	icon: ReactNode;
	to: string;
	exact?: boolean;
	module: ModuleEnum;
	permission?: PermissionEnum;
};

export const menuItems: MenuItem[] = [
	{
		label: 'Overview',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/',
		exact: true,
		module: ModuleEnum.DASHBOARD,
	},
	{
		label: 'Campaigns',
		icon: <IconListDetails size={20} className={styles.menuIcon} />,
		to: '/campaigns',
		module: ModuleEnum.CAMPAIGNS,
	},
	{
		label: 'Conversations',
		icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
		to: '/conversations',
		module: ModuleEnum.CONVERSATIONS,
	},
];
