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
      </div>
    </header>
  );
};
