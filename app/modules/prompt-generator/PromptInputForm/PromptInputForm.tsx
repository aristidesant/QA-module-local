import React, { useState, useEffect } from "react";
import {
  Textarea,
  Stack,
  Title,
  SimpleGrid,
  Loader,
  Center,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  Tabs,
  ScrollArea,
  Card,
  Box,
} from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import {
  IconCheck,
  IconCircleCheck,
  IconCirclePlus,
} from "@tabler/icons-react";
import styles from "./PromptInputForm.module.css";
import { useGetAllPromptForms } from "~/queries/promptFormQueries";
import type { PromptForm } from "~/models/PromptFormMOdel";

interface PromptInputFormProps {
  form: UseFormReturnType<Record<string, string>>;
  type?: number | null;
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  form,
  type,
}) => {
  const [selectedForm, setSelectedForm] = useState<PromptForm | null>(null);

  const {
    data: forms,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllPromptForms({ typeId: type });

  // Auto-select the only form if there's just one available
  useEffect(() => {
    if (forms && Array.isArray(forms) && forms.length === 1) {
      setSelectedForm(forms[0]);
    }
  }, [forms]);

  // Handle loading
  if (isLoading || isFetching) {
    return (
      <Center py="xl">
        <Loader size="lg" color="indigo" />
        <Text ml="md" size="lg" fw={600} c="indigo.7">
          Loading form definition…
        </Text>
      </Center>
    );
  }

  // Handle error
  if (isError) {
    return (
      <Center py="xl">
        <Stack
          align="center"
          gap="xs"
          bg="red.0"
          p="lg"
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(255,0,0,0.04)",
          }}
        >
          <Text c="red.7" size="lg" fw={600}>
            Unable to load the form. Please check your connection and try again.
          </Text>
          <Button
            variant="gradient"
            gradient={{ from: "red", to: "indigo", deg: 90 }}
            size="sm"
            leftSection={<IconCircleCheck size={18} />}
            onClick={() => refetch()}
            radius="md"
            fw={500}
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  // Defensive checks for forms existence
  if (!Array.isArray(forms) || forms.length === 0) {
    return (
      <Center py="xl">
        <Stack
          gap="md"
          align="center"
          bg="gray.0"
          p="lg"
          style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <Text size="lg" fw={600} c="gray.7">
            No form definition found for this type. Please select another type
            to continue.
          </Text>
        </Stack>
      </Center>
    );
  }

  const selectForm = (form: PromptForm) => {
    if (selectedForm?.id === form.id) {
      // If clicking on the already selected form, deselect it
      setSelectedForm(null);
    } else {
      // Otherwise select the new form
      setSelectedForm(form);
    }
  };

  const renderFormFields = (formDef: PromptForm) => {
    const fields = formDef?.form?.fields ?? [];

    if (!Array.isArray(fields) || fields.length === 0) {
      return (
        <Text size="md" c="gray.6" ta="center" py="md">
          This form has no input fields defined.
        </Text>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1 }} spacing="lg">
        {fields.map((item: any) => (
          <Textarea
            key={item.name}
            label={item.label || "Field"}
            placeholder={item.placeholder || "Type here…"}
            {...form.getInputProps(item.name)}
            required={item.required}
            size="md"
            description={item.description}
            className={styles.textareaField}
            autosize
            minRows={2}
            maxRows={6}
            radius="md"
            withAsterisk={item.required}
            styles={{
              input: {
                background: "#f8f9fa",
                borderColor: "#e0e3ea",
                fontSize: 16,
                color: "#222",
              },
              label: {
                fontWeight: 600,
                color: "#495057",
                marginBottom: 4,
              },
              description: {
                color: "#868e96",
                fontSize: 13,
              },
            }}
          />
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Stack
      gap="xl"
      bg="white"
      p="xl"
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(80, 112, 255, 0.07)",
      }}
    >
      <Title order={3} className={styles.sectionTitle} c="indigo.7" fw={700}>
        Form Selection
      </Title>

      <Text size="md" c="gray.6" mb="md">
        Select a form to generate a personalized prompt for your agent.
        {forms.length === 1 ? " One form has been automatically selected." : ""}
      </Text>

      <div className={styles.formSelectionArea}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {forms.map((formDef) => (
            <Card
              key={formDef.id}
              className={`${styles.formCard} ${
                selectedForm?.id === formDef.id ? styles.selectedFormCard : ""
              }`}
              onClick={() => selectForm(formDef)}
              padding="md"
            >
              <div className={styles.formCardTitle}>
                <Text fw={600} size="md">
                  {formDef.name}
                </Text>
                {selectedForm?.id === formDef.id && (
                  <IconCheck size={20} color="var(--mantine-color-indigo-6)" />
                )}
              </div>
              <Text size="sm" c="gray.6" lineClamp={2}>
                {`Form Type: ${formDef.type?.name || "Custom"}`}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </div>

      {!selectedForm ? (
        <Box className={styles.noFormsSelected}>
          <Text size="md" fw={500} c="gray.6">
            Please select a form to continue
          </Text>
        </Box>
      ) : (
        <>
          <Title
            order={4}
            className={styles.sectionTitle}
            c="indigo.7"
            fw={600}
          >
            Form Inputs
          </Title>

          <Text size="md" c="gray.6" mb="md">
            Please fill in the required fields to generate a personalized
            prompt.
          </Text>
          {renderFormFields(selectedForm)}
        </>
      )}
    </Stack>
  );
};
