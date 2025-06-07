import React from "react";
import type { ReactNode } from "react";
import styles from "./ContentContainer.module.css";

export interface ContentContainerProps {
  children: ReactNode;
  rightSection?: ReactNode;
  title?: string;
  description?: string;
}

export const ContentContainer = ({
  children,
  rightSection,
  title,
  description,
}: ContentContainerProps) => (
  <div className={styles.container}>
    <div className={styles.main}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
    {rightSection && (
      <aside className={styles.rightSection}>{rightSection}</aside>
    )}
  </div>
);
