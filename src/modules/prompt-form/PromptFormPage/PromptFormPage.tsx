import React from "react";
import { PromptFormList } from "../PromptFormList/PromptFormList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import usePromptFormStore from "../usePromptFormStore";

export const PromptFormPage: React.FC = () => {
  const { rightComponent } = usePromptFormStore((state) => state);
  return (
    <ContentContainer
      title="Prompt Form Builder"
      rightSection={rightComponent || <></>}
      description="Create and manage prompt forms dynamically. Use this page to add, edit, or remove prompt forms for your agents."
    >
      <PromptFormList />
    </ContentContainer>
  );
};
