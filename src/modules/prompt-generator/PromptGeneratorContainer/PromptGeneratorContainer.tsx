import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Group,
  Button,
  Stack,
  Box,
  Text,
  useMantineTheme,
  Paper,
  SegmentedControl,
  Divider,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconForms,
  IconListDetails,
  IconMessage,
  IconDeviceAnalytics,
} from "@tabler/icons-react";
import { PromptInputForm } from "../PromptInputForm";
import { PromptOutputDisplay } from "../PromptOutputDisplay";
import { useCreatePrompt } from "../queries/promptGeneratorQueries";
import { type Prompt } from "~/models/PromptsModels";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { usePromptGeneratorStore } from "../usePromptGeneratorStore";

type PromptType = {
  id: number;
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

const PROMPT_TYPES: PromptType[] = [
  {
    id: 1,
    label: "Finance",
    value: "FINANCE",
    description: "Generate financial analysis and reports",
    icon: <IconForms size={20} />,
  },
  {
    id: 2,
    label: "Education",
    value: "EDUCATION",
    description: "Create educational content and learning materials",
    icon: <IconListDetails size={20} />,
  },
  {
    id: 3,
    label: "Sales",
    value: "SALES",
    description: "Generate sales pitches and outreach messages",
    icon: <IconMessage size={20} />,
  },
  {
    id: 4,
    label: "Client Support",
    value: "CLIENT_SUPPORT",
    description: "Create support responses and documentation",
    icon: <IconDeviceAnalytics size={20} />,
  },
];

export const PromptGeneratorContainer: React.FC = () => {
  const theme = useMantineTheme();
  const [selectedType, setSelectedType] = React.useState<number | null>(1); // Default to first type
  const [_, setCreatedPrompt] = React.useState<Prompt>();
  const { mutateAsync: createPrompt, isPending } = useCreatePrompt();
  const form = useForm<Record<string, string>>({});
  const { rightComponent, setRightComponent } = usePromptGeneratorStore();

  // Placeholder component for the right panel when no prompt has been generated yet
  const rightPanelContent = rightComponent ?? (
    <Box
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.colors.gray[5],
        padding: theme.spacing.md,
        textAlign: "center",
      }}
    >
      <Text size="sm" c="dimmed">
        No prompt generated yet. Fill the form on the left and click "Generate
        Prompt".
      </Text>
    </Box>
  );

  useEffect(() => {
    return () => {
      setRightComponent(null);
    };
  }, []);

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    const typeIdNum = parseInt(typeId, 10);
    setSelectedType(typeIdNum);
    form.reset();
    setCreatedPrompt(undefined);
  };

  // Handle form submission
  const handleFormSubmit = async (values: Record<string, string>) => {
    if (!selectedType) return;

    const selectedTypeData = PROMPT_TYPES.find(
      (type) => type.id === selectedType
    );

    try {
      const newPrompt = await createPrompt({
        typeId: selectedType,
        generationInput: values,
        name: selectedTypeData
          ? `${selectedTypeData.label} Prompt`
          : "New Prompt",
        generatedPrompt: "", // This will be set by the server
      });

      setCreatedPrompt(newPrompt);

      // Set the right component with the generated prompt
      setRightComponent(
        <PromptOutputDisplay
          prompt={newPrompt.generatedPrompt}
          title={newPrompt.name}
        />
      );

      notifications.show({
        title: "Success!",
        message: "Your prompt has been generated.",
        color: "green",
      });
    } catch (error) {
      console.error("Error generating prompt:", error);
      notifications.show({
        title: "Error",
        message: "Failed to generate prompt. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <ContentContainer
      description="Create and manage prompts"
      title="Prompt Generator"
      rightSection={rightPanelContent}
    >
      <Stack pt="md">
        <SegmentedControl
          fullWidth
          value={selectedType?.toString() || ""}
          onChange={handleTypeSelect}
          data={PROMPT_TYPES.map((type) => ({
            value: type.id.toString(),
            label: (
              <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {type.icon}
                <Text size="sm">{type.label}</Text>
              </Box>
            ),
          }))}
          style={{ overflowX: "auto" }}
          size="md"
          radius="md"
          styles={{
            root: {
              border: `1px solid ${theme.colors.gray[3]}`,
              backgroundColor: "transparent",
              borderRadius: theme.radius.md,
              padding: 4,
            },
            label: {
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.radius.sm,
            },
            control: {
              border: "none",
            },
          }}
        />
        <Text c="dimmed" ta="center" size="sm" mt="md">
          {PROMPT_TYPES.find((t) => t.id === selectedType)?.description}
        </Text>

        <Divider my="sm" />

        <Paper p="md" radius="md">
          <form
            onSubmit={form.onSubmit(handleFormSubmit)}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            }}
          >
            <div style={{ flex: 1 }}>
              <PromptInputForm form={form} type={selectedType || undefined} />
            </div>

            <Group
              justify="flex-end"
              pt="md"
              style={{ borderTop: `1px solid ${theme.colors.gray[3]}` }}
            >
              <Button
                type="submit"
                loading={isPending}
                size="md"
                disabled={!form.values}
                style={{ minWidth: rem(180) }}
              >
                Generate Prompt
              </Button>
            </Group>
          </form>
        </Paper>
      </Stack>
    </ContentContainer>
  );
};
