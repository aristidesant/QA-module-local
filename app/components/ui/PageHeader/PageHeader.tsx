import React from "react";
import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";
import { Breadcrumb } from "../Breadcrumb";
import type { BreadcrumbItem } from "../Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  const containerClasses = `${styles.container} ${className || ""}`;

  return (
    <div className={containerClasses}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};
