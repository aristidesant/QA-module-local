import React from "react";
import { Text, Stack, Divider, Tooltip } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconFolder,
  IconSettings,
  IconListDetails,
  IconPhoneCall,
  IconTools,
  IconCheckupList,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";
import styles from "./Sidebar.module.css";
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

const maintenanceItems: MenuItem[] = [
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

type SidebarProps = {
  onClose?: () => void;
  opened: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ onClose: _, opened }) => {
  return (
    <nav
      className={`${styles.sidebar} ${
        opened ? styles.sidebarExpanded : styles.sidebarCollapsed
      }`}
      aria-label="Main navigation"
      aria-expanded={opened}
    >
      <Stack className={styles.menuList} gap="lg">
        <div className={styles.logoWrapper}>
          <Logo compact={!opened} />
        </div>
        <Divider className={styles.divider} />
        <Stack gap="xs">
          {opened && (
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              px="md"
              mb="xs"
              className={styles.sectionHeader}
            >
              MENU
            </Text>
          )}
          {menuItems.map((item) => renderMenuItem({ ...item, opened }))}
        </Stack>
        <Stack gap="xs">
          {opened && (
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              px="md"
              mb="xs"
              className={styles.sectionHeader}
            >
              MAINTENANCE
            </Text>
          )}
          {maintenanceItems.map((item) => renderMenuItem({ ...item, opened }))}
        </Stack>
      </Stack>
    </nav>
  );
};

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  to: string;
  exact?: boolean;
  opened?: boolean;
};

export const renderMenuItem = ({
  label,
  icon,
  to,
  exact,
  opened = true,
}: MenuItem) => {
  const location = useLocation();

  const isSelected = exact
    ? location.pathname === to
    : location.pathname.startsWith(to) && to !== "/";
  return (
    <Link
      key={label}
      to={to}
      className={[
        styles.menuItem,
        isSelected ? styles.menuItemSelected : "",
        !opened ? styles.menuItemCollapsed : "",
      ].join(" ")}
      aria-current={isSelected ? "page" : undefined}
      tabIndex={0}
    >
      {opened ? (
        icon
      ) : (
        <Tooltip label={label} position="right" withArrow>
          <span>{icon}</span>
        </Tooltip>
      )}
      {opened && <span className={styles.menuText}>{label}</span>}
    </Link>
  );
};
