import React from "react";
import {
  Textarea,
  Stack,
  Title,
  SimpleGrid,
  Loader,
  Center,
  Text,
  Button,
} from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import styles from "./PromptInputForm.module.css";
import { useGetAllPromptForms } from "~/queries/promptFormQueries";

interface PromptInputFormProps {
  form: UseFormReturnType<Record<string, string>>;
  type?: number | null;
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  form,
  type,
}) => {
  const {
    data: forms,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllPromptForms({ typeId: type });

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
            leftSection={<span className="tabler-icon-refresh" />}
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

  // Defensive checks for form existence and fields
  const formDef = Array.isArray(forms) && forms.length > 0 ? forms[0] : null;
  const fields = formDef?.form?.fields ?? [];

  if (!formDef || !Array.isArray(fields) || fields.length === 0) {
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
        Agent Details
      </Title>
      <Text size="md" c="gray.6" mb="sm">
        Please fill in the required fields to generate a personalized prompt for
        your agent.
      </Text>
      <SimpleGrid cols={{ base: 1 }} spacing="lg">
        {fields.map((item) => (
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
    </Stack>
  );
};
