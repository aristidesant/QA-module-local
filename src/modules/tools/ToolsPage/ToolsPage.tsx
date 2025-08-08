import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { Stack } from "@mantine/core";
import ToolsCategories from "../ToolsList/ToolsCategories";
import useToolsStore from "~/stores/toolsStore";
import ToolsList from "../ToolsList";

const ToolsPage = () => {
  const { rightComponent } = useToolsStore((state) => state);
  return (
    <ContentContainer
      title="Tools"
      description="Manage your tools and integrations"
      rightSection={rightComponent ? rightComponent : <></>}
    >
      <Stack>
        <ToolsCategories />
        <ToolsList />
      </Stack>
    </ContentContainer>
  );
};

export default ToolsPage;
