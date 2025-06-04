import React, { type ReactNode } from "react";
import { Card, Text, Title } from "@mantine/core";
import styles from "./SectionCard.module.css";
import type { TablerIcon } from "@tabler/icons-react";

interface SectionCardProps {
  icon: TablerIcon;
  title: string | ReactNode;
  description?: string;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
  headerActions?: ReactNode;
  /** Control the gap between child elements in the content area */
  contentSpacing?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Background color for the card (default is white) */
  backgroundColor?: string;
  /** Optional ID for the section card */
  id?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className,
  footer,
  headerActions,
  contentSpacing = "md",
  backgroundColor,
  id,
}) => {
  // Convert spacing to pixel value if it's a string preset
  const getSpacingValue = (): string => {
    const spacingMap = {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    };

    if (typeof contentSpacing === "number") {
      return `${contentSpacing}px`;
    }

    return spacingMap[contentSpacing] || "1rem";
  };

  const contentStyle = {
    gap: getSpacingValue(),
    ...(backgroundColor ? { backgroundColor } : {}),
  };

  return (
    <Card
      id={id}
      style={backgroundColor ? { backgroundColor } : undefined}
      withBorder
      padding="xl"
      data-testid="section-card"
    >
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderContent}>
          <Icon className={styles.sectionIcon} />
          <div>
            <Title order={3} className={styles.sectionTitle}>
              {title}
            </Title>
            {description && (
              <Text className={styles.sectionDescription}>{description}</Text>
            )}
          </div>
        </div>
        {headerActions && (
          <div className={styles.headerActions}>{headerActions}</div>
        )}
      </div>
      <div className={styles.content} style={contentStyle}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
};

export default SectionCard;
