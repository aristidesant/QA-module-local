import { Tabs } from "@mantine/core";
import {
  IconChecklist,
  IconGalaxy,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useCampaignsStore } from "~/stores/campaignsStore";

const CampaignTabs = () => {
  const { selectedTab, setSelectedTab, setRightComponent } = useCampaignsStore(
    (state) => state
  );
  return (
    <Tabs
      value={selectedTab}
      onChange={(v) => {
        if (v) {
          setSelectedTab(v);
          setRightComponent?.(undefined);
        }
      }}
      variant="default"
      radius="md"
    >
      <Tabs.List>
        <Tabs.Tab leftSection={<IconGalaxy />} value="general">
          General
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconUser />} value="agents">
          Agents
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconUsersGroup />} value="contacts">
          Contacts
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconChecklist />} value="params">
          Params
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default CampaignTabs;
