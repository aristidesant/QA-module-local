import { Card } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router";
import Sidebar from "../Sidebar";
import { Header } from "../Header";
import { Notifications } from "@mantine/notifications";
import { useScrollEffect } from "../../hooks/useScrollEffect";
import styles from "./Layout.module.css";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();

  // Enable scroll-based UI effects
  useScrollEffect();

  return (
    <div className={styles.layout}>
      <Notifications
        position="top-right"
        className={styles.notifications}
        autoClose={4000}
      />
      <div className={styles.container}>
        <aside
          className={`${styles.navbar} ${
            opened ? styles.navbarExpanded : styles.navbarCollapsed
          }`}
        >
          <Sidebar onClose={toggle} opened={opened} />
        </aside>
        <div className={styles.content}>
          <header className={styles.header}>
            <Card withBorder className={styles.headerCard}>
              <Header opened={opened} toggle={toggle} />
            </Card>
          </header>
          <main className={styles.mainWrapper}>
            <div className={styles.main}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
