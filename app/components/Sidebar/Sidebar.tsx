import React from "react";
import { Text, Stack, Divider } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconFolder,
  IconSettings,
  IconListDetails,
  IconUsersGroup,
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router";
import styles from "./Sidebar.module.css";
import UserCard from "../UserCard";
import Logo from "../Logo";

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
  {
    label: "Contacts",
    icon: <IconUsersGroup size={20} className={styles.menuIcon} />,
    to: "/contacts",
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
      <Stack className={styles.menuList} gap="lg">
        <Logo />
        <Divider />
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" px="md" mb="xs">
            MENU
          </Text>
          {menuItems.map((item) => renderMenuItem({ ...item, onClose }))}
        </Stack>

        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" px="md" mb="xs">
            MAINTENANCE
          </Text>
          {maintenanceItems.map((item) => renderMenuItem({ ...item, onClose }))}
        </Stack>

        <UserCard />
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
