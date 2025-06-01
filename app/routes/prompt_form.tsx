import { Stack } from "@mantine/core";
import PageHeader from "~/components/ui/PageHeader";
import { PromptFormPage } from "~/modules/prompt-form/PromptFormPage";

export default function PromptForm() {
  return (
    <Stack>
      <PageHeader
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Prompt Form", path: "/prompt-form" },
        ]}
      />
      <PromptFormPage />
    </Stack>
  );
}
