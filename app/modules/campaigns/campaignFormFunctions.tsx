import { createFormContext } from "@mantine/form";
import type { Campaign } from "~/models/CampaignsModel";

export const [CampaignFormProvider, useCampaignFormContext, useCampaignForm] =
  createFormContext<Omit<Campaign, "id" | "createdAt" | "updatedAt">>();
