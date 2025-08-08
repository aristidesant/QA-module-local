import { useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  Group,
  Stack,
  Loader,
  TextInput,
  Select,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  useCreateContact,
  useUpdateContact,
  useGetContact,
} from "~/queries/contactsQueries";
import type { Contact } from "~/models/ContactsModel";
import { IconDeviceFloppy } from "@tabler/icons-react";

interface ContactsFormProps {
  mode: "create" | "edit";
  contactId: number | null;
  onSuccess: () => void;
}

export default function ContactsForm({
  mode,
  contactId,
  onSuccess,
}: ContactsFormProps) {
  const { data: contact, isLoading: isLoadingContact } = useGetContact(
    contactId ? contactId.toString() : ""
  );
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const form = useForm<Partial<Contact>>({
    initialValues: {
      firstName: "",
      lastName: "",
    },
    validate: {
      firstName: (value) => (value ? null : "First name is required"),
      lastName: (value) => (value ? null : "Last name is required"),
      phone: (value) => (value ? null : "Phone number is required"),
    },
  });

  useEffect(() => {
    if (mode === "edit" && contact) {
      form.setValues({
        firstName: contact.firstName,
        lastName: contact.lastName,
        identifier: contact.identifier,
        identifierType: contact.identifierType,
        birthDate: contact.birthDate,
        address: contact.address,
        email: contact.email,
        phone: contact.phone,
      });
    } else if (mode === "create") {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, contact]);

  const onSubmit = async (values: Partial<Contact>) => {
    try {
      if (mode === "create") {
        await createContact.mutateAsync(values);
      } else if (mode === "edit" && contactId) {
        await updateContact.mutateAsync({
          id: contactId.toString(),
          data: values,
        });
      }
      onSuccess();
      form.reset();
    } catch (error) {
      // Error handled by Tanstack Query
    }
  };

  if (mode === "edit" && isLoadingContact) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            {...form.getInputProps("firstName")}
            error={form.errors.firstName}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            {...form.getInputProps("lastName")}
            error={form.errors.lastName}
            required
          />
          <TextInput
            label="Identifier"
            placeholder="Enter identifier"
            {...form.getInputProps("identifier")}
            error={form.errors.identifier}
          />
          <Select
            label="Identifier Type"
            placeholder="Select identifier type"
            data={[
              { value: "PERSONAL_ID", label: "National ID" },
              {
                value: "PASSPORT",
                label: "Passport",
              },
              {
                value: "DRIVER_LICENSE",
                label: "Driver's License",
              },
            ]}
            {...form.getInputProps("identifierType")}
            error={form.errors.identifierType}
            clearable
          />
          <DateInput
            label="Birth Date"
            placeholder="Pick birth date"
            {...form.getInputProps("birthDate")}
            error={form.errors.birthDate}
            valueFormat="YYYY-MM-DD"
            clearable
          />
          <TextInput
            label="Address"
            placeholder="Enter address"
            {...form.getInputProps("address")}
            error={form.errors.address}
          />
          <TextInput
            label="Email"
            placeholder="Enter email"
            {...form.getInputProps("email")}
            error={form.errors.email}
            type="email"
          />
          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            {...form.getInputProps("phone")}
            error={form.errors.phone}
            type="tel"
          />
        </SimpleGrid>
        <Divider />
        <Group justify="end" mt="md">
          <Button
            type="submit"
            rightSection={<IconDeviceFloppy />}
            loading={createContact.isPending || updateContact.isPending}
            disabled={createContact.isPending || updateContact.isPending}
          >
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
