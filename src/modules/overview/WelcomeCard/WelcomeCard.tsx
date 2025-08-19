import { Card, Group, Text, ThemeIcon, Title, Button } from "@mantine/core";
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
    color: "teal",
  },
  {
    icon: IconSettings,
    label: "Manage existing Agents",
    description:
      "Adjust settings, monitor performance metrics, and iterate quickly using streamlined management tools.",
    color: "violet",
  },
  {
    icon: IconMessageDots,
    label: "Test your Agent in a conversation",
    description:
      "Validate end‑to‑end flows with sample scenarios and ensure a smooth, helpful user experience.",
    color: "blue",
  },
];

export default function WelcomeCard({
  heading = "Welcome to your AI Customer Service Agent!",
  subheading = "This platform empowers you to create, configure, and test AI agents that assist users with real‑time customer service. Below are some actions to get started:",
}: WelcomeCardProps) {
  return (
    <div className={classes.centerWrapper}>
      <Card padding="xl" radius="xl" withBorder className={classes.root}>
        <div className={classes.grid}>
          <div className={classes.content}>
            <div className={classes.leadingBadge} aria-hidden>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                  fill="var(--mantine-color-blue-6)"
                />
              </svg>
            </div>

            <Title order={2} className={classes.title}>
              {heading}
            </Title>

            <Text size="sm" className={classes.subtitle}>
              {subheading}
            </Text>

            <Group gap={12} className={classes.ctaGroup}>
              <Button radius="lg" size="md">
                Create Agent
              </Button>
              <Button variant="light" radius="lg" size="md">
                Explore Agents
              </Button>
            </Group>

            <div className={classes.divider} role="separator" aria-hidden />

            <div className={classes.items}>
              {items.map((it, idx) => (
                <div key={idx} className={classes.item}>
                  <div className={classes.itemLeft}>
                    <ThemeIcon
                      size={44}
                      radius="md"
                      variant="light"
                      color={it.color}
                    >
                      <it.icon size={20} />
                    </ThemeIcon>
                  </div>
                  <div className={classes.itemRight}>
                    <Text className={classes.itemLabel}>{it.label}</Text>
                    <Text size="sm" className={classes.itemDesc}>
                      {it.description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={classes.visual} aria-hidden>
            {/* Decorative illustration - simple abstract waves */}
            <svg
              viewBox="0 0 400 300"
              className={classes.illustration}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Abstract assistant illustration"
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#C084FC" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" rx="18" fill="url(#g1)" />
              <g fill="white" opacity="0.9">
                <circle cx="80" cy="80" r="28" opacity="0.18" />
                <circle cx="140" cy="120" r="18" opacity="0.2" />
                <rect
                  x="60"
                  y="160"
                  width="220"
                  height="12"
                  rx="6"
                  opacity="0.12"
                />
                <rect
                  x="50"
                  y="190"
                  width="180"
                  height="12"
                  rx="6"
                  opacity="0.08"
                />
              </g>
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}
