import React from "react";
import { IconForms } from "@tabler/icons-react";
import ContainerCard from "../../../components/ui/ContainerCard";
import { PromptFormList } from "../PromptFormList/PromptFormList";

/**
 * PromptFormPage - Page for creating a new prompt using a dynamic form definition.
 * Uses Mantine UI, React Hook Form, and Tanstack Query for data fetching.
 */
export const PromptFormPage: React.FC = () => {
  return (
    <ContainerCard
      title="Prompt Form Builder"
      subtitle="Create and manage prompt forms dynamically. Use this page to add, edit, or remove prompt forms for your agents."
      icon={IconForms}
    >
      <PromptFormList />
    </ContainerCard>
  );
};
