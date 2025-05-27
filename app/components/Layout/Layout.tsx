import { AppShell } from "@mantine/core";
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

      <AppShell
        header={{ height: 70 }}
        navbar={{
          width: 280,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        layout="alt"
        padding="0"
      >
        <AppShell.Header>
          <Header opened={opened} toggle={toggle} />
        </AppShell.Header>

        <AppShell.Navbar p="xs" className={styles.navbar}>
          <Sidebar />
        </AppShell.Navbar>

        <AppShell.Main>
          <div className={styles.main}>
            <Outlet context={{ token }} />
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
