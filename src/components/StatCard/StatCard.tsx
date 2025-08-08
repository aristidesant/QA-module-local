import React from "react";
import { Text, Paper } from "@mantine/core";
import type { IconProps } from "@tabler/icons-react";
import type { ReactElement } from "react";
import classes from "./StatCard.module.css";

export interface StatCardProps {
  /** Main value to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Optional description text */
  description?: string | React.ReactNode;
  /** Icon to display */
  icon: ReactElement<IconProps>;
  /** Color theme for the card */
  color?: string;
  /** Optional class name */
  className?: string;
  /** Show loading state */
  loading?: boolean;
}

export const StatCard = ({
  value,
  label,
  description,
  icon,
  color = "blue",
  className,
  loading = false,
}: StatCardProps) => {
  if (loading) {
    return (
      <Paper
        withBorder
        radius="md"
        p="md"
        className={`${classes.card} ${classes.loading} ${className || ""}`}
      >
        <div className={classes.loadingContent} />
      </Paper>
    );
  }

  return (
    <Paper
      withBorder
      radius="md"
      className={`${classes.card} ${className || ""}`}
      style={
        {
          "--card-accent": `var(--mantine-color-${color}-6)`,
        } as React.CSSProperties
      }
    >
      <div className={classes.accentBar} />

      <div className={classes.content}>
        <div className={classes.cardHeader}>
          <div className={classes.iconWrapper}>
            {React.cloneElement(icon, { size: 16, stroke: 1.8 })}
          </div>
          <Text
            size="xs"
            fw={600}
            className={classes.label}
            lineClamp={2}
            title={typeof label === "string" ? label : undefined}
          >
            {label}
          </Text>
        </div>

        <div className={classes.textContent}>
          <Text size="xl" fw={700} className={classes.value}>
            {value}
          </Text>

          {description && (
            <Text size="xs" c="dimmed" className={classes.description}>
              {description}
            </Text>
          )}
        </div>
      </div>
    </Paper>
  );
};

export default StatCard;
