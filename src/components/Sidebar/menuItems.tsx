import {
  IconLayoutDashboard,
  IconFolder,
  IconSettings,
  IconListDetails,
  IconPhoneCall,
  IconTools,
  IconCheckupList,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import styles from "./Sidebar.module.css";

export type MenuItem = {
  label: string;
  icon: ReactNode;
  to: string;
  exact?: boolean;
  opened?: boolean;
};

export const menuItems: MenuItem[] = [
  {
    label: "Overview",
    icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
    to: "/",
    exact: true,
  },
  {
    label: "Agents",
    icon: <IconFolder size={20} className={styles.menuIcon} />,
    to: "/agents",
  },
  {
    label: "Prompt Generator",
    icon: <IconSettings size={20} className={styles.menuIcon} />,
    to: "/prompt-generator",
  },
  {
    label: "Campaigns",
    icon: <IconListDetails size={20} className={styles.menuIcon} />,
    to: "/campaigns",
  },
  {
    label: "Conversations",
    icon: <IconPhoneCall size={20} className={styles.menuIcon} />,
    to: "/conversations",
  },
  {
    label: "Tools",
    icon: <IconTools size={20} className={styles.menuIcon} />,
    to: "/tools",
  },
];

export const maintenanceItems: MenuItem[] = [
  {
    label: "Prompt Form",
    icon: <IconSettings size={20} className={styles.menuIcon} />,
    to: "/prompt-form",
  },
  {
    label: "Dispositions",
    icon: <IconCheckupList size={20} className={styles.menuIcon} />,
    to: "/dispositions",
  },
];
