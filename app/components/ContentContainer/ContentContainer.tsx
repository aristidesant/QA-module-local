import React from "react";
import type { ReactNode } from "react";
import styles from "./ContentContainer.module.css";

export interface ContentContainerProps {
  children: ReactNode;
  rightSection?: ReactNode;
}

export const ContentContainer = ({
  children,
  rightSection,
}: ContentContainerProps) => (
  <div className={styles.container}>
    <div className={styles.main}>{children}</div>
    {rightSection && (
      <aside className={styles.rightSection}>{rightSection}</aside>
    )}
  </div>
);
