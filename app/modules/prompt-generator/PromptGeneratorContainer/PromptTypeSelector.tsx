import React from "react";
import { Card, Group, Text, Stack, Title } from "@mantine/core";
import {
  IconCurrencyDollar,
  IconAdjustments,
  IconBook,
  IconBulb,
  IconRobot,
  IconUser,
} from "@tabler/icons-react";
import classes from "./PromptTypeSelector.module.css";

export interface PromptTypeSelectorProps {
  types: string[];
  selectedType: string;
  onSelect: (type: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  finance: (
    <IconCurrencyDollar
      size={38}
      color="#228be6"
      className={classes.typeIcon}
    />
  ),
  general: (
    <IconAdjustments size={38} color="#228be6" className={classes.typeIcon} />
  ),
  education: (
    <IconBook size={38} color="#228be6" className={classes.typeIcon} />
  ),
  creative: <IconBulb size={38} color="#228be6" className={classes.typeIcon} />,
  ai: <IconRobot size={38} color="#228be6" className={classes.typeIcon} />,
  personal: <IconUser size={38} color="#228be6" className={classes.typeIcon} />,
};

const typeDescriptions: Record<string, string> = {
  finance: "Generate financial prompts for budgeting, analysis, and reporting.",
  general: "Versatile prompts for everyday productivity and communication.",
  education:
    "Create educational prompts for learning, teaching, and study aids.",
  creative:
    "Unleash creativity with prompts for writing, art, and brainstorming.",
  ai: "AI-focused prompts for automation, chatbots, and smart solutions.",
  personal: "Personal prompts for self-improvement, journaling, and planning.",
};

export const PromptTypeSelector: React.FC<PromptTypeSelectorProps> = ({
  types,
  selectedType,
  onSelect,
}) => {
  return (
    <div className={classes.typeSelectorWrapper}>
      <Title order={3} className={classes.typeSelectorTitle}>
        Select a prompt type
      </Title>
      <Group justify="center" gap="xl">
        {types.map((type) => (
          <Card
            key={type}
            withBorder
            radius="md"
            shadow={selectedType === type ? "md" : "sm"}
            className={
              selectedType === type
                ? classes.typeCardSelected
                : classes.typeCard
            }
            onClick={() => onSelect(type)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedType === type}
          >
            <Stack align="center" gap={8}>
              {typeIcons[type] || (
                <IconAdjustments
                  size={38}
                  color="#228be6"
                  className={classes.typeIcon}
                />
              )}
              <Text className={classes.typeTitle} tt="capitalize">
                {type}
              </Text>
              <Text className={classes.typeDescription}>
                {typeDescriptions[type] ||
                  "Choose this type to generate relevant prompts."}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>
    </div>
  );
};
