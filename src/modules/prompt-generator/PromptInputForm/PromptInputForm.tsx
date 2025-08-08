import React, { useState, useEffect } from "react";
import {
  Textarea,
  Stack,
  Title,
  SimpleGrid,
  Loader,
  Text,
  Button,
  SegmentedControl,
  rem,
  Box,
  Divider,
} from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import { IconCircleCheck } from "@tabler/icons-react";
import styles from "./PromptInputForm.module.css";
import { useGetAllPromptForms } from "~/queries/promptFormQueries";
import type { PromptType } from "~/models/PromptTypeModel";
import type { PromptForm } from "~/models/PromptFormModel";

interface FormWithType extends Omit<PromptForm, "type"> {
  type: PromptType;
}

interface PromptInputFormProps {
  form: UseFormReturnType<Record<string, string>>;
  type?: number | null;
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  form,
  type,
}) => {
  const [selectedForm, setSelectedForm] = useState<FormWithType | null>(null);

  const {
    data: forms,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllPromptForms({ typeId: type });

  // Auto-select the only form if there's just one available
  useEffect(() => {
    if (forms && Array.isArray(forms) && forms.length === 1) {
      setSelectedForm(forms[0]);
    }
  }, [forms]);

  // Handle loading
  if (isLoading) {
    return (
      <Box
        p="xl"
        style={{
          borderRadius: "var(--mantine-radius-md)",
          border: "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Stack gap="md" align="center">
          <Loader
            size="lg"
            variant="dots"
            color="var(--mantine-color-indigo-6)"
          />
          <Text size="sm" c="dimmed">
            Loading form definitions...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Handle error
  if (isError) {
    return (
      <Box
        p="xl"
        style={{
          borderRadius: "var(--mantine-radius-md)",
          border: "1px solid var(--mantine-color-red-2)",
          backgroundColor: "var(--mantine-color-red-0)",
        }}
      >
        <Stack gap="md" align="center" ta="center">
          <Text size="md" c="red.7" fw={500}>
            Error loading forms
          </Text>
          <Text size="sm" c="red.6" mb="sm">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </Text>
          <Button
            variant="filled"
            color="red.6"
            size="sm"
            leftSection={<IconCircleCheck size={16} />}
            onClick={() => refetch()}
            radius="md"
            fw={500}
            style={{
              "--button-bg": "var(--mantine-color-red-6)",
              "--button-hover": "var(--mantine-color-red-7)",
            }}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  // Defensive checks for forms existence
  if (!Array.isArray(forms) || forms.length === 0) {
    return (
      <Box
        p="xl"
        style={{
          borderRadius: "var(--mantine-radius-md)",
          border: "1px dashed var(--mantine-color-gray-3)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Stack gap="sm" align="center" ta="center">
          <Text size="md" fw={500} c="gray.7">
            No forms available
          </Text>
          <Text size="sm" c="dimmed">
            No form definitions found for this type. Please try another type or
            check back later.
          </Text>
        </Stack>
      </Box>
    );
  }

  const selectForm = (formId: string) => {
    const form = forms?.find((f) => String(f.id) === formId);
    if (form) {
      setSelectedForm({
        ...form,
        type: form.type, // Ensure type is properly typed as PromptType
      });
    } else {
      setSelectedForm(null);
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
                background: "var(--mantine-color-gray-0)",
                borderColor: "var(--mantine-color-gray-3)",
                fontSize: "var(--mantine-font-size-sm)",
                color: "var(--mantine-color-gray-9)",
                "&:focus": {
                  borderColor: "var(--mantine-color-indigo-5)",
                  boxShadow: "0 0 0 2px var(--mantine-color-indigo-1)",
                },
              },
              label: {
                fontWeight: 500,
                color: "var(--mantine-color-gray-8)",
                marginBottom: rem(4),
                fontSize: "var(--mantine-font-size-sm)",
              },
              description: {
                color: "var(--mantine-color-gray-6)",
                fontSize: "var(--mantine-font-size-xs)",
                fontWeight: 400,
                marginBottom: rem(4),
              },
            }}
          />
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Stack gap="md">
      <Title order={4} fw={600}>
        Form Selection
      </Title>

      <Text size="sm" c="gray.6">
        Select a form to generate a personalized prompt for your agent.
        {forms.length === 1 ? " One form has been automatically selected." : ""}
      </Text>

      <SegmentedControl
        fullWidth
        orientation="horizontal"
        value={selectedForm?.id ? String(selectedForm.id) : ""}
        onChange={selectForm}
        data={(forms || []).map((form) => ({
          value: String(form.id),
          label: (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: rem(14),
                  fontWeight: 500,
                  color: "var(--mantine-color-gray-9)",
                }}
              >
                {form.name}
              </div>
              {form.type?.name && (
                <div
                  style={{
                    fontSize: rem(12),
                    color: "var(--mantine-color-gray-6)",
                    marginTop: rem(2),
                    fontWeight: 400,
                  }}
                >
                  {form.type.name}
                </div>
              )}
            </div>
          ),
        }))}
        styles={{
          root: {
            backgroundColor: "var(--mantine-color-gray-0)",
            borderRadius: "var(--mantine-radius-md)",
            padding: rem(4),
            border: "1px solid var(--mantine-color-gray-2)",
          },
          label: {
            padding: `${rem(8)} ${rem(12)}`,
            height: "auto",
            minHeight: rem(48),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--mantine-radius-sm)",
            "&[data-active]": {
              backgroundColor: "var(--mantine-color-white)",
              color: "var(--mantine-color-indigo-7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid var(--mantine-color-indigo-2)",
            },
            "&:hover": {
              backgroundColor: "var(--mantine-color-gray-1)",
            },
          },
        }}
      />
      <Divider />
      {!selectedForm ? (
        <Box
          bg="gray.0"
          p="md"
          style={{
            borderRadius: "var(--mantine-radius-md)",
            border: "1px dashed var(--mantine-color-gray-3)",
          }}
        >
          <Text size="sm" c="dimmed" ta="center">
            Please select a form to continue
          </Text>
        </Box>
      ) : (
        <Box mt="md">
          <Title order={4} fw={600} mb="xs">
            {selectedForm.name}
          </Title>
          {selectedForm.type?.name && (
            <Text size="sm" c="gray.6" mb="md">
              {selectedForm.type.name}
            </Text>
          )}
          <Box mt="sm">{renderFormFields(selectedForm)}</Box>
        </Box>
      )}
    </Stack>
  );
};
