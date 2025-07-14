import React from "react";
import {
  Card,
  Badge,
  Text,
  ActionIcon,
  Menu,
  NumberFormatter,
  Group,
  Stack,
  Progress,
  Avatar,
  rem,
  Divider,
  SemiCircleProgress,
  Flex,
  Button,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlayerPause,
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconCheck,
} from "@tabler/icons-react";
import styles from "./CampaignsListItem.module.css";
import type { Campaign } from "~/models/CampaignsModel";

export type CampaignsListItemProps = {
  campaign: Campaign;
  selected: boolean;
  onClick: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const CampaignsListItem: React.FC<CampaignsListItemProps> = ({
  campaign,
  selected,
  onClick,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  // Placeholder values for agent, score, and progress
  const agent = {
    name: "Clara Lucia",
    language: "Spanish ES",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  };
  const score = 64;
  const progress = 72;

  return (
    <Card
      className={
        selected ? `${styles.card} ${styles.cardSelected}` : styles.card
      }
      withBorder
      onClick={onClick}
      role="button"
      aria-pressed={selected}
      aria-label={`View campaign ${campaign.name}`}
      tabIndex={0}
    >
      {/* Header */}
      <Group justify="space-between" align="center" className={styles.header}>
        <Group gap={8} align="center">
          {/* Campaign Icon */}
          <Avatar
            size={24}
            radius="xl"
            color="green"
            className={styles.campaignIcon}
          >
            <IconCheck />
          </Avatar>
          <Flex direction="column">
            <Text fz={"xs"} c="dimmed">
              Campaign
            </Text>
            <Text fz="xs" fw={500} className={styles.campaignName}>
              {campaign?.name}
            </Text>
          </Flex>
        </Group>

        <Group gap={8} align="center">
          <Badge
            variant="light"
            color={campaign.type === "OUTBOUND" ? "blue" : "violet"}
            radius="sm"
            size="sm"
            className={styles.typeBadge}
          >
            {campaign.type.charAt(0) + campaign.type.slice(1).toLowerCase()}
          </Badge>
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="md"
                aria-label="Campaign actions"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical size={16} aria-hidden />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={onViewDetails}
                leftSection={<IconEye size={14} />}
              >
                Edit Campaign
              </Menu.Item>

              <Menu.Divider />
              <Menu.Item
                onClick={onDelete}
                leftSection={<IconTrash size={14} />}
                color="red"
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <Divider />
      {/* Main Content */}
      <Group
        align="flex-start"
        justify="space-between"
        mt="md"
        className={styles.mainContent}
      >
        {/* Left: Progress and description */}
        <Stack gap={8} className={styles.progressSection}>
          <Group gap={8} align="center">
            <Text size="sm" fw={500} className={styles.progressLabel}>
              Campaign Progress
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {progress}%
            </Text>
          </Group>
          <Progress
            value={progress}
            size="md"
            radius="xl"
            className={styles.progressBar}
          />
          <Text size="sm" c="dimmed" className={styles.campaignDescription}>
            {campaign.description ||
              "Automated calls to existing customers to inform them of their eligibility for a credit limit increase and collect confirmation to proceed."}
          </Text>
        </Stack>

        {/* Right: Score gauge with multi-segment semicircle and pointer */}
        <div
          className={styles.scoreSection}
          style={{
            position: "relative",
            width: 120,
            height: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Single semicircle gauge */}
          <SemiCircleProgress
            value={score}
            size={120}
            thickness={12}
            fillDirection="left-to-right"
            orientation="up"
            label={score}
            labelPosition="bottom"
            styles={{
              label: {
                fontSize: rem(34),
                fontWeight: 700,
                color: "var(--mantine-color-dark-6)",
              },
            }}
            filledSegmentColor="#40c057"
            emptySegmentColor="#e9ecef"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          />

          {/* Label below gauge */}
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 0,
              width: "100%",
              textAlign: "center",
              zIndex: 3,
            }}
          >
            <Text size="sm" fw={700} c="#1a2540">
              Overall Score
            </Text>
          </div>
        </div>
      </Group>

      {/* Footer: Agent and contact methods */}
      <Group align="center" mt="lg" className={styles.footer}>
        <Group gap={8} align="center">
          <Avatar src={agent.avatar} radius="xl" size={32} />
          <Stack gap={0}>
            <Text size="sm" fw={500} className={styles.agentName}>
              {agent.name}
            </Text>
            <Text size="xs" c="dimmed" className={styles.agentLanguage}>
              {agent.language}
            </Text>
          </Stack>
        </Group>
        <Flex gap={"xs"}>
          <Button
            variant="subtle"
            leftSection={
              <IconPhone size={18} color="var(--mantine-color-blue-6)" />
            }
          >
            Call
          </Button>
          <Divider orientation="vertical" />
          <Button
            variant="subtle"
            leftSection={
              <IconBrandWhatsapp
                size={18}
                color="var(--mantine-color-green-6)"
              />
            }
          >
            WhatsApp
          </Button>
          <Divider orientation="vertical" />
          <Button
            variant="subtle"
            leftSection={
              <IconMail size={18} color="var(--mantine-color-red-6)" />
            }
          >
            Email
          </Button>
        </Flex>
      </Group>
    </Card>
  );
};

export default CampaignsListItem;
