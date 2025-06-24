import React from "react";
import {
  Text,
  Badge,
  Group,
  Stack,
  Paper,
  ThemeIcon,
  Tooltip,
  Title,
  Progress,
  Center,
  Box,
  Container,
} from "@mantine/core";
import { IconInfoCircle, IconCalendar } from "@tabler/icons-react";
import classes from "./CampaignOverview.module.css";
import type { Campaign } from "../../../../models/CampaignsModel";

interface CampaignOverviewProps {
  campaign: Campaign;
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

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "PAUSED":
      return "yellow";
    case "INACTIVE":
      return "gray";
    case "COMPLETED":
      return "blue";
    default:
      return "gray";
  }
};

const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaign }) => {
  const budgetPercentage =
    campaign.budget > 0
      ? Math.round((campaign.spent / campaign.budget) * 100)
      : 0;

  return (
    <Stack gap="xs">
      {/* Centered Header with Name, Type and Status */}
      <Center className={classes.headerSection}>
        <Stack gap="0" align="center">
          <Title order={4} className={classes.campaignName}>
            {campaign.name}
          </Title>

          <Group gap="md" align="center">
            <Badge variant="outline" color="blue" size="xs">
              {campaign.type}
            </Badge>

            <Badge
              color={getStatusColor(campaign.status)}
              variant="filled"
              size="xs"
            >
              {campaign.status}
            </Badge>
          </Group>
        </Stack>
      </Center>

      {/* Description */}
      {campaign.description && (
        <Box className={classes.descriptionSection}>
          <Text size="md" mt={4} className={classes.description}>
            {campaign.description}
          </Text>
        </Box>
      )}

      {/* Budget Card */}
      <Paper withBorder p="md" radius="md" className={classes.card}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-end">
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Total Budget
              </Text>
              <Text fw={700} size="xs">
                {formatCurrency(campaign.budget)}
              </Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text size="xs" c="dimmed" mb={4}>
                Spent
              </Text>
              <Text
                fw={600}
                size="md"
                c={budgetPercentage > 90 ? "red" : "blue"}
              >
                {formatCurrency(campaign.spent)}
              </Text>
            </div>
          </Group>

          <div className={classes.budgetContainer}>
            <div
              className={classes.budgetProgress}
              style={{
                width: `${Math.min(budgetPercentage, 100)}%`,
                backgroundColor:
                  budgetPercentage > 90
                    ? "var(--mantine-color-red-6)"
                    : "var(--mantine-color-blue-6)",
              }}
            />
          </div>

          <Group justify="space-between" mt={-4}>
            <Text size="xs" c="dimmed">
              {budgetPercentage}% spent
            </Text>
            <Text size="xs" c="dimmed">
              {formatCurrency(campaign.budget - campaign.spent)} remaining
            </Text>
          </Group>
        </Stack>
      </Paper>

      {/* Dates Card */}
      <Paper withBorder p="md" radius="md" className={classes.card}>
        <Stack gap="xs">
          <Group grow>
            <div>
              <Group gap={4} align="center">
                <IconCalendar size={14} />
                <Text size="sm" fw={500}>
                  Created:
                </Text>
              </Group>
              <Text size="sm" mt={4}>
                {formatDate(campaign.createdAt)}
              </Text>
            </div>

            <div>
              <Group gap={4} align="center">
                <IconCalendar size={14} />
                <Text size="sm" fw={500}>
                  Updated:
                </Text>
              </Group>
              <Text size="sm" mt={4}>
                {formatDate(campaign.updatedAt)}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Tags Card */}
      {campaign.tags && campaign.tags.length > 0 && (
        <Paper withBorder p="md" radius="md" className={classes.card}>
          <Stack gap="xs">
            <Group className={classes.tagGroup}>
              {campaign.tags.map((tag) => (
                <Badge key={tag} variant="light" color="blue" size="md">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default CampaignOverview;
