import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import ContactsList from "../ContactsList";
import ContactsForm from "../ContactsForm";
import classes from "./ContactsPage.module.css";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // for refreshing list after modal close

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const openContactModal = (
    mode: "create" | "edit",
    contactId: number | null = null
  ) => {
    modals.open({
      title: mode === "edit" ? "Edit Contact" : "New Contact",
      children: (
        <ContactsForm
          mode={mode}
          contactId={contactId}
          onSuccess={() => {
            modals.closeAll();
            setRefreshKey((k) => k + 1); // trigger list refresh
          }}
        />
      ),
      centered: true,
      size: "lg",
      withCloseButton: true,
      closeOnClickOutside: false,
    });
  };

  return (
    <ContentContainer title="Contacts" description="Manage your contacts">
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search contacts"
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={handleSearchChange}
          className={classes.searchInput}
        />
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => openContactModal("create", null)}
          variant="light"
        >
          New Contact
        </Button>
      </Group>
      <ContactsList
        key={refreshKey}
        search={search}
        onEdit={(id) => openContactModal("edit", id)}
        selectedContactId={null}
      />
    </ContentContainer>
  );
}
