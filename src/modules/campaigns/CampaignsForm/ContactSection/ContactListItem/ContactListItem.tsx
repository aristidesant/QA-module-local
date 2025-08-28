import {
  Box,
  Flex,
  Switch,
  Text,
  ThemeIcon,
  rem,
  Overlay,
  Loader,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { IconClock, IconTrash } from "@tabler/icons-react";
import type SchedulerContactGroupModel from "~/models/SchedulerContactGroupModel";
import styles from "./ContactListItem.module.css";
import { useUpdateContactGroupStatus } from "~/queries/schedulerQueries";
import { useDeleteSchedulerContactGroup } from "~/queries/schedulerContactGroupQueries";
import { useState } from "react";
import { modals } from "@mantine/modals";
import SectionTitle from "~/components/SectionTitle";
import ContactLimits from "../ContactLimits";
import { formatExpirationDate } from "~/utils/dateUtils";

interface ContactListItemProps {
  scheduleContactGroup: SchedulerContactGroupModel;
  onUpdateComplete: () => void;
  withOpenModal?: boolean;
  withSwitch?: boolean;
  withAddExpiration?: boolean;
  campaignId?: string | number;
}

export function ContactListItem({
  scheduleContactGroup,
  onUpdateComplete,
  withOpenModal = true,
  withSwitch = true,
  withAddExpiration,
  campaignId,
}: ContactListItemProps) {
  const updateContactGroupStatus = useUpdateContactGroupStatus();
  const deleteSchedulerContactGroup = useDeleteSchedulerContactGroup();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUpdating(true);
      const newStatus = event.currentTarget.checked ? "active" : "inactive";
      await updateContactGroupStatus.mutateAsync({
        groupId: scheduleContactGroup.id,
        status: newStatus,
      });
      onUpdateComplete();
    } catch (error) {
      console.error("Failed to update contact group status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Contact List",
      children: (
        <Text size="sm">
          Are you sure you want to delete the contact list "{scheduleContactGroup?.contactGroup.name}"? 
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          setIsUpdating(true);
          await deleteSchedulerContactGroup.mutateAsync({
            id: scheduleContactGroup.id,
          });
          onUpdateComplete();
        } catch (error) {
          console.error("Failed to delete contact group:", error);
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  const handleOpenModal = () => {
    modals.open({
      modalId: "contact-list-modal",
      title: (
        <SectionTitle
          title="Contact List Configuration"
          description="Browse your existing contact lists or upload a new one to start reaching out."
        />
      ),
      children: (
        <ContactLimits
          schedulerContactGroup={scheduleContactGroup}
          campaignId={campaignId || scheduleContactGroup.scheduleId || ""}
          onComplete={() => {
            onUpdateComplete();
            modals.close("contact-list-modal");
          }}
        />
      ),
      size: "xl",
      centered: true,
      withCloseButton: true,
      closeOnClickOutside: false,
    });
  };

  return (
    <Box
      className={styles.contactItem}
      pos="relative"
      {...(withOpenModal ? { onClick: handleOpenModal } : {})}
    >
      {isUpdating && (
        <Overlay
          color="#fff"
          backgroundOpacity={0.7}
          blur={1}
          radius="md"
          center
        >
          <Loader size="sm" />
        </Overlay>
      )}
      <Flex
        align="center"
        justify="space-between"
        w="100%"
        opacity={isUpdating ? 0.6 : 1}
      >
        <Flex gap={"xs"} align={"center"}>
          {withSwitch && (
            <Switch
              checked={scheduleContactGroup?.status === "active"}
              onChange={handleToggle}
              size="md"
            />
          )}
          <Flex direction={"column"}>
            <Text fz="xs" c="dimmed">
              Contact list
            </Text>
            <Text fw={500} mb={4}>
              {scheduleContactGroup?.contactGroup.name}
            </Text>
          </Flex>
        </Flex>
        {scheduleContactGroup?.expirationDate && (
          <div>
            <Flex align="center" gap={"xs"} c="dimmed">
              <ActionIcon 
                title="Delete this contact list" 
                variant="subtle" 
                size="xs" 
                c="red"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the modal open
                  handleDelete();
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
              <Divider orientation="vertical"/>
              <ThemeIcon variant="transparent" size="xs" c="dimmed">
                <IconClock style={{ width: rem(14), height: rem(14) }} />
              </ThemeIcon>
              <Text size="sm">
                Expires on{" "}
                {formatExpirationDate(scheduleContactGroup.expirationDate)}
              </Text>
            </Flex>
          </div>
        )}
        {withAddExpiration && !scheduleContactGroup?.expirationDate && <>ok</>}
      </Flex>
    </Box>
  );
}

export default ContactListItem;
