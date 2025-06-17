import React from "react";
import { PromptFormList } from "../PromptFormList/PromptFormList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";

export const PromptFormPage: React.FC = () => {
  return (
    <ContentContainer
      title="Prompt Form Builder"
      description="Create and manage prompt forms dynamically. Use this page to add, edit, or remove prompt forms for your agents."
    >
      <PromptFormList />
    </ContentContainer>
  );
};
