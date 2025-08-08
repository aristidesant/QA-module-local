import { Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconRobot, IconSettings, IconMessageDots } from "@tabler/icons-react";
import classes from "./WelcomeCard.module.css";

export type WelcomeCardProps = {
  heading?: string;
  subheading?: string;
};

const items = [
  {
    icon: IconRobot,
    label: "Create a new AI Agent",
    description:
      "Explore capabilities, configure behaviors, and prepare your agent for production readiness with thoughtful defaults.",
  },
  {
    icon: IconSettings,
    label: "Manage existing Agents",
    description:
      "Adjust settings, monitor performance metrics, and iterate quickly using streamlined management tools.",
  },
  {
    icon: IconMessageDots,
    label: "Test your Agent in a conversation",
    description:
      "Validate end‑to‑end flows with sample scenarios and ensure a smooth, helpful user experience.",
  },
];

export default function WelcomeCard({
  heading = "Welcome to your AI Customer Service Agent!",
  subheading = "This platform empowers you to create, configure, and test AI agents that assist users with real‑time customer service. Below are some actions to get started:",
}: WelcomeCardProps) {
  return (
    <Card padding="lg" radius="xl" withBorder className={classes.root}>
      <Stack gap="lg">
        <Stack gap={4} className={classes.header}>
          <Title order={2} className={classes.title}>
            {heading}
          </Title>
          <Text size="sm" className={classes.subtitle}>
            {subheading}
          </Text>
        </Stack>

        <Stack className={classes.items} gap="md">
          {items.map((it, idx) => (
            <Group
              key={idx}
              align="flex-start"
              gap="md"
              className={classes.item}
            >
              <ThemeIcon size={36} variant="light" color="blue">
                <it.icon size={20} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text className={classes.itemLabel}>{it.label}</Text>
                <Text size="sm" className={classes.itemDesc}>
                  {/* Random filler text instead of links as requested */}
                  {it.description}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
