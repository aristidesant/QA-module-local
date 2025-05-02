import React from "react";
import type { TablerIcon } from "@tabler/icons-react";
import styles from "./AppError.module.css";

export type AppErrorProps = {
  message: string;
  headline?: string;
  icon: TablerIcon;
  className?: string;
};

const AppError: React.FC<AppErrorProps> = ({
  message,
  headline,
  icon: Icon,
  className,
}) => (
  <div className={`${styles.appError} ${className || ""}`}>
    <Icon className={styles.icon} size={48} stroke={1.5} />
    {headline && <h3 className={styles.headline}>{headline}</h3>}
    <span className={styles.message}>{message}</span>
  </div>
);

export default AppError;
