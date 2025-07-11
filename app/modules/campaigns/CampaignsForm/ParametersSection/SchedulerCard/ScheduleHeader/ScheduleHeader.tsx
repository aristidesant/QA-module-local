import React from "react";
import {
  Box,
  Group,
  Text,
  Switch,
  ActionIcon,
  Menu,
  Flex,
} from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import styles from "./ScheduleHeader.module.css";

export interface ScheduleHeaderProps {
  isActive: boolean;
  timeRangeText: string;
  onChange: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  isActive,
  timeRangeText,
  onChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.container}>
      <Flex align={"center"} className={styles.titleContainer}>
        <Switch
          size="md"
          checked={isActive}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <Box>
          <Text fz="sm" fw={500}>
            Schedule
          </Text>
          <Text fz="xs" c="dimmed">
            Normal working hours
          </Text>
        </Box>
      </Flex>
      <div className={styles.timeInfo}>
        <Text className={styles.timeText}>{timeRangeText}</Text>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={14} />} onClick={onEdit}>
              Edit
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              onClick={onDelete}
              color="red"
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};

export default ScheduleHeader;
