import { Table, Text, Badge, Loader, Center, Stack } from "@mantine/core";
import { IconTool } from "@tabler/icons-react";
import useToolsStore from "~/stores/toolsStore";
import { useToolsByCategory } from "~/queries/toolQueries";
import type { ToolModel } from "~/models/ToolModel";
import ToolForm from "~/modules/tools/ToolForm";
import styles from "./ToolsList.module.css";
import ToolsListHeader from "./ToolsListHeader";

interface ToolsListProps {}

function ToolsList({}: ToolsListProps) {
  const { selectedToolCategory, setToolsCategory } = useToolsStore();

  const {
    data: tools,
    isLoading,
    error,
  } = useToolsByCategory(selectedToolCategory?.id);

  const handleToolClick = (tool: ToolModel) => {
    const toolForm = (
      <ToolForm
        toolId={tool.id}
        onSuccess={() => {
          // Close the form by setting right component to null
          setToolsCategory(selectedToolCategory, null);
        }}
        onCancel={() => {
          // Close the form by setting right component to null
          setToolsCategory(selectedToolCategory, null);
        }}
      />
    );
    setToolsCategory(selectedToolCategory, toolForm);
  };

  const handleCreateNewTool = () => {
    const toolForm = (
      <ToolForm
        categoryId={selectedToolCategory?.id}
        onSuccess={() => {
          // Close the form by setting right component to null
          setToolsCategory(selectedToolCategory, null);
        }}
        onCancel={() => {
          // Close the form by setting right component to null
          setToolsCategory(selectedToolCategory, null);
        }}
      />
    );
    setToolsCategory(selectedToolCategory, toolForm);
  };

  // Show message when no category is selected
  if (!selectedToolCategory) {
    return (
      <Center className={styles.emptyState}>
        <Stack align="center" gap="md">
          <IconTool size={48} color="var(--mantine-color-gray-5)" />
          <Text size="lg" fw={500} c="dimmed">
            Select a category first
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Choose a tool category from the sidebar to view its tools
          </Text>
        </Stack>
      </Center>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Center className={styles.loadingState}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Loading tools...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Show error state
  if (error) {
    return (
      <Center className={styles.emptyState}>
        <Stack align="center" gap="md">
          <IconTool size={48} color="var(--mantine-color-red-5)" />
          <Text size="lg" fw={500} c="red">
            Error loading tools
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {error.message}
          </Text>
        </Stack>
      </Center>
    );
  }

  // Show empty state when no tools found
  if (!tools || tools.length === 0) {
    return (
      <div className={styles.container}>
        {selectedToolCategory && (
          <ToolsListHeader
            category={selectedToolCategory}
            onCreate={handleCreateNewTool}
          />
        )}

        <Center className={styles.emptyState}>
          <Stack align="center" gap="md">
            <IconTool size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={500} c="dimmed">
              No tools in this category
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              There are no tools under "{selectedToolCategory?.name}" category.
              <br />
              Add one to get started.
            </Text>
          </Stack>
        </Center>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCreatorName = (tool: ToolModel) => {
    return tool.config?.accessInfo?.creatorName || "Unknown";
  };

  return (
    <div className={styles.container}>
      <ToolsListHeader
        category={selectedToolCategory}
        onCreate={handleCreateNewTool}
        toolCount={tools.length}
      />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={"60%"}>Name</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Created by</Table.Th>
            <Table.Th>Created</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tools.map((tool) => (
            <Table.Tr
              key={tool.id}
              className={styles.tableRow}
              onClick={() => handleToolClick(tool)}
              style={{ cursor: "pointer" }}
            >
              <Table.Td>
                <div>
                  <Text fw={500} size="sm">
                    {tool.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {tool.description}
                  </Text>
                </div>
              </Table.Td>

              <Table.Td>
                <Badge
                  color={getStatusBadgeColor(tool.status)}
                  variant="light"
                  size="sm"
                >
                  {tool.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{getCreatorName(tool)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {formatDate(tool.createdAt)}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}

export default ToolsList;
