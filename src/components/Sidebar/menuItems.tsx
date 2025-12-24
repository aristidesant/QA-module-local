import {
	IconLayoutDashboard,
	IconListDetails,
	IconPhoneCall,
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
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
		label: 'sidebar.items.overview',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/',
		exact: true,
		module: ModuleEnum.DASHBOARD,
	},
	{
		label: 'sidebar.items.campaigns',
		icon: <IconListDetails size={20} className={styles.menuIcon} />,
		to: '/campaigns',
		module: ModuleEnum.CAMPAIGNS,
	},
	{
		label: 'sidebar.items.conversations',
		icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
		to: '/conversations',
		module: ModuleEnum.CONVERSATIONS,
	},
];
