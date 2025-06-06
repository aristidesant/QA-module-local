import { Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./UserMenu.module.css";

export const UserMenu = () => {
  // Hardcoded prototype values
  const name = "Robert Salazar";
  const role = "Admin";
  const initials = "RS";

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
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{role}</span>
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
        <Menu.Item color="red">Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
