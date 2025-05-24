import React from "react";
import { Card, Text, ThemeIcon, Badge } from "@mantine/core"; // Removed Divider
import { IconBox, type TablerIcon } from "@tabler/icons-react";
import classes from "./ContainerCard.module.css";

export interface ContainerCardProps {
  title?: React.ReactNode | string;
  subtitle?: string;
  icon?: TablerIcon;
  rightSection?: React.ReactNode;
  children: React.ReactNode;
  withBorder?: boolean;
  className?: string;
  variant?: "default" | "gradient" | "glass" | "minimal";
  size?: "sm" | "md" | "lg";
}

const ContainerCard: React.FC<ContainerCardProps> = ({
  title,
  subtitle,
  icon: Icon = IconBox,
  rightSection,
  children,
  withBorder = true,
  className = "",
  variant = "default",
  size = "md",
}) => {
  const cardClasses = [
    classes.containerCard,
    classes[variant],
    classes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      className={cardClasses}
      shadow="none"
      radius="xl"
      withBorder={false}
      padding={0}
    >
      <div className={classes.cardInner}>
        {(title || subtitle || rightSection) && (
          <div className={classes.header}>
            <div className={classes.iconContainer}>
              <ThemeIcon
                size={size === "sm" ? 48 : size === "lg" ? 72 : 60}
                radius="xl"
                className={classes.iconWrapper}
                variant="light"
              >
                <Icon className={classes.icon} stroke={1.5} />
              </ThemeIcon>
            </div>
            <div className={classes.headerContent}>
              {title && (
                <div className={classes.titleContainer}>
                  <h3 className={classes.title}>{title}</h3>
                </div>
              )}
              {subtitle && (
                <Text className={classes.subtitle} size="sm">
                  {subtitle}
                </Text>
              )}
            </div>
            {rightSection && (
              <div className={classes.rightSection}>{rightSection}</div>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </Card>
  );
};

export default ContainerCard;
