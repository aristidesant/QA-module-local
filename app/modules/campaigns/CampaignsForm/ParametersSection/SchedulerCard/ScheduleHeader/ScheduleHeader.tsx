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
import {
  IconChevronUp,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./ScheduleHeader.module.css";
import type { Scheduler } from "~/models/SchedulerModel";

export interface ScheduleHeaderProps {
  schedule?: Scheduler;
  onChange: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isOpened?: boolean;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  schedule,
  onChange,
  onEdit,
  onDelete,
  isOpened = false,
}) => {
  return (
    <div className={styles.container}>
      <Flex align={"center"} className={styles.titleContainer}>
        <Switch
          size="md"
          checked={schedule?.status === "active"}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <Box>
          <Text fz="sm" fw={500}>
            {schedule?.name}
          </Text>
          <Text fz="xs" c="dimmed">
            {schedule?.description}
          </Text>
        </Box>
      </Flex>
      <div className={styles.timeInfo}>
        {/* <Text className={styles.timeText}>{"ss"}</Text> */}
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                isOpened ? (
                  <IconChevronUp size={14} />
                ) : (
                  <IconPencil size={14} />
                )
              }
              onClick={onEdit}
            >
              {isOpened ? "Close" : "Edit"}
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
