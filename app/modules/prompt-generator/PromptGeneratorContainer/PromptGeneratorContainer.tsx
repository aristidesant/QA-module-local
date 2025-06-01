import React from "react";
import { useForm } from "@mantine/form";
import { Stepper, Group, Button, Title, Stack, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconAlertTriangle, IconInputAi } from "@tabler/icons-react";
import { PromptInputForm } from "../PromptInputForm";
import { PromptOutputDisplay } from "../PromptOutputDisplay";
import { useCreatePrompt } from "../queries/promptGeneratorQueries";
import { type Prompt } from "~/models/PromptsModels";
import { PromptTypeSelector } from "./PromptTypeSelector";
import styles from "./PromptGeneratorContainer.module.css";
import ContainerCard from "../../../components/ui/ContainerCard";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";
import { useNavigate } from "react-router";
import type { PromptType } from "~/models/PromptTypeModel";
import SectionCard from "~/components/SectionCard";

const PROMPT_TYPES = Object.values({
  FINANCE: "FINANCE",
  EDUCATION: "EDUCATION",
  SALES: "SALES",
  "CLIENT SUPPORT": "CLIENT SUPPORT",
}) as PromptInstructionType[];

export const PromptGeneratorContainer: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  const [createdPrompt, setCreatedPrompt] = React.useState<Prompt>();
  const { mutateAsync: createPrompt, isPending } = useCreatePrompt();
  const form = useForm<Record<string, string>>({});

  const handleTypeSelect = (type: number | null) => {
    setSelectedType(type);
    setActiveStep(1);
    form.reset();
    setCreatedPrompt(undefined);
  };

  const handleFormSubmit = async (values: Record<string, string>) => {
    try {
      const newPrompt = await createPrompt({
        generationInput: values,
        typeId: selectedType || undefined,
      });
      setCreatedPrompt(newPrompt);
      setActiveStep(2);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Prompt generated successfully.",
        icon: React.createElement(IconCheck, { size: 20 }),
        autoClose: 4000,
      });
    } catch (error: any) {
      let message = "An error occurred while generating the prompt.";
      if (error?.message) {
        try {
          // Try to parse error message if it's a JSON string
          const parsed =
            typeof error.message === "string" && error.message.startsWith("{")
              ? JSON.parse(error.message)
              : error;
          if (parsed?.message) {
            message = parsed.message;
          }
        } catch {
          message = error.message;
        }
      }
      notifications.show({
        color: "red",
        title: "Error",
        message,
        icon: React.createElement(IconAlertTriangle, { size: 20 }),
        autoClose: 6000,
      });
    }
  };

  return (
    <SectionCard
      description="Create and manage prompts"
      icon={IconInputAi}
      title="Prompt Generator Wizard"
    >
      <Stack gap="xl" className={styles.stackWrapper}>
        <div className={styles.stepperWrapper}>
          <Stepper active={activeStep} className={styles.wizardStepper}>
            <Stepper.Step label="Type" description="Select type">
              <PromptTypeSelector
                types={PROMPT_TYPES}
                selectedType={selectedType}
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
                      disabled={isPending}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="md"
                      className={styles.submitButton}
                      loading={isPending}
                      disabled={isPending}
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
                <Button
                  variant="default"
                  size="md"
                  onClick={() => {
                    navigate("/agent");
                  }}
                >
                  Navigate to agents
                </Button>
              </Group>
            </Stepper.Step>
          </Stepper>
          {isPending && (
            <div className={styles.loaderOverlay}>
              <div className={styles.loaderBackdrop} />
              <div className={styles.loaderContainer}>
                <Loader size="lg" color="blue" />
                <span className={styles.loaderText}>Generating prompt...</span>
              </div>
            </div>
          )}
        </div>
      </Stack>
    </SectionCard>
  );
};
