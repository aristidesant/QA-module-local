import React from "react";
import { Divider, Paper, Stack } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconFolder,
  IconSettings,
  IconListDetails,
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router";
import styles from "./Sidebar.module.css";

const menuItems: MenuItem[] = [
  {
    label: "Overview",
    icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
    to: "/",
    exact: true,
  },
  {
    label: "Agents",
    icon: <IconFolder size={20} className={styles.menuIcon} />,
    to: "/agent",
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
];

const maintenanceItems: MenuItem[] = [
  {
    label: "Prompt Form",
    icon: <IconSettings size={20} className={styles.menuIcon} />,
    to: "/prompt-form",
  },
];

export const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <nav className={styles.sidebar}>
      <Stack className={styles.menuList} gap="md">
        {menuItems.map((item) => renderMenuItem({ ...item, onClose }))}
        <Divider label="Maintenance" labelPosition="left" />
        {maintenanceItems.map((item) => renderMenuItem({ ...item, onClose }))}
      </Stack>
    </nav>
  );
};

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  to: string;
  exact?: boolean;
  onClose?: () => void;
};

export const renderMenuItem = ({
  label,
  icon,
  to,
  exact,
  onClose,
}: MenuItem) => {
  const location = useLocation();

  const isSelected = exact
    ? location.pathname === to
    : location.pathname.startsWith(to) && to !== "/";
  return (
    <NavLink
      key={label}
      to={to}
      className={({ isActive }) =>
        [styles.menuItem, isSelected ? styles.menuItemSelected : ""].join(" ")
      }
      end={!!exact}
      onClick={onClose}
    >
      {icon}
      <span className={styles.menuText}>{label}</span>
    </NavLink>
  );
};
