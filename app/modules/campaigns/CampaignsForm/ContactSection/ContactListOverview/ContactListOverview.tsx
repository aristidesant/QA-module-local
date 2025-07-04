import { useEffect, useState } from "react";
import {
  Group,
  Text,
  TextInput,
  ActionIcon,
  Table,
  Badge,
  Pagination,
  Avatar,
  Stack,
  Card,
  Title,
} from "@mantine/core";
import { IconSearch, IconAdjustments } from "@tabler/icons-react";
import styles from "./ContactListOverview.module.css";
import { useCampaignForm } from "~/modules/campaigns/campaignFormFunctions";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { ContactDetails } from "~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails";

interface Contact {
  id: string;
  name: string;
  phone: string;
  language: string;
  status: "Active" | "Inactive";
  avatar?: string;
  initials: string;
}

interface ContactListOverviewProps {
  contacts?: Contact[];
}

export const ContactListOverview = ({
  contacts = [
    {
      id: "1",
      name: "Veronica Martinez",
      phone: "(555) 123-4567",
      language: "Spanish ES",
      status: "Active",
      initials: "VM",
    },
    {
      id: "2",
      name: "Juan Pérez",
      phone: "(555) 234-5678",
      language: "Spanish ES",
      status: "Inactive",
      initials: "JP",
    },
    {
      id: "3",
      name: "Lucía Fernández",
      phone: "(809) 345-6789",
      language: "Spanish ES",
      status: "Active",
      initials: "LF",
    },
    {
      id: "4",
      name: "Carlos Gómez",
      phone: "(555) 456-7890",
      language: "Spanish ES",
      status: "Inactive",
      initials: "CG",
    },
    {
      id: "5",
      name: "Ana López",
      phone: "(555) 567-8901",
      language: "Spanish ES",
      status: "Inactive",
      initials: "AL",
    },
    {
      id: "6",
      name: "Miguel Torres",
      phone: "(555) 678-9012",
      language: "Spanish ES",
      status: "Inactive",
      initials: "MT",
    },
    {
      id: "7",
      name: "Sofía Ramírez",
      phone: "(555) 789-0123",
      language: "Spanish ES",
      status: "Active",
      initials: "SR",
    },
    {
      id: "8",
      name: "Luis Herrera",
      phone: "(555) 890-1234",
      language: "Spanish ES",
      status: "Active",
      initials: "LH",
    },
    {
      id: "9",
      name: "Claudia Ruiz",
      phone: "(555) 901-2345",
      language: "Spanish ES",
      status: "Active",
      initials: "CR",
    },
    {
      id: "10",
      name: "Andrés Castro",
      phone: "(555) 012-3456",
      language: "Spanish ES",
      status: "Active",
      initials: "AC",
    },
  ],
}: ContactListOverviewProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { setRightComponent } = useCampaignsStore();
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.phone.includes(searchValue)
  );

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    return status === "Active" ? "green" : "gray";
  };

  const handleContactClick = (contact: Contact) => {
    const firstName = contact.name.split(" ")[0].toLowerCase();
    const lastName = contact.name.split(" ")[1]?.toLowerCase() || "";
    const emailBase = lastName ? `${firstName}.${lastName}` : firstName;

    const contactDetails = {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: `${emailBase}@email.com`,
      location: "Santo Domingo, RD",
      language: contact.language,
      initials: contact.initials,
      engagementLevel: 87,
      qualificationScore: 75,
      sentiment: { positive: 2113, neutral: 45, negative: 16 },
    };

    if (setRightComponent) {
      setRightComponent(<ContactDetails contact={contactDetails} />);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function to reset the right component when this component unmounts
      setRightComponent?.(null);
    };
  }, []);

  return (
    <Card className={styles.card}>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={4} className={styles.title}>
            Contact List Overview
          </Title>
          <Text size="sm" c="dimmed" className={styles.subtitle}>
            View and filter campaign contacts to tailor your outreach.
          </Text>
        </div>
        <Group gap="sm">
          <TextInput
            placeholder="Search client"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            className={styles.searchInput}
          />
          <ActionIcon variant="light" size="lg">
            <IconAdjustments size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack gap="md">
        <Table className={styles.table}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Primary number</Table.Th>
              <Table.Th>Language</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedContacts.map((contact) => (
              <Table.Tr
                key={contact.id}
                onClick={() => handleContactClick(contact)}
              >
                <Table.Td>
                  <Group gap="sm">
                    <Avatar size="sm" color="blue" radius="sm">
                      {contact.initials}
                    </Avatar>
                    <Text size="sm" fw={500}>
                      {contact.name}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{contact.phone}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <div className={styles.flagIcon}>🇪🇸</div>
                    <Text size="sm">{contact.language}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getStatusColor(contact.status)}
                    size="sm"
                  >
                    {contact.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Card>
  );
};
