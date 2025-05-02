import React from "react";
import { Paper, Stack } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconFolder,
  IconSettings,
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router";
import styles from "./Sidebar.module.css";

const menuItems = [
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
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Paper className={styles.sidebar} radius={0} shadow="sm" withBorder>
      <nav>
        <Stack className={styles.menuList} gap="md">
          {menuItems.map(({ label, icon, to, exact }) => {
            const isSelected = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== "/";
            return (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  [
                    styles.menuItem,
                    isSelected ? styles.menuItemSelected : "",
                  ].join(" ")
                }
                end={!!exact}
              >
                {icon}
                <span className={styles.menuText}>{label}</span>
              </NavLink>
            );
          })}
        </Stack>
      </nav>
    </Paper>
  );
};
