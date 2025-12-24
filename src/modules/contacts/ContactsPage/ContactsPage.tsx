import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import ContactsList from "../ContactsList";
import ContactsForm from "../ContactsForm";
import classes from "./ContactsPage.module.css";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";

export default function ContactsPage() {
  const { t } = useTranslation();
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
      title: mode === "edit" ? t("contacts.form.editTitle") : t("contacts.form.newTitle"),
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
    <ContentContainer title={t("contacts.page.title")} description={t("contacts.page.description")}>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder={t("contacts.page.searchPlaceholder")}
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
          {t("contacts.page.newContact")}
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
