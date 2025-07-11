import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Text,
  NumberInput,
  rem,
} from "@mantine/core";
import { IconPhone, IconEdit, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import styles from "../ContactLimits.module.css";

interface CallLimitCardProps {
  title: string;
  subtitle: string;
  value: number;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
}

function CallLimitCard({
  title,
  subtitle,
  value,
  onChange,
  icon = <IconPhone size={20} stroke={1.5} className={styles.phoneIcon} />,
}: CallLimitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue) && onChange) {
      onChange(numValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  const displayValue = String(value).padStart(2, "0");

  return (
    <Box className={styles.callLimitBox}>
      <Flex justify="space-between">
        <Flex direction="column">
          <Text size="xs" fw="bold" c="dark">
            {title}
          </Text>
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        </Flex>
        <Group align="center" wrap="nowrap" gap="xs">
          {icon}
          {isEditing ? (
            <Group gap={4} align="center">
              <NumberInput
                value={editValue}
                onChange={(value) => setEditValue(String(value || "0"))}
                onKeyDown={handleKeyDown}
                autoFocus
                hideControls
                min={0}
                max={99}
                size="xs"
                style={{ width: rem(50) }}
                classNames={{ input: styles.numberInput }}
              />
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={handleSave}
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <Group gap={4} align="center">
              <Text fw={600} size="32px" lh={1}>
                {displayValue}
              </Text>
              {onChange && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Group>
      </Flex>
    </Box>
  );
}

export default CallLimitCard;
