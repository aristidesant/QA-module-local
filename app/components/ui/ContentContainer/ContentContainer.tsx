import React from "react";
import type { ReactNode } from "react";
import { Box } from "@mantine/core";
import styles from "./ContentContainer.module.css";

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightSection?: ReactNode;
  withHeader?: boolean;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  className,
  title,
  subtitle,
  rightSection,
  withHeader = !!title,
}) => {
  const containerClasses = `${styles.container} ${
    withHeader ? styles.containerWithHeader : ""
  } ${className || ""}`;

  return (
    <div className={containerClasses}>
      {withHeader && (
        <div className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          {rightSection && <div>{rightSection}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
