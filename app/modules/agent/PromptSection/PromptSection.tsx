import { Select, Textarea } from "@mantine/core";
import React from "react";

interface PromptSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  llm: string;
  onLlmChange: (value: string) => void;
  llmOptions: { value: string; label: string }[];
}

const PromptSection: React.FC<PromptSectionProps> = ({
  prompt,
  onPromptChange,
  llm,
  onLlmChange,
  llmOptions,
}) => {
  return (
    <div className="bg-gray-100 rounded-xl p-6 flex flex-col gap-6 border border-gray-200">
      <Textarea
        label="Prompt"
        value={prompt}
        minRows={10}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onPromptChange(e.target.value)
        }
        placeholder="Enter your prompt here..."
      />
      <Select
        label="LLM Model"
        value={llm}
        onChange={(value) => onLlmChange(value || "")}
        data={llmOptions}
      />
    </div>
  );
};

export default PromptSection;
