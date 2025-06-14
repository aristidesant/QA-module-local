import { useCampaignFormContext } from "../../campaignFormFunctions";
import { Flex, Switch, Textarea, TextInput } from "@mantine/core";
import SectionCard from "~/components/SectionCard";

const GeneralSection: React.FC = () => {
  const form = useCampaignFormContext();
  return (
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
          // checked={form.values.active}
          onChange={(event) =>
            form.setFieldValue("active", event.currentTarget.checked)
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
    </SectionCard>
  );
};

export default GeneralSection;
