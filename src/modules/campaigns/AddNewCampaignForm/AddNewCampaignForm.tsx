import React from "react";
import {
  Button,
  Group,
  Select,
  TextInput,
  NumberInput,
  Box,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCreateCampaign } from "~/queries/campaignsQueries";
import styles from "./AddNewCampaignForm.module.css";
import { notifications } from "@mantine/notifications";

type AddNewCampaignFormProps = {
  onComplete?: () => void;
};

export const AddNewCampaignForm: React.FC<AddNewCampaignFormProps> = ({
  onComplete,
}) => {
  const createCampaign = useCreateCampaign();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      budget: 0,
      type: "",
      status: "",
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Name is required" : null),
      description: (value) =>
        value.trim().length < 2 ? "Description is required" : null,
      budget: (value) => {
        if (typeof value !== "number" || isNaN(value)) {
          return "Budget must be a number conforming to the specified constraints";
        }
        if (value < 0) {
          return "Budget must not be less than 0";
        }
        return null;
      },
      type: (value) =>
        value !== "INBOUND" && value !== "OUTBOUND"
          ? "Type must be one of the following values: INBOUND, OUTBOUND"
          : null,
      status: (value) =>
        value !== "ACTIVE" && value !== "INACTIVE"
          ? "Status must be one of the following values: ACTIVE, INACTIVE"
          : null,
    },
    validateInputOnChange: true,
  });

  const handleSubmit = (values: typeof form.values) => {
    // Cast type and status to correct union types
    createCampaign.mutate(
      {
        ...values,
        type: values.type as "INBOUND" | "OUTBOUND",
        status: values.status as "ACTIVE" | "INACTIVE",
      },
      {
        onSuccess: () => {
          if (onComplete) {
            onComplete();
          }
          form.reset();
        },
        onError: (error) => {
          notifications.show({
            title: "Error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to create campaign",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <Box className={styles.formContainer}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="Campaign name"
          withAsterisk
          className={styles.field}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Description"
          placeholder="Campaign description"
          withAsterisk
          className={styles.field}
          key={form.key("description")}
          {...form.getInputProps("description")}
        />
        <NumberInput
          label="Budget"
          placeholder="Budget"
          min={0}
          withAsterisk
          className={styles.field}
          key={form.key("budget")}
          {...form.getInputProps("budget")}
        />
        <Select
          label="Type"
          placeholder="Select type"
          withAsterisk
          className={styles.field}
          key={form.key("type")}
          data={[
            { value: "INBOUND", label: "Inbound" },
            { value: "OUTBOUND", label: "Outbound" },
          ]}
          {...form.getInputProps("type")}
        />
        <Select
          label="Status"
          placeholder="Select status"
          withAsterisk
          className={styles.field}
          key={form.key("status")}
          data={[
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          {...form.getInputProps("status")}
        />
        {createCampaign.isError && (
          <Text className={styles.error}>
            {createCampaign.error instanceof Error
              ? createCampaign.error.message
              : "Error creating campaign"}
          </Text>
        )}
        <Group className={styles.buttonGroup} mt="md">
          <Button type="submit" loading={createCampaign.isPending}>
            Create Campaign
          </Button>
        </Group>
      </form>
    </Box>
  );
};
