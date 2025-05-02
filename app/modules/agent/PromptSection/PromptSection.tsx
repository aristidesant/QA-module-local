import React from "react";
import TextArea from "../../../components/core/TextArea";
import Select from "../../../components/core/Select";

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
      <TextArea
        label="Prompt"
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onPromptChange(e.target.value)
        }
        textareaClassName="min-h-[80px]"
        placeholder="Enter your prompt here..."
      />
      <Select
        label="LLM Model"
        value={llm}
        onChange={onLlmChange}
        options={llmOptions}
      />
    </div>
  );
};

export default PromptSection;
