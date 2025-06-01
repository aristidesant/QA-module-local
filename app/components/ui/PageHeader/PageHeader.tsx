import React from "react";
import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";
import { Card, Paper, ThemeIcon } from "@mantine/core";
import { Breadcrumb } from "../Breadcrumb";
import type { BreadcrumbItem } from "../Breadcrumb";
import { IconHome } from "@tabler/icons-react";

interface PageHeaderProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <Paper p={"xs"} shadow="xs" className={className}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <ThemeIcon color="teal" variant="white">
            <IconHome size={16} stroke={1.7} />
          </ThemeIcon>
          <Breadcrumb items={breadcrumbs} />
        </nav>
      )}
    </Paper>
  );
};
