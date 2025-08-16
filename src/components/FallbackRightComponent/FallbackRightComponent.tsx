import React from "react";
import { Stack, Text, Title } from "@mantine/core";
import classes from "./FallbackRightComponent.module.css";
import { IconInfoCircle } from "@tabler/icons-react";

export interface FallbackRightComponentProps {
  /** Icon component from @tabler/icons-react (pass the component, not an element) */
  Icon?: React.ComponentType<any>;
  /** Short title shown prominently */
  title?: string;
  /** Longer description or guidance text */
  description?: React.ReactNode;
  /** Optional small action hint */
  actionText?: string;
  className?: string;
}

export const FallbackRightComponent: React.FC<FallbackRightComponentProps> = ({
  Icon = IconInfoCircle,
  title = "Nothing selected",
  description = "No item selected. Pick an entry from the list or create a new one to see details and actions.",
  actionText = "Choose or create an item to get started",
  className = "",
}) => {
  const IconComponent = Icon;

  return (
    <div className={`${classes.root} ${className}`.trim()}>
      <Stack align="center">
        <div className={classes.iconWrapper} aria-hidden role="img">
          <IconComponent size={56} stroke={1.5} />
        </div>

        <div className={classes.textGroup}>
          <Title order={4} className={classes.title}>
            {title}
          </Title>

          <div className={classes.description}>
            {typeof description === "string" ? (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            ) : (
              description
            )}
          </div>

          {actionText && (
            <div className={classes.action} aria-hidden>
              {actionText}
            </div>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default FallbackRightComponent;
