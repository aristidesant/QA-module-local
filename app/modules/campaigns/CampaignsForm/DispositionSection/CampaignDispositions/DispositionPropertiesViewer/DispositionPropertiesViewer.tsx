import React from "react";
import {
  Text,
  Stack,
  Group,
  Paper,
  ThemeIcon,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconCircle,
  IconCheck,
  IconClock,
  IconX,
  IconCalendarEvent,
  IconHash,
  IconInfoCircle,
  IconSettings,
  IconClipboardData,
} from "@tabler/icons-react";
import classes from "./DispositionPropertiesViewer.module.css";
import type { DispositionStatusModel } from "~/models/DispositionCatalogModels";

interface DispositionPropertiesViewerProps {
  status: DispositionStatusModel;
}

const PropertyItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | boolean | number;
  color?: string;
}> = ({ icon, label, value, color = "blue" }) => {
  const displayValue = React.useMemo(() => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value.toString();
  }, [value]);

  const getBooleanColor = (val: boolean) => {
    return val ? "green" : "red";
  };

  const iconColor = typeof value === "boolean" ? getBooleanColor(value) : color;

  return (
    <Group
      gap="sm"
      align="center"
      wrap="nowrap"
      className={classes.propertyItem}
    >
      <ThemeIcon variant="light" size="sm" color={iconColor}>
        {icon}
      </ThemeIcon>
      <Box flex={1} miw={0}>
        <Text size="xs" fw={500} c="dimmed" mb={1} truncate>
          {label}
        </Text>
        <Text size="sm" fw={600} c="dark" truncate>
          {displayValue}
        </Text>
      </Box>
    </Group>
  );
};

const DispositionPropertiesViewer: React.FC<
  DispositionPropertiesViewerProps
> = ({ status }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={classes.container}>
      <Stack gap="md">
        {/* Header */}
        <Box className={classes.header}>
          <Stack align="center" gap="sm">
            <ThemeIcon
              variant="light"
              size="xl"
              color={status.isActive ? "blue" : "gray"}
            >
              <IconClipboardData size={32} />
            </ThemeIcon>
            <Stack gap={2} align="center">
              <Text size="xl" fw={700} ta="center">
                {status.name}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Disposition Properties
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* Description Card */}
        {status.description && (
          <Paper p="md" className={classes.descriptionCard}>
            <Stack gap="sm">
              <Group gap="sm" align="center">
                <ThemeIcon variant="light" size="sm" color="blue">
                  <IconSettings size={16} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                  Description
                </Text>
              </Group>
              <Text size="sm" c="dark" lh={1.5}>
                {status.description}
              </Text>
            </Stack>
          </Paper>
        )}

        {/* Properties Card */}
        <Paper p="md" className={classes.propertiesCard}>
          <Stack gap="sm">
            <Group gap="sm" align="center" mb="xs">
              <ThemeIcon variant="light" size="sm" color="blue">
                <IconInfoCircle size={16} />
              </ThemeIcon>
              <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                Properties
              </Text>
            </Group>

            <Stack>
              <PropertyItem
                icon={<IconClock size={16} />}
                label="Requires Reschedule"
                value={status.requiresReschedule}
              />

              <PropertyItem
                icon={<IconX size={16} />}
                label="Invalidates Number"
                value={status.isInvalidatesNumber}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Metadata Card */}
        <Paper p="md" className={classes.metadataCard}>
          <Stack gap="md">
            <Group gap="sm" align="center">
              <ThemeIcon variant="light" size="sm" color="gray">
                <IconCalendarEvent size={16} />
              </ThemeIcon>
              <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                Metadata
              </Text>
            </Group>

            <Stack gap="md">
              <PropertyItem
                icon={<IconCalendarEvent size={16} />}
                label="Created At"
                value={formatDate(status.createdAt)}
                color="green"
              />

              <PropertyItem
                icon={<IconCalendarEvent size={16} />}
                label="Updated At"
                value={formatDate(status.updatedAt)}
                color="blue"
              />
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default DispositionPropertiesViewer;
