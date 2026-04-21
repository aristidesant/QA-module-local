import {
	IconLayoutDashboard,
	IconListDetails,
	IconPhoneCall,
	IconFlask,
	IconTableExport,
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
	i18nNamespace?: string;
};

export const menuItems: MenuItem[] = [
	{
		label: 'sidebar.items.overview',
		icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
		to: '/',
		exact: true,
		module: ModuleEnum.DASHBOARD,
		i18nNamespace: 'overview',
	},
	{
		label: 'sidebar.items.campaigns',
		icon: <IconListDetails size={20} className={styles.menuIcon} />,
		to: '/campaigns',
		module: ModuleEnum.CAMPAIGNS,
		i18nNamespace: 'campaigns',
	},
	{
		label: 'sidebar.items.conversations',
		icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
		to: '/conversations',
		module: ModuleEnum.CONVERSATIONS,
	},
	{
		label: 'sidebar.items.agentTests',
		icon: <IconFlask size={20} className={styles.menuIcon} />,
		to: '/agent-tests',
		module: ModuleEnum.CAMPAIGNS,
		i18nNamespace: 'agent-tests',
	},
	{
		label: 'sidebar.items.reportTemplates',
		icon: <IconTableExport size={20} className={styles.menuIcon} />,
		to: '/report-templates',
		module: ModuleEnum.REPORTS,
		i18nNamespace: 'report-templates',
	},
];
