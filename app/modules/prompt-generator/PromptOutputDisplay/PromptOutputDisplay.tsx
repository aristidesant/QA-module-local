// PromptOutputDisplay.tsx
import React from "react";
import {
  Card,
  Text,
  ScrollArea,
  Code,
  ActionIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";

export interface PromptOutputDisplayProps {
  prompt?: string;
  title?: string;
}

const formatPromptContent = (content?: string) => {
  if (!content) return null;

  // Split by double newlines to preserve paragraphs
  return content.split("\n\n").map((paragraph, index) => (
    <Text key={index} size="sm" mb="md">
      {paragraph}
    </Text>
  ));
};

export const PromptOutputDisplay: React.FC<PromptOutputDisplayProps> = ({
  prompt,
  title = "Created Prompt",
}) => {
  const theme = useMantineTheme();
  const clipboard = useClipboard({ timeout: 2000 });

  const handleCopy = () => {
    if (prompt) {
      clipboard.copy(prompt);
    }
  };

  return (
    <Card p="md" radius="md" withBorder={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.md,
        }}
      >
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Tooltip
          label={clipboard.copied ? "Copied!" : "Copy to clipboard"}
          withArrow
          position="top"
        >
          <ActionIcon
            variant="subtle"
            color={clipboard.copied ? "teal" : "gray"}
            onClick={handleCopy}
            disabled={!prompt}
            aria-label="Copy prompt"
          >
            <IconCopy size={18} />
          </ActionIcon>
        </Tooltip>
      </div>

      <ScrollArea
        type="auto"
        style={{ flex: 1, width: "100%" }}
        styles={{
          viewport: {
            padding: theme.spacing.xs,
            "& > div": {
              display: "block !important", // Fix for scrollbar positioning
            },
          },
          scrollbar: {
            "&:hover": {
              backgroundColor: "transparent",
            },
          },
          thumb: {
            backgroundColor: theme.colors.gray[4],
            "&:hover": {
              backgroundColor: theme.colors.gray[5],
            },
          },
        }}
      >
        <Code
          block
          style={{
            whiteSpace: "pre-wrap",
            backgroundColor: "transparent",
            fontSize: theme.fontSizes.sm,
            lineHeight: 1.6,
            color: theme.colors.dark[7],
            padding: theme.spacing.xs,
          }}
        >
          {formatPromptContent(prompt) || (
            <Text c="dimmed" fs="italic">
              Your generated prompt will appear here...
            </Text>
          )}
        </Code>
      </ScrollArea>
    </Card>
  );
};
