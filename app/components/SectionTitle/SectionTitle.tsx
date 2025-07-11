import React, { type ReactNode } from "react";
import { Text, Title, type TitleOrder } from "@mantine/core";
import styles from "./SectionTitle.module.css";

export interface SectionTitleProps {
  /** The title text */
  title: string | ReactNode;
  /** Optional description text */
  description?: string | ReactNode;
  /** The heading level (1-6) */
  order?: TitleOrder;
  /** Optional icon to display before the title */
  icon?: React.ReactNode;
  /** Additional class name for the root element */
  className?: string;
  /** Show the accent line */
  withLine?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  order = 6,
  icon,
  className = "",
  withLine = true,
}) => {
  return (
    <div className={`${styles.sectionTitleWrapper} ${className}`}>
      {withLine && <div className={styles.sectionLine} />}
      <div className={styles.sectionTitleContent}>
        <div className={styles.titleWrapper}>
          {icon && <span className={styles.iconWrapper}>{icon}</span>}
          <Title order={order} className={styles.sectionTitle}>
            {title}
          </Title>
        </div>
        {description && (
          <Text className={styles.sectionDescription}>{description}</Text>
        )}
      </div>
    </div>
  );
};

export default SectionTitle;
