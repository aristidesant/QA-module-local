import { Group, Text, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import styles from "./ActiveContactList.module.css";
import AddNewContactList from "../AddNewContactList";
import SectionTitle from "~/components/SectionTitle";
import ContactListItem from "../ContactListItem";
import type SchedulerContactGroupModel from "~/models/SchedulerContactGroupModel";

export interface ActiveContactListViewProps {
  scheduleContactGroups: SchedulerContactGroupModel[];
  campaignId?: string | number;
  onUpdateComplete: () => void;
}

export const ActiveContactListView = ({
  scheduleContactGroups,
  campaignId,
  onUpdateComplete,
}: ActiveContactListViewProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleClose = () => {
    close();
  };

  return (
    <div className={styles.container}>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600} c="dark">
          Active contact list
        </Text>
        <Button
          variant="subtle"
          color="blue"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={open}
        >
          Add new contact list
        </Button>
      </Group>

      <div className={styles.cardsContainer}>
        {scheduleContactGroups
          ?.filter((item) => item.status === "active")
          .map((item) => (
            <ContactListItem
              key={item.id}
              scheduleContactGroup={item}
              withOpenModal
              withSwitch={false}
              campaignId={campaignId}
              onUpdateComplete={onUpdateComplete}
            />
          ))}
      </div>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <SectionTitle
            title="Contact List Configuration"
            description="Browse your existing contact lists or upload a new one to start reaching out."
          />
        }
        size="xl"
        centered
        withCloseButton
        closeOnClickOutside={false}
      >
        <AddNewContactList
          campaignId={campaignId}
          onClose={handleClose}
          onRefresh={onUpdateComplete}
        />
      </Modal>
    </div>
  );
};
