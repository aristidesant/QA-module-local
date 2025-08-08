import { Menu } from "@mantine/core";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import styles from "./UserMenu.module.css";
// import { useNavigate } from "react-router";
import logout from "~/utils/logout";
import { useSessionStore } from "~/stores/sessionStore";

export const UserMenu: React.FC = () => {
  const { user } = useSessionStore();
  const initials = user?.username?.slice(0, 2).toUpperCase();

  // const navigate = useNavigate();

  const handleLogout = () => {
    // Use centralized logout utility
    logout();
  };

  const fetcher = { state: "idle" } as const;

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <div
          className={styles.userMenu}
          tabIndex={0}
          role="button"
          aria-label="User menu"
        >
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.name}>{user?.username}</span>
            <span className={styles.role}>{user?.email}</span>
          </div>
          <span className={styles.chevron}>
            <IconChevronDown size={18} />
          </span>
        </div>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>Profile</Menu.Item>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          onClick={handleLogout}
          disabled={fetcher.state !== "idle"}
          leftSection={<IconLogout size={14} />}
        >
          {fetcher.state === "idle" ? "Logout" : "Logging out..."}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
