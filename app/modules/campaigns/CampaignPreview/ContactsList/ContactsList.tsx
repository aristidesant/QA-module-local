import React from "react";
import {
  Text,
  Badge,
  Group,
  Paper,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconListCheck, IconRefresh } from "@tabler/icons-react";
import { RightSection as Section } from "~/components/RightSection";
import classes from "./ContactsList.module.css";
import type { ContactList as ContactListType } from "../../../../models/CampaignsModel";

interface ContactsListProps {
  contactList: ContactListType;
}

// Format date string
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const ContactsList: React.FC<ContactsListProps> = ({ contactList }) => {
  if (!contactList) {
    return null;
  }

  return (
    <Section
      title="Contacts List"
      description={
        <Group gap="xs" align="center">
          <Text size="sm" c="dimmed">
            {contactList.totalContacts?.toLocaleString() || 0}{" "}
            contacts
          </Text>
          {contactList.lastUpdated && (
            <Tooltip
              label={`Last updated: ${formatDate(
                contactList.lastUpdated
              )}`}
            >
              <Text size="xs" c="dimmed" style={{ cursor: "help" }}>
                <Group gap={4} align="center">
                  <IconRefresh size={12} />
                  {formatDate(contactList.lastUpdated)}
                </Group>
              </Text>
            </Tooltip>
          )}
        </Group>
      }
    >
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              <IconListCheck size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">
                {contactList.name}
              </Text>
              <Group gap={4} mt={4}>
                <Badge variant="outline" color="gray" size="xs">
                  CSV Import
                </Badge>
                {contactList.tags?.map((tag: string) => (
                  <Badge key={tag} variant="light" color="blue" size="xs">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
        </Group>
      </Paper>
    </Section>
  );
};
