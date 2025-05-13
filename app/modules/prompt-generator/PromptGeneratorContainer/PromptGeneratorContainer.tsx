import React from "react";
import { useForm } from "@mantine/form";
import { Paper, Stepper, Group, Button, Title, Stack } from "@mantine/core";
import { PromptInputForm } from "../PromptInputForm";
import { PromptOutputDisplay } from "../PromptOutputDisplay";
import { useCreatePrompt } from "../queries/promptGeneratorQueries";
import { type Prompt } from "~/models/PromptsModels";
import { PromptTypeSelector } from "./PromptTypeSelector";
import styles from "./PromptGeneratorContainer.module.css";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";

const PROMPT_TYPES = Object.values({
  FINANCE: "FINANCE",
  EDUCATION: "EDUCATION",
  SALES: "SALES",
  "CLIENT SUPPORT": "CLIENT SUPPORT",
}) as PromptInstructionType[];

export const PromptGeneratorContainer: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedType, setSelectedType] =
    React.useState<PromptInstructionType | null>(null);
  const [createdPrompt, setCreatedPrompt] = React.useState<Prompt>();
  const { mutateAsync: createPrompt } = useCreatePrompt();
  const form = useForm<Record<string, string>>({});

  const handleTypeSelect = (type: string) => {
    setSelectedType(type as PromptInstructionType);
    setActiveStep(1);
    form.reset();
    setCreatedPrompt(undefined);
  };

  const handleFormSubmit = async (values: Record<string, string>) => {
    try {
      const newPrompt = await createPrompt({
        generationInput: values,
        type: selectedType ?? "CLIENT SUPPORT",
      });
      setCreatedPrompt(newPrompt);
      setActiveStep(2);
    } catch (error) {
      // Optionally show error UI
    }
  };

  return (
    <Paper
      className={styles.wizardPaper}
      shadow="md"
      radius="lg"
      p="xl"
      withBorder
    >
      <Stack gap="xl">
        <Title order={2} className={styles.wizardTitle}>
          Prompt Generator Wizard
        </Title>
        <Stepper active={activeStep} className={styles.wizardStepper}>
          <Stepper.Step label="Type" description="Select type">
            <PromptTypeSelector
              types={PROMPT_TYPES}
              selectedType={selectedType || ""}
              onSelect={handleTypeSelect}
            />
          </Stepper.Step>
          <Stepper.Step label="Details" description="Fill details">
            {selectedType && (
              <form
                onSubmit={form.onSubmit(handleFormSubmit)}
                className={styles.formStepWrapper}
                autoComplete="off"
              >
                <PromptInputForm form={form} type={selectedType} />
                <Group justify="center" mt="xl">
                  <Button
                    variant="default"
                    onClick={() => setActiveStep(0)}
                    size="md"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    className={styles.submitButton}
                  >
                    Generate
                  </Button>
                </Group>
              </form>
            )}
          </Stepper.Step>
          <Stepper.Step label="Result" description="View prompt">
            <PromptOutputDisplay prompt={createdPrompt?.generatedPrompt} />
            <Group justify="center" mt="xl">
              <Button
                variant="default"
                onClick={() => setActiveStep(1)}
                size="md"
              >
                Back
              </Button>
            </Group>
          </Stepper.Step>
        </Stepper>
      </Stack>
    </Paper>
  );
};
