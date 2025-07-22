import React, { useEffect, useState } from "react";
import {
  Stack,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Loader,
  Center,
  Slider,
  ActionIcon,
  Divider,
  Badge,
  Box,
  Alert,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconDeviceFloppy,
  IconX,
  IconPlus,
  IconTrash,
  IconTool,
  IconAlertCircle,
  IconInfoCircle,
  IconMinus,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useToolById,
  useCreateTool,
  useUpdateTool,
} from "~/queries/toolQueries";
import { useToolCategories } from "~/queries/toolCategoryQueries";
import type { ToolModel, ToolRequestBodyProperty } from "~/models/ToolModel";
import type { ToolCategoryModel } from "~/models/ToolCategoryModel";
import styles from "./ToolForm.module.css";

interface ToolFormProps {
  toolId?: string | number;
  categoryId?: string | number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface HeaderField {
  key: string;
  value: string;
}

interface QueryParameter {
  key: string;
  value: string;
}

interface PathParameter {
  key: string;
  value: string;
}

interface RequestBodyProperty {
  key: string;
  type: string;
  description: string;
  constantValue?: string;
  dynamicVariable?: string;
  required: boolean;
}

interface FormValues {
  name: string;
  description: string;
  identifier: string;
  categoryId: string;
  status: string;
  url: string;
  method: string;
  responseTimeoutSecs: number;
  headers: HeaderField[];
  queryParameters: QueryParameter[];
  pathParameters: PathParameter[];
  requestBodyProperties: RequestBodyProperty[];
  authConnection: string;
}

const HTTP_METHODS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "PATCH", label: "PATCH" },
  { value: "DELETE", label: "DELETE" },
];

const PROPERTY_TYPES = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "array", label: "Array" },
  { value: "object", label: "Object" },
];

