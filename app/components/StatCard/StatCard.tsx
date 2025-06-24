import { Text, Group, ThemeIcon, Paper } from "@mantine/core";
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
  /** Color theme for the icon */
  color?: string;
  /** Optional class name */
  className?: string;
}

export const StatCard = ({
  value,
  label,
  description,
  icon,
  color = "blue",
  className,
}: StatCardProps) => {
  return (
    <Paper withBorder p="md" radius="md" className={`${classes.card} ${className || ''}`}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" className={classes.label}>
            {label}
          </Text>
          <Text fw={700} size="xl" className={classes.value}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" className={classes.description}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon variant="light" color={color} size={44} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
};

export default StatCard;
