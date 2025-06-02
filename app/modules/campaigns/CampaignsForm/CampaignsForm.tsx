// Refactored to use Mantine's useForm for all form state and validation

import React, { useState } from "react";
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Campaign } from "../../../models/CampaignsModel";
import {
  useCreateCampaign,
  useUpdateCampaign,
} from "~/queries/campaignsQueries";
import { notifications } from "@mantine/notifications";

interface CampaignsFormProps {
  campaign?: Partial<Campaign>;
  onSubmit: (values: Omit<Campaign, "id" | "createdAt" | "updatedAt">) => void;
  loading?: boolean;
}

const typeOptions = [
  { value: "OUTBOUND", label: "Outbound" },
  { value: "INBOUND", label: "Inbound" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
];

export const CampaignsForm: React.FC<CampaignsFormProps> = ({
  campaign,
  onSubmit,
  loading,
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { mutateAsync: createCampaign, isPending: isCreating } =
    useCreateCampaign();
  const { mutateAsync: updateCampaign, isPending: isUpdating } =
    useUpdateCampaign();
  const form = useForm<Omit<Campaign, "id" | "createdAt" | "updatedAt">>({
    initialValues: {
      name: campaign?.name || "",
      description: campaign?.description || "",
      budget: campaign?.budget ?? 0,
      spent: campaign?.spent ?? 0,
      type: campaign?.type || "OUTBOUND",
      status: campaign?.status || "ACTIVE",
      userId: campaign?.userId ?? 0,
      clientId: campaign?.clientId ?? 0,
      tags: campaign?.tags || [],
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      type: (value) => (value ? null : "Type is required"),
      status: (value) => (value ? null : "Status is required"),
      budget: (value) => (value >= 0 ? null : "Budget must be 0 or more"),
      spent: (value) => (value >= 0 ? null : "Spent must be 0 or more"),
      userId: (value) => (value >= 0 ? null : "User ID must be 0 or more"),
      clientId: (value) => (value >= 0 ? null : "Client ID must be 0 or more"),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors) {
      return;
    }
    if (campaign?.id) {
      // Up date existing campaign
      try {
        await updateCampaign({
          data: form.values,
          id: `${campaign.id}`,
        });
        notifications.show({
          title: "Campaign Updated",
          message: "Your campaign has been successfully updated.",
          color: "green",
        });
        onSubmit(form.values);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to update campaign. Please try again.",
          color: "red",
        });
      }
    } else {
      // Create new campaign
      try {
        await createCampaign(form.values);
        notifications.show({
          title: "Campaign Created",
          message: "Your campaign has been successfully created.",
          color: "green",
        });
        onSubmit(form.values);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to create campaign. Please try again.",
          color: "red",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <LoadingOverlay visible={isCreating || isUpdating} />
      <Stack gap="md">
        <Group grow>
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <Select
            label="Type"
            data={typeOptions}
            required
            {...form.getInputProps("type")}
          />
          {campaign?.id && (
            <Select
              label="Status"
              data={statusOptions}
              required
              {...form.getInputProps("status")}
            />
          )}
        </Group>
        <Textarea
          label="Description"
          minRows={2}
          {...form.getInputProps("description")}
        />
        <Group grow>
          <NumberInput
            label="Budget"
            min={0}
            step={100}
            required
            {...form.getInputProps("budget")}
          />
        </Group>

        <MultiSelect
          label="Tags"
          data={
            Array.isArray(form.values.tags)
              ? form.values.tags.map((tag) => ({ value: tag, label: tag }))
              : []
          }
          searchable
          {...form.getInputProps("tags")}
        />

        <Divider />
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            {campaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
