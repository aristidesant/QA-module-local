import React from "react";
import { Stack, Text, Title } from "@mantine/core";
import classes from "./RightSection.module.css";

interface RightSectionProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const RightSection: React.FC<RightSectionProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      <Stack gap="xs">
        <div>
          <Title order={5} className={classes.sectionTitle}>
            {title}
          </Title>
          {description && (
            <div className={classes.sectionDescription}>
              {typeof description === "string" ? (
                <Text size="xs" c="dimmed">
                  {description}
                </Text>
              ) : (
                description
              )}
            </div>
          )}
        </div>
        {children}
      </Stack>
    </div>
  );
};

export default RightSection;
