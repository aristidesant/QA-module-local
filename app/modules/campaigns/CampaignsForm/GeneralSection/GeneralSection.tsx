import { useCampaignFormContext } from "../../campaignFormFunctions";
import { Button, Flex, Switch, Textarea, TextInput } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import SectionCard from "~/components/SectionCard";
import { useCampaignsStore } from "~/stores/campaignsStore";

const GeneralSection: React.FC = () => {
  const { selectedCampaign } = useCampaignsStore((state) => state);
  const form = useCampaignFormContext();

  return (
    <>
      <SectionCard
        title="Basic Information"
        description="Define the core details of your campaign to ensure clarity and easy identification."
      >
        <Flex align={"center"}>
          <TextInput
            label="Campaign Name"
            placeholder="Enter campaign name"
            required
            style={{ flex: 1, marginRight: "1rem" }}
            {...form.getInputProps("name")}
          />
          <Switch
            label="Active"
            checked={form.values.status === "ACTIVE"}
            onChange={(event) =>
              form.setFieldValue(
                "status",
                event.currentTarget.checked ? "ACTIVE" : "INACTIVE"
              )
            }
          />
        </Flex>
        <Textarea
          {...form.getInputProps("description")}
          placeholder="Describe your campaign"
          label="Description"
          autosize
          minRows={5}
        />
        <Flex justify={"end"}>
          <Button leftSection={<IconDeviceFloppy />} type="submit">
            Save
          </Button>
        </Flex>
      </SectionCard>
    </>
  );
};

export default GeneralSection;
