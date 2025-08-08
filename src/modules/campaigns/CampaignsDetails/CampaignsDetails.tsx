import React from "react";
import { Text, Badge, SimpleGrid, Loader, Stack } from "@mantine/core";
import {
  IconCalendar,
  IconUser,
  IconCash,
  IconTag,
  IconDetails,
} from "@tabler/icons-react";
import styles from "./CampaignsDetails.module.css";
import dayjs from "dayjs";
import SectionCard from "~/components/SectionCard";
import { InformationDetails } from "~/components/ui/InformationDetails/InformationDetails";
import { useGetCampaign } from "~/queries/campaignsQueries";

export interface CampaignsDetailsProps {
  campaignId: string;
}

export const CampaignsDetails: React.FC<CampaignsDetailsProps> = ({
  campaignId,
}) => {
  const {
    data: campaign,
    isLoading,
    isFetching,
  } = useGetCampaign(`${campaignId}`);

  if (isLoading || isFetching) {
    return (
      <SectionCard title="Loading Campaign Details..." icon={IconDetails}>
        <Stack align="center" justify="center" gap={"xs"}>
          <Loader size="lg" />
          <Text mt="md">Fetching campaign details, please wait...</Text>
        </Stack>
      </SectionCard>
    );
  }
  if (!campaign) {
    return (
      <SectionCard
        title="Campaign Not Found"
        description="The requested campaign does not exist."
        icon={IconDetails}
      />
    );
  }
  return (
    <SectionCard
      title={`${formatValue(campaign.name)} Details`}
      description={campaign.description || "No description available"}
      headerActions={
        campaign.status ? (
          <Badge
            color={getStatusColor(campaign.status)}
            variant="filled"
            size="sm"
          >
            {formatValue(campaign.status)}
          </Badge>
        ) : null
      }
      icon={IconDetails}
    >
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="md"
        className={styles.detailsGrid}
      >
        <InformationDetails
          label="Type"
          icon={IconTag}
          value={formatValue(campaign.type)}
        />
        <InformationDetails
          label="Budget"
          icon={IconCash}
          value={formatCurrency(campaign.budget)}
        />
        <InformationDetails
          label="Spent"
          icon={IconCash}
          value={formatCurrency(campaign.spent)}
        />
        <InformationDetails
          label="User ID"
          icon={IconUser}
          value={formatValue(campaign.userId)}
        />
        <InformationDetails
          label="Client ID"
          icon={IconUser}
          value={formatValue(campaign.clientId)}
        />
        <InformationDetails
          label="Created"
          icon={IconCalendar}
          value={formatDate(campaign.createdAt)}
        />
        <InformationDetails
          label="Updated"
          icon={IconCalendar}
          value={formatDate(campaign.updatedAt)}
        />

        {campaign.tags && campaign.tags.length > 0 && (
          <div className={styles.tags}>
            {campaign.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </SimpleGrid>
    </SectionCard>
  );
};

function formatDate(date?: string): string {
  if (!date) return "-";
  const d = dayjs(date);
  return d.isValid() ? d.format("MMM D, YYYY") : "-";
}

function formatValue(value: any): string {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && isNaN(value))
  ) {
    return "-";
  }
  return value.toString();
}

function formatCurrency(value: any): string {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `$${value.toLocaleString()}`;
}

function getStatusColor(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "INACTIVE":
      return "gray";
    case "PAUSED":
      return "yellow";
    case "COMPLETED":
      return "blue";
    default:
      return "gray";
  }
}
