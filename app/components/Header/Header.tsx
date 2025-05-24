import { Burger, Group, Text, Tooltip, Box } from "@mantine/core";
import { NavLink } from "react-router";
import Logo from "../Logo";
import { IconBell, IconChevronDown, IconUser } from "@tabler/icons-react";
import styles from "./Header.module.css";

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            className={styles.burger}
            aria-label="Toggle navigation"
          />
          <Logo animated={true} />
        </div>

        <div className={styles.headerRight}>
          <Tooltip label="Notifications" position="bottom" withinPortal>
            <div className={styles.notificationIcon}>
              <IconBell size={20} stroke={1.5} />
              <span className={styles.notificationBadge}>2</span>
            </div>
          </Tooltip>

          <Group className={styles.userMenu}>
            <div
              className={styles.userAvatar}
              style={{ width: 32, height: 32 }}
            >
              <IconUser size={18} />
            </div>
            <div className={styles.userInfo}>
              <Text size="sm" fw={600} lh={1.3}>
                Admin
              </Text>
              <Text size="xs" c="dimmed" lh={1}>
                Administrator
              </Text>
            </div>
            <IconChevronDown size={14} color="gray" stroke={1.5} />
          </Group>
        </div>
      </div>
    </header>
  );
};
