import { Stack, Switch } from "@mantine/core";
import SectionCard from "~/components/SectionCard";
import { useToolCategories } from "~/queries/toolCategoryQueries";
import { useToolsByCategory } from "~/queries/toolQueries";

type AgentToolsProps = {
  onAgentUpdated?: (details: unknown) => void;
};

const AgentTools: React.FC<AgentToolsProps> = ({ onAgentUpdated }) => {
  const { data: toolCategories } = useToolCategories();
  const { data: tools } = useToolsByCategory(
    toolCategories?.find((cat) => cat.name === "webhook")?.id
  );
  return (
    <SectionCard
      title="Agent Tools"
      description="Tools to enhance agent functionality"
    >
      <Stack>
        {tools?.map((tool) => (
          <Switch
            key={tool?.id}
            label={tool.name}
            description={tool.description}
            // checked={...} // You can add checked state logic if needed
            // onChange={...} // You can add onChange logic if needed
          />
        ))}
      </Stack>
    </SectionCard>
  );
};

export default AgentTools;
