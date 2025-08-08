import { Group, Text, Button } from "@mantine/core";
import { IconTool, IconPlus } from "@tabler/icons-react";
import type { ToolCategoryModel } from "~/models/ToolCategoryModel";

interface ToolsListHeaderProps {
  category?: ToolCategoryModel;
  onCreate: () => void;
  toolCount?: number;
}

function ToolsListHeader({
  category,
  onCreate,
  toolCount,
}: ToolsListHeaderProps) {
  return (
    <Group align="center" justify="space-between" mb="md" p="md">
      <Group gap="sm" align="center">
        <IconTool size={20} />
        <Text size="lg" fw={600} tt={"uppercase"}>
          {category?.name} Tools
          {typeof toolCount === "number" ? ` (${toolCount})` : ""}
        </Text>
      </Group>
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={onCreate}
        variant="light"
        size="sm"
      >
        Create New Tool
      </Button>
    </Group>
  );
}

export default ToolsListHeader;
