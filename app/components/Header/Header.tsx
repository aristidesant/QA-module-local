import { IconBell, IconMenu2, IconX } from "@tabler/icons-react";
import UserMenu from "../UserMenu";
import styles from "./Header.module.css";
import { ActionIcon, Divider } from "@mantine/core";
import { useSessionStore } from "~/stores/sessionStore";

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <button
            className={styles.burger}
            onClick={toggle}
            aria-label={opened ? "Close menu" : "Open menu"}
            aria-pressed={opened}
            type="button"
          >
            {opened ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
          {/* Add space between burger and any future navigation items */}
          <div style={{ width: "2rem" }} />
        </div>
        <div className={styles.headerRight}>
          <ActionIcon radius={"xl"} size={"lg"} variant="subtle">
            <IconBell />
          </ActionIcon>
          <Divider orientation="vertical" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
