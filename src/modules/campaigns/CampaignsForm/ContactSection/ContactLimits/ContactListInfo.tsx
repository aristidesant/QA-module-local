import {
  Flex,
  Group,
  Text,
  Card,
  Popover,
  Button,
  Box,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconX,
  IconEdit,
  IconCheck,
  IconX as IconXCircle,
} from "@tabler/icons-react";
// Removed date-fns, using dayjs instead
import { DatePicker } from "@mantine/dates";
import { useState, useEffect } from "react";
import classes from "./ContactListInfo.module.css";
import dayjs from "dayjs";
import { formatExpirationDate } from "~/utils/dateUtils";

interface ContactListInfoProps {
  /** Name of the contact list */
  listName?: string;

  placeholder?: string;

  /** Expiration date of the list (YYYY-MM-DD string or null) */
  expirationDate?: string | null;

  /** Callback when expiration date is changed */
  onExpirationChange: (date: string | null) => void;

  /** Callback when list name is changed */
  onNameChange?: (name: string) => void;
}

export function ContactListInfo({
  listName,
  placeholder = "Enter contact list name",
  expirationDate,
  onExpirationChange,
  onNameChange,
}: ContactListInfoProps) {
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(listName);
  // Store the selected date as a YYYY-MM-DD string to avoid timezone issues
  const [selectedDate, setSelectedDate] = useState<string | null>(
    expirationDate || null
  );

  // Helper to get start of today in YYYY-MM-DD
  const getStartOfToday = () => dayjs().startOf("day").format("YYYY-MM-DD");

  useEffect(() => {
    setEditedName(listName);
  }, [listName]);

  const handleNameSave = () => {
    if (editedName?.trim() && editedName !== listName) {
      onNameChange?.(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(listName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDateChange = (dateString: string | null) => {
    // Store and pass the date as a simple YYYY-MM-DD string to avoid timezone issues
    setSelectedDate(dateString);
    onExpirationChange(dateString);
    setOpened(false);
  };

  // Update selectedDate when expirationDate prop changes
  useEffect(() => {
    setSelectedDate(expirationDate || null);
  }, [expirationDate]);

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onExpirationChange(null);
  };

  return (
    <Card withBorder>
      <Flex justify="space-between" align="center">
        <Group justify="space-between" align="center">
          <Flex direction="column" style={{ flex: 1 }}>
            <Text size="xs" c="dimmed">
              Contact list
            </Text>
            {isEditing ? (
              <Group gap="xs" align="center">
                <TextInput
                  value={editedName}
                  onChange={(e) => setEditedName(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  autoFocus
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Tooltip label="Save">
                  <ActionIcon
                    variant="subtle"
                    color="green"
                    onClick={handleNameSave}
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Cancel">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={handleCancelEdit}
                  >
                    <IconXCircle size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ) : (
              <Group gap="xs" align="center">
                <Text fw={500} size="sm" style={{ flex: 1 }}>
                  {listName || placeholder}
                </Text>
                {onNameChange && (
                  <Tooltip label="Edit name">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            )}
          </Flex>
        </Group>
        <Popover
          opened={opened}
          onChange={setOpened}
          onDismiss={() => setOpened(false)}
          position="bottom"
          withArrow
          shadow="md"
          width={300}
        >
          <Popover.Target>
            <Button
              variant="subtle"
              size="sm"
              c={expirationDate ? "green" : "blue"}
              className={classes.dateButton}
              leftSection={<IconCalendar size={16} stroke={1.5} />}
              rightSection={
                expirationDate ? (
                  <Box
                    component="span"
                    onClick={clearDate}
                    className={classes.clearButton}
                  >
                    <IconX size={14} />
                  </Box>
                ) : null
              }
              onClick={() => setOpened((o) => !o)}
            >
              {expirationDate
                ? `Expires: ${formatExpirationDate(expirationDate)}`
                : "Add expiration date"}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <DatePicker
              value={selectedDate}
              onChange={(dateString) => {
                // Mantine v8 DatePicker already returns YYYY-MM-DD string format
                // Pass it directly to avoid any timezone conversion issues
                handleDateChange(dateString);
              }}
              minDate={getStartOfToday()}
              firstDayOfWeek={0}
              allowDeselect
              size="sm"
              styles={{
                day: {
                  "&[data-selected]": {
                    backgroundColor: "var(--mantine-color-blue-6)",
                  },
                  "&[data-selected]:hover": {
                    backgroundColor: "var(--mantine-color-blue-7)",
                  },
                },
              }}
            />
            <Group justify="space-between" mt="md">
              <Text size="xs" c="dimmed">
                {expirationDate &&
                dayjs(expirationDate).isBefore(dayjs().startOf("day"), "day")
                  ? "Selected date is in the past"
                  : "Select an expiration date"}
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setOpened(false)}
              >
                Close
              </Button>
            </Group>
          </Popover.Dropdown>
        </Popover>
      </Flex>
    </Card>
  );
}
