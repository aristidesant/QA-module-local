import { useState } from "react";
import { Group, Text, Select, Button, Card } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
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
        <Button
          variant="subtle"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          className={styles.changeButton}
        >
          Change
        </Button>
      </Group>
    </Card>
  );
};
