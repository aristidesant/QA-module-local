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
  Card,
  Text,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Campaign } from "../../../models/CampaignsModel";
import {
  useCreateCampaign,
  useUpdateCampaign,
} from "~/queries/campaignsQueries";
import { notifications } from "@mantine/notifications";
import PromptTemplateSelect from "~/components/PromptTemplateSelect";
import {
  CampaignFormProvider,
  useCampaignForm,
} from "../campaignFormFunctions";
import CampaignTabs from "../CampaignTabs";
import { useCampaignsStore } from "~/store/campaignsStore";
import GeneralSection from "./GeneralSection/GeneralSection";
import SectionCard from "~/components/SectionCard";
import AgentConfiguration from "~/modules/agent/AgentConfiguration/AgentConfiguration";
import { ContactSection } from "./ContactSection/ContactSection";
import ParametersSection from "./ParametersSection";

interface CampaignsFormProps {
  campaign?: Partial<Campaign>;
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
  loading,
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { selectedTab, setRightComponent } = useCampaignsStore(
    (state) => state
  );
  const { mutateAsync: createCampaign, isPending: isCreating } =
    useCreateCampaign();
  const { mutateAsync: updateCampaign, isPending: isUpdating } =
    useUpdateCampaign();

  const defaultWorkingHours = {
    monday: { enabled: true, from: "09:00", to: "17:30" },
    tuesday: { enabled: true, from: "09:00", to: "17:30" },
    wednesday: { enabled: true, from: "09:00", to: "17:30" },
    thursday: { enabled: true, from: "09:00", to: "17:30" },
    friday: { enabled: true, from: "09:00", to: "17:30" },
    saturday: { enabled: false, from: "09:00", to: "17:30" },
    sunday: { enabled: false, from: "09:00", to: "17:30" },
  };

  const form = useCampaignForm({
    initialValues: {
      name: campaign?.name || "",
      description: campaign?.description || "",
      budget: campaign?.budget ?? 0,
      spent: campaign?.spent ?? 0,
      type: campaign?.type || "OUTBOUND",
      status: campaign?.status || "ACTIVE",
      userId: campaign?.userId ?? 0,
      promptId: campaign?.promptId ?? undefined,
      clientId: campaign?.clientId ?? 0,
      tags: campaign?.tags || [],
      workingHours: campaign?.workingHours || defaultWorkingHours,
      agentConfig: campaign?.agentConfig || {},
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

  const handleSubmit = async (
    value: Omit<Campaign, "id" | "createdAt" | "updatedAt">
  ) => {
    if (form.validate().hasErrors) {
      return;
    }

    // Log the campaign data to verify agentConfig is included
    console.log("Campaign data being submitted:", value);
    console.log("AgentConfig data:", value.agentConfig);

    if (campaign?.id) {
      // Up date existing campaign
      try {
        await updateCampaign({
          data: value,
          id: `${campaign.id}`,
        });
        notifications.show({
          title: "Campaign Updated",
          message: "Your campaign has been successfully updated.",
          color: "green",
        });
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
        await createCampaign(value);
        notifications.show({
          title: "Campaign Created",
          message: "Your campaign has been successfully created.",
          color: "green",
        });
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
    <CampaignFormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isCreating || isUpdating} />
        <Stack gap="xs">
          <Box px="xs">
            <CampaignTabs />
          </Box>
          {selectedTab === "general" && <GeneralSection />}
          {selectedTab === "agents" && (
            <AgentConfiguration
              editableAgent={form.values.agentConfig || {}}
              onSetRightSection={(rightSection) => {
                setRightComponent?.(rightSection);
              }}
              setEditableAgent={(updatedAgent) => {
                // Handle both direct object and function updates
                if (typeof updatedAgent === "function") {
                  const currentAgent = form.values.agentConfig || {};
                  const newAgent = updatedAgent(currentAgent);
                  form.setFieldValue("agentConfig", newAgent);
                } else {
                  form.setFieldValue("agentConfig", updatedAgent);
                }
              }}
            />
          )}
          {selectedTab === "contacts" && (
            <ContactSection
            // selectedContactList={form.values.promptId}
            // onContactListChange={(value) => form.setFieldValue("promptId", value)}
            />
          )}
          {selectedTab === "params" && (
            <SectionCard
              title="Working Hours"
              description="Define the days and time ranges during which your agents are allowed to make calls."
            >
              <ParametersSection
                workingHours={form.values.workingHours || {}}
                onChange={(day, field, value) => {
                  const updatedHours = { ...form.values.workingHours };
                  updatedHours[day] = { ...updatedHours[day], [field]: value };
                  form.setFieldValue("workingHours", updatedHours);
                }}
                onCopyToAll={(sourceDay) => {
                  const sourceHours = form.values.workingHours?.[sourceDay];
                  if (!sourceHours) return;

                  const updatedHours = { ...form.values.workingHours };
                  Object.keys(updatedHours).forEach((day) => {
                    updatedHours[day] = { ...sourceHours };
                  });
                  form.setFieldValue("workingHours", updatedHours);
                }}
              />
            </SectionCard>
          )}
          <Group justify="flex-end" mt="xs" px="xs">
            <Button type="submit" loading={loading}>
              {campaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </Group>
        </Stack>
      </form>
    </CampaignFormProvider>
  );
};