function ToolForm({ toolId, categoryId, onSuccess, onCancel }: ToolFormProps) {
  const [isEdit, setIsEdit] = useState(!!toolId);

  // Queries
  const {
    data: tool,
    isLoading: isLoadingTool,
    error: toolError,
  } = useToolById(toolId);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useToolCategories();
  const createToolMutation = useCreateTool();
  const updateToolMutation = useUpdateTool();

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      description: "",
      identifier: "",
      categoryId: categoryId ? categoryId.toString() : "",
      status: "active",
      url: "",
      method: "GET",
      responseTimeoutSecs: 30,
      headers: [],
      queryParameters: [],
      pathParameters: [],
      requestBodyProperties: [],
      authConnection: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "Name is required"),
      description: (value) => (value.trim() ? null : "Description is required"),
      categoryId: (value) => (value ? null : "Category is required"),
      url: (value) => {
        if (!value.trim()) return "URL is required";
        try {
          new URL(value);
          return null;
        } catch {
          return "Please enter a valid URL";
        }
      },
    },
  });

  // Initialize form state based on props
  useEffect(() => {
    if (toolId) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
      // Reset form to clean state for new tool creation
      form.setValues({
        name: "",
        description: "",
        identifier: "",
        categoryId: categoryId ? categoryId.toString() : "",
        status: "active",
        url: "",
        method: "GET",
        responseTimeoutSecs: 30,
        headers: [],
        queryParameters: [],
        pathParameters: [],
        requestBodyProperties: [],
        authConnection: "",
      });
    }
  }, [toolId, categoryId]);

  // Set edit mode and populate form when tool data is available
  useEffect(() => {
    if (toolId && tool) {
      setIsEdit(true);

      // Extract headers from tool config
      const headers = Object.entries(
        tool.config?.toolConfig?.apiSchema?.requestHeaders || {}
      ).map(([key, value]) => ({ key, value: value as string }));

      // Extract path parameters
      const pathParameters = Object.entries(
        tool.config?.toolConfig?.apiSchema?.pathParamsSchema || {}
      ).map(([key, value]) => ({ key, value: value as string }));

      // Extract request body properties
      const requestBodyProperties = Object.entries(
        tool.config?.toolConfig?.apiSchema?.requestBodySchema?.properties || {}
      ).map(([key, property]) => ({
        key,
        type: (property as ToolRequestBodyProperty).type,
        description: (property as ToolRequestBodyProperty).description,
        constantValue:
          (property as ToolRequestBodyProperty).constantValue || "",
        dynamicVariable:
          (property as ToolRequestBodyProperty).dynamicVariable || "",
        required:
          tool.config?.toolConfig?.apiSchema?.requestBodySchema?.required?.includes(
            key
          ) || false,
      }));

      form.setValues({
        name: tool.name,
        description: tool.description,
        identifier: tool.identifier,
        categoryId: tool.categoryId.toString(),
        status: tool.status,
        url: tool.config?.toolConfig?.apiSchema?.url || "",
        method: tool.config?.toolConfig?.apiSchema?.method || "GET",
        responseTimeoutSecs: tool.config?.toolConfig?.responseTimeoutSecs || 30,
        headers,
        queryParameters: [], // Not directly stored in the model, would need to parse from URL
        pathParameters,
        requestBodyProperties,
        authConnection:
          tool.config?.toolConfig?.apiSchema?.auth_connection || "",
      });
    } else {
      setIsEdit(false);
      // Reset form to initial values and set categoryId if provided
      form.setValues({
        name: "",
        description: "",
        identifier: "",
        categoryId: categoryId ? categoryId.toString() : "",
        status: "active",
        url: "",
        method: "GET",
        responseTimeoutSecs: 30,
        headers: [],
        queryParameters: [],
        pathParameters: [],
        requestBodyProperties: [],
        authConnection: "",
      });
    }
  }, [tool, toolId, categoryId]);

  const handleSubmit = async (values: FormValues) => {
    try {
      // Convert form values to ToolModel structure
      const requestHeaders = values.headers.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const pathParamsSchema = values.pathParameters.reduce((acc, param) => {
        if (param.key && param.value) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      const requestBodyProperties = values.requestBodyProperties.reduce(
        (acc, prop) => {
          if (prop.key) {
            acc[prop.key] = {
              type: prop.type,
              description: prop.description,
              constantValue: prop.constantValue || "",
              dynamicVariable: prop.dynamicVariable || "",
            };
          }
          return acc;
        },
        {} as Record<string, ToolRequestBodyProperty>
      );

      const requiredFields = values.requestBodyProperties
        .filter((prop) => prop.required && prop.key)
        .map((prop) => prop.key);

      const toolData: Partial<ToolModel> = {
        name: values.name,
        description: values.description,
        identifier: values.identifier,
        categoryId: parseInt(values.categoryId),
        status: values.status,
        config: {
          id: isEdit ? tool?.config?.id || "" : `tool-${Date.now()}`,
          accessInfo: {
            role: "creator",
            isCreator: true,
            creatorName: "Current User", // This should come from auth context
            creatorEmail: "user@example.com", // This should come from auth context
          },
          toolConfig: {
            name: values.name,
            type: "http",
            description: values.description,
            responseTimeoutSecs: values.responseTimeoutSecs,
            apiSchema: {
              url: values.url,
              method: values.method,
              requestHeaders,
              auth_connection: values.authConnection || null,
              pathParamsSchema,
              requestBodySchema: {
                type: "object",
                required: requiredFields,
                properties: requestBodyProperties,
                description: values.description,
              },
            },
            dynamicVariables: {
              dynamicVariablePlaceholders: {},
            },
          },
        },
      };

      if (isEdit && toolId) {
        await updateToolMutation.mutateAsync({
          id: toolId,
          data: toolData,
        });
        notifications.show({
          title: "Success",
          message: "Tool updated successfully!",
          color: "green",
          icon: <IconDeviceFloppy size={18} />,
        });
      } else {
        await createToolMutation.mutateAsync(toolData);
        notifications.show({
          title: "Success",
          message: "Tool created successfully!",
          color: "green",
          icon: <IconDeviceFloppy size={18} />,
        });
      }

      onSuccess?.();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error?.message || `Failed to ${isEdit ? "update" : "create"} tool`,
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    }
  };

  const addHeader = () => {
    form.insertListItem("headers", { key: "", value: "" });
  };

  const removeHeader = (index: number) => {
    form.removeListItem("headers", index);
  };

  const addQueryParameter = () => {
    form.insertListItem("queryParameters", { key: "", value: "" });
  };

  const removeQueryParameter = (index: number) => {
    form.removeListItem("queryParameters", index);
  };

  const addPathParameter = () => {
    form.insertListItem("pathParameters", { key: "", value: "" });
  };

  const removePathParameter = (index: number) => {
    form.removeListItem("pathParameters", index);
  };

  const addRequestBodyProperty = () => {
    form.insertListItem("requestBodyProperties", {
      key: "",
      type: "string",
      description: "",
      constantValue: "",
      dynamicVariable: "",
      required: false,
    });
  };

  const removeRequestBodyProperty = (index: number) => {
    form.removeListItem("requestBodyProperties", index);
  };

  if (toolId && isLoadingTool) {
    return (
      <Center className={styles.loadingState}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Loading tool...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (toolId && toolError) {
    return (
      <div className={styles.errorState}>
        <Stack align="center" gap="md">
          <IconAlertCircle size={48} color="var(--mantine-color-red-5)" />
          <Text size="lg" fw={500} c="red">
            Error loading tool
          </Text>
          <Text size="sm" c="dimmed">
            {toolError.message}
          </Text>
        </Stack>
      </div>
    );
  }

  const categoryOptions = categories.map((category: ToolCategoryModel) => ({
    value: category.id.toString(),
    label: category.name,
  }));

  return (
    <div className={styles.formContainer}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <Group gap="sm">
              <IconTool size={24} />
              <Text size="lg" fw={600}>
                {isEdit ? "Edit Tool" : "Create New Tool"}
              </Text>
            </Group>
            {isEdit && tool && (
              <Badge color="blue" variant="light">
                ID: {tool.id}
              </Badge>
            )}
          </Group>

          {/* Basic Configuration */}
          <div className={styles.formSection}>
            <Text className={styles.sectionTitle}>Basic Configuration</Text>
            <Text className={styles.sectionDescription}>
              Define the basic properties of your tool.
            </Text>

            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Enter tool name"
                required
                {...form.getInputProps("name")}
              />
              {form?.values?.identifier && (
                <TextInput
                  label="Identifier"
                  placeholder="Enter unique identifier"
                  disabled
                  {...form.getInputProps("identifier")}
                />
              )}
              <Select
                label="Category"
                placeholder="Select category"
                required
                data={categoryOptions}
                disabled={isLoadingCategories}
                {...form.getInputProps("categoryId")}
              />
              <Select
                label="Status"
                data={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                {...form.getInputProps("status")}
              />
              <Textarea
                label="Description"
                placeholder="Describe what this tool does and when to use it"
                required
                minRows={5}
                rows={5}
                {...form.getInputProps("description")}
              />
            </Stack>
          </div>

          {/* API Configuration */}
          <div className={styles.formSection}>
            <Text className={styles.sectionTitle}>API Configuration</Text>
            <Text className={styles.sectionDescription}>
              Configure the HTTP request details for your tool.
            </Text>

            <Stack gap="md">
              <Select
                label="Method"
                data={HTTP_METHODS}
                {...form.getInputProps("method")}
              />
              <TextInput
                label="URL"
                placeholder="https://api.example.com/endpoint"
                required
                {...form.getInputProps("url")}
              />
              <TextInput
                label="Authentication Connection"
                placeholder="Leave empty if no authentication required"
                {...form.getInputProps("authConnection")}
              />
            </Stack>
          </div>

          {/* Headers */}
          <div className={styles.formSection}>
            <Group justify="space-between" mb="md">
              <div>
                <Text className={styles.sectionTitle}>Headers</Text>
                <Text className={styles.sectionDescription}>
                  Define headers that will be sent with the request.
                </Text>
              </div>
            </Group>

            <Stack gap={"xs"}>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addHeader}
                className={styles.addButton}
              >
                Add Header
              </Button>
              {form.values.headers.map((_, index) => (
                <Paper bg="gray.0" p="xs" key={index} withBorder>
                  <Stack gap="xs">
                    <TextInput
                      placeholder="Header name"
                      flex={1}
                      {...form.getInputProps(`headers.${index}.key`)}
                    />
                    <TextInput
                      placeholder="Header value"
                      flex={1}
                      {...form.getInputProps(`headers.${index}.value`)}
                    />
                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconMinus />}
                      onClick={() => removeHeader(index)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            {form.values.headers.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No headers defined. Click "Add Header" to add one.
              </Text>
            )}
          </div>

          {/* Path Parameters */}
          <div className={styles.formSection}>
            <Group justify="space-between" mb="md">
              <div>
                <Text className={styles.sectionTitle}>Path Parameters</Text>
                <Text className={styles.sectionDescription}>
                  Add path parameters wrapped in curly braces to the URL to
                  configure them here.
                </Text>
              </div>
            </Group>
            <Stack gap={"xs"}>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addPathParameter}
                className={styles.addButton}
              >
                Add Parameter
              </Button>
              {form.values.pathParameters.map((param, index) => (
                <div key={index} className={styles.parameterField}>
                  <Stack gap="sm">
                    <TextInput
                      placeholder="Parameter name"
                      flex={1}
                      {...form.getInputProps(`pathParameters.${index}.key`)}
                    />
                    <TextInput
                      placeholder="Parameter value/description"
                      flex={1}
                      {...form.getInputProps(`pathParameters.${index}.value`)}
                    />
                    <Button
                      color="red"
                      variant="light"
                      onClick={() => removePathParameter(index)}
                      leftSection={<IconMinus size={16} />}
                    >
                      Remove
                    </Button>
                  </Stack>
                </div>
              ))}
            </Stack>
            {form.values.pathParameters.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No path parameters defined.
              </Text>
            )}
          </div>

          {/* Query Parameters */}
          <div className={styles.formSection}>
            <Group justify="space-between" mb="md">
              <div>
                <Text className={styles.sectionTitle}>Query Parameters</Text>
                <Text className={styles.sectionDescription}>
                  Define parameters that will be collected by the LLM and sent
                  as the query of the request.
                </Text>
              </div>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addQueryParameter}
                className={styles.addButton}
              >
                Add Parameter
              </Button>
            </Group>

            {form.values.queryParameters.map((param, index) => (
              <div key={index} className={styles.parameterField}>
                <Group gap="sm" className={styles.parameterItem}>
                  <TextInput
                    placeholder="Parameter name"
                    flex={1}
                    {...form.getInputProps(`queryParameters.${index}.key`)}
                  />
                  <TextInput
                    placeholder="Parameter description"
                    flex={1}
                    {...form.getInputProps(`queryParameters.${index}.value`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeQueryParameter(index)}
                    className={styles.removeButton}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </div>
            ))}

            {form.values.queryParameters.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No query parameters defined.
              </Text>
            )}
          </div>

          {/* Request Body Properties */}
          {(form.values.method === "POST" ||
            form.values.method === "PUT" ||
            form.values.method === "PATCH") && (
            <div className={styles.formSection}>
              <Group justify="space-between" mb="md">
                <div>
                  <Text className={styles.sectionTitle}>
                    Request Body Properties
                  </Text>
                  <Text className={styles.sectionDescription}>
                    Define the JSON schema properties for the request body.
                  </Text>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={addRequestBodyProperty}
                  className={styles.addButton}
                >
                  Add Property
                </Button>
              </Group>

              {form.values.requestBodyProperties.map((property, index) => (
                <Box key={index} className={styles.parameterField} mb="sm">
                  <Stack gap="xs">
                    <Group gap={"xs"}>
                      <TextInput
                        placeholder="Property name"
                        flex={1}
                        {...form.getInputProps(
                          `requestBodyProperties.${index}.key`
                        )}
                      />
                      <Select
                        placeholder="Type"
                        data={PROPERTY_TYPES}
                        flex={1}
                        comboboxProps={{
                          width: 130,
                          withArrow: true,
                        }}
                        {...form.getInputProps(
                          `requestBodyProperties.${index}.type`
                        )}
                      />
                    </Group>

                    <Textarea
                      placeholder="Property description"
                      rows={5}
                      {...form.getInputProps(
                        `requestBodyProperties.${index}.description`
                      )}
                    />
                    <TextInput
                      placeholder="Constant value (optional)"
                      {...form.getInputProps(
                        `requestBodyProperties.${index}.constantValue`
                      )}
                    />
                    <TextInput
                      placeholder="Dynamic variable (optional)"
                      {...form.getInputProps(
                        `requestBodyProperties.${index}.dynamicVariable`
                      )}
                    />
                    <Button
                      variant="light"
                      leftSection={<IconMinus size={16} />}
                      color="red"
                      onClick={() => removeRequestBodyProperty(index)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}

              {form.values.requestBodyProperties.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No request body properties defined.
                </Text>
              )}
            </div>
          )}

          {/* Dynamic Variables Info */}
          <Alert
            icon={<IconInfoCircle size="1rem" />}
            color="blue"
            className={styles.dynamicVariableSection}
          >
            <Text size="sm" fw={500} mb="xs">
              Dynamic Variables
            </Text>
            <Text size="sm">
              Variables in tool parameters will be replaced with actual values
              when the conversation starts. This helps make your tools more
              flexible and context-aware.
            </Text>
          </Alert>

          <Divider />

          {/* Action Buttons */}
          <Group justify="flex-end" className={styles.buttonGroup}>
            {onCancel && (
              <Button
                variant="subtle"
                leftSection={<IconX size={16} />}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={
                createToolMutation.isPending || updateToolMutation.isPending
              }
            >
              {isEdit ? "Update Tool" : "Create Tool"}
            </Button>
          </Group>
        </Stack>
      </form>
    </div>
  );
}

export default ToolForm;
