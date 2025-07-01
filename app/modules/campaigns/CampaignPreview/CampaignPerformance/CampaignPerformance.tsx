import React from "react";
import { Stack } from "@mantine/core";
import {
  IconPhone,
  IconUserCheck,
  IconClockHour4,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { RightSection as Section } from "~/components/RightSection";
import { StatCard } from "../../../../components/StatCard";
import classes from "./CampaignPerformance.module.css";

interface CampaignPerformanceProps {
  stats: {
    callsMade: number;
    callsAnswered: number;
    conversionRate: number;
    avgCallDuration: string;
    lastUpdated: string;
  };
  createdAt?: string;
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

export const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({
  stats,
  createdAt,
}) => {
  // Calculate metrics
  const callAnswerRate =
    stats.callsMade > 0
      ? Math.round((stats.callsAnswered / stats.callsMade) * 100)
      : 0;

  const daysRunning = createdAt
    ? Math.ceil(
        (new Date().getTime() - new Date(createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Section
      title="Campaign Performance"
      description="Key metrics and statistics"
    >
      <Stack gap="xs" className={classes.statsGrid}>
        <StatCard
          label="Calls Made"
          value={stats.callsMade.toLocaleString()}
          description={`${stats.callsAnswered.toLocaleString()} answered`}
          icon={<IconPhone size={24} />}
          color="blue"
        />

        <StatCard
          label="Answer Rate"
          value={`${callAnswerRate}%`}
          description="of calls answered"
          icon={<IconUserCheck size={24} />}
          color="green"
        />

        <StatCard
          label="Avg. Call Duration"
          value={stats.avgCallDuration}
          description="minutes per call"
          icon={<IconClockHour4 size={24} />}
          color="violet"
        />

        <StatCard
          label="Days Running"
          value={daysRunning.toString()}
          description={`since ${formatDate(createdAt)}`}
          icon={<IconCalendarEvent size={24} />}
          color="orange"
        />
      </Stack>
    </Section>
  );
};
