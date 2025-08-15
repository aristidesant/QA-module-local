import type { ReactNode } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import styles from "./ContentContainer.module.css";
import { Divider, Text, Title, ActionIcon, Tooltip, Flex } from "@mantine/core";

export interface ContentContainerProps {
  children: ReactNode;
  rightSection?: ReactNode;
  title?: string;
  titleRight?: ReactNode;
  description?: string;
  showBackButton?: boolean;
  rightSectionTitle?: ReactNode;

  onBackClick?: () => void;
}

export const ContentContainer = ({
  children,
  rightSection,
  title,
  description,
  showBackButton = false,
  rightSectionTitle,
  titleRight,
  onBackClick,
}: ContentContainerProps) => (
  <div className={styles.container}>
    <div className={styles.main}>
      {(title || description || showBackButton) && (
        <div className={styles.header}>
          <Flex gap={"xs"} align={"center"} justify={"space-between"}>
            <Flex gap={"xs"} align={"center"}>
              {showBackButton && (
                <Tooltip label="Back" position="bottom" withArrow>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    aria-label="Back"
                    onClick={onBackClick}
                    size="lg"
                  >
                    <IconArrowLeft size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              {(title || description) && (
                <Flex direction={"column"}>
                  {title && (
                    <Title c="dark" order={5}>
                      {title}
                    </Title>
                  )}
                  {description && (
                    <Text fz="xs" c="dimmed">
                      {description}
                    </Text>
                  )}
                </Flex>
              )}
            </Flex>
            {titleRight && titleRight}
          </Flex>
          <Divider mt="xs" className={styles.divider} />
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
    {rightSection && (
      <aside className={styles.rightSection}>
        {rightSectionTitle && <div>{rightSectionTitle}</div>}
        <div>{rightSection}</div>
      </aside>
    )}
  </div>
);
