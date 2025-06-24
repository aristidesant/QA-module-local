import { useState } from "react";
import { Group, Text, Select, ActionIcon, Card } from "@mantine/core";
import { IconSwitchHorizontal, IconSettings } from "@tabler/icons-react";
import styles from "./ActiveContactList.module.css";

interface ActiveContactListProps {
  selectedContactList?: string;
  onContactListChange?: (value: string | null) => void;
}

export const ActiveContactList = ({
  selectedContactList = "bancopopular_contactos",
  onContactListChange,
}: ActiveContactListProps) => {
  const [contactList, setContactList] = useState(selectedContactList);

  const handleContactListChange = (value: string | null) => {
    setContactList(value || "");
    onContactListChange?.(value);
  };

  return (
    <Card className={styles.card}>
      <Group justify="space-between" className={styles.content}>
        <div>
          <Text size="xs" c="dimmed" className={styles.label}>
            Active contact list
          </Text>
          <Select
            value={contactList}
            onChange={handleContactListChange}
            data={[
              {
                value: "bancopopular_contactos",
                label: "bancopopular_contactos",
              },
            ]}
            className={styles.select}
            variant="unstyled"
            size="sm"
          />
        </div>
        <Group gap="xs">
          <ActionIcon
            color="gray"
            variant="outline"
            size="lg"
            className={styles.actionIcon}
          >
            <IconSwitchHorizontal size={18} />
          </ActionIcon>
          <ActionIcon
            color="gray"
            variant="outline"
            size="lg"
            className={styles.actionIcon}
          >
            <IconSettings size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
};
