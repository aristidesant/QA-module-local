import { IconMenu2 } from "@tabler/icons-react";
import UserMenu from "../UserMenu";
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
          <button
            className={styles.burger}
            onClick={toggle}
            aria-label="Open menu"
            type="button"
          >
            <IconMenu2 size={24} />
          </button>
        </div>
        <div className={styles.headerRight}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
// ...existing code...
