import { useState } from "react";
import { Group, Text, Select, Button } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import SectionCard from "../../../../../components/SectionCard";
import styles from "./ContactListConfiguration.module.css";

interface ContactListConfigurationProps {
  selectedContactList?: string;
  onContactListChange?: (value: string | null) => void;
}

export const ContactListConfiguration = ({
  selectedContactList = "bancopopular_contactos",
  onContactListChange,
}: ContactListConfigurationProps) => {
  const [contactList, setContactList] = useState(selectedContactList);

  const handleContactListChange = (value: string | null) => {
    setContactList(value || "");
    onContactListChange?.(value);
  };

  return (
    <SectionCard
      title="Contact List Configuration"
      description="Define who your campaign will reach. Upload, import, or select contacts to engage with through your AI agents."
    >
      <Group justify="space-between" className={styles.content}>
        <div>
          <Text size="sm" c="dimmed" className={styles.label}>
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
            size="md"
          />
        </div>
        <Button
          variant="subtle"
          size="sm"
          rightSection={<IconChevronRight size={16} />}
          className={styles.changeButton}
        >
          Change
        </Button>
      </Group>
    </SectionCard>
  );
};
