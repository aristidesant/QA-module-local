import React from "react";
import { Card, Paper, Group, Text, ThemeIcon } from "@mantine/core";
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
}

const ContainerCard: React.FC<ContainerCardProps> = ({
  title,
  subtitle,
  icon: Icon = IconBox,
  rightSection,
  children,
  withBorder = true,
  className = "",
}) => {
  return (
    <Card
      className={`${classes.containerCard} ${className}`}
      shadow="lg"
      radius="xl"
      withBorder={withBorder}
      padding="xl"
    >
      {(title || subtitle || rightSection) && (
        <div className={classes.header}>
          <ThemeIcon size={60} radius="xl" color="blue" variant="light">
            <Icon className={classes.icon} stroke={1.5} />
          </ThemeIcon>
          <div className={classes.headerMain}>
            {title && <span className={classes.title}>{title}</span>}
            {subtitle && <Text className={classes.subtitle}>{subtitle}</Text>}
          </div>
          {rightSection && (
            <div className={classes.rightSection}>{rightSection}</div>
          )}
        </div>
      )}
      <div className={classes.content}>{children}</div>
    </Card>
  );
};

export default ContainerCard;
