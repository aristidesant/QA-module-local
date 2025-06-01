import { Stack } from "@mantine/core";
import PageHeader from "~/components/ui/PageHeader";
import { PromptGeneratorContainer } from "~/modules/prompt-generator/PromptGeneratorContainer/PromptGeneratorContainer";

export default function PromptGenerator() {
  return (
    <Stack>
      <PageHeader
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Prompt Generator", path: "/prompt-generator" },
        ]}
      />
      <PromptGeneratorContainer />
    </Stack>
  );
}
