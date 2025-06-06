import { AppShell, Card } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useOutletContext } from "react-router";
import Sidebar from "../Sidebar";
import { Header } from "../Header";
import { Notifications } from "@mantine/notifications";
import { useScrollEffect } from "../../hooks/useScrollEffect";
import styles from "./Layout.module.css";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const { token } = useOutletContext<{ token: string }>();

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
        <aside className={styles.navbar}>
          <Sidebar onClose={toggle} />
        </aside>
        <div className={styles.content}>
          <header className={styles.header}>
            <Card withBorder className={styles.headerCard}>
              <Header opened={opened} toggle={toggle} />
            </Card>
          </header>
          <main className={styles.mainWrapper}>
            <div className={styles.main}>
              <Outlet context={{ token }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
