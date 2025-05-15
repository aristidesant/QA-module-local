import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Title,
  ThemeIcon,
  Loader,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconAdjustments,
  IconBook,
  IconBulb,
  IconRobot,
  IconUser,
} from "@tabler/icons-react";
import classes from "./PromptTypeSelector.module.css";
import { useGetAllPromptTypes } from "~/queries/promptTypesQueries";
import getIcon from "~/utils/iconUtils";

export interface PromptTypeSelectorProps {
  types: string[];
  selectedType: number | null;
  onSelect: (type: number | null) => void;
}

export const PromptTypeSelector: React.FC<PromptTypeSelectorProps> = ({
  types,
  selectedType,
  onSelect,
}) => {
  const { data: promptTypes, isLoading, isFetching } = useGetAllPromptTypes();
  return (
    <div className={classes.typeSelectorWrapper}>
      <Title order={3} className={classes.typeSelectorTitle}>
        Select a prompt type
      </Title>
      <Group justify="center" gap="xl">
        {isLoading || isFetching ? (
          <Loader size="lg" color="blue" />
        ) : (
          <>
            {promptTypes?.map((type) => (
              <Card
                key={type.id}
                withBorder
                radius="md"
                shadow={selectedType === type.id ? "md" : "sm"}
                className={
                  selectedType === type.id
                    ? classes.typeCardSelected
                    : classes.typeCard
                }
                onClick={() => onSelect(type.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedType === type?.id}
              >
                <Stack align="center" gap={8}>
                  <ThemeIcon variant="light" size={100}>
                    {getIcon(type.icon || undefined, { size: 70 })}
                  </ThemeIcon>
                  <Text className={classes.typeTitle} tt="capitalize">
                    {type.name}
                  </Text>
                  <Text className={classes.typeDescription}>
                    {type.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </>
        )}
      </Group>
    </div>
  );
};
