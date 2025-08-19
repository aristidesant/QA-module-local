// BasicConfiguration.tsx
import React from "react";
import { Select, Textarea } from "@mantine/core";
import { IconLanguage, IconSettings } from "@tabler/icons-react";
import type { AgentConfigModel } from "~/models/AgentListObject";
import styles from "./BasicConfiguration.module.css";
import SectionCard from "../../../../components/SectionCard";

interface BasicConfigurationProps {
	agentData: Partial<AgentConfigModel>;
	onUpdateAgentData: (updatedFields: any) => void;
}

const BasicConfiguration: React.FC<BasicConfigurationProps> = ({
	agentData,
	onUpdateAgentData,
}) => {
	const currentLanguage = agentData?.conversationConfig?.agent?.language || "";
	const languageOptions = [
		{ value: "en", label: "English" },
		{ value: "es", label: "Spanish" },
	];

	const handleLanguageChange = (value: string | null) => {
		if (value) {
			onUpdateAgentData({
				conversationConfig: {
					...(agentData?.conversationConfig || {}),
					agent: {
						...(agentData?.conversationConfig?.agent || {}),
						language: value,
					},
				},
			});
		}
	};

	return (
		<SectionCard
			icon={IconSettings}
			title="Basic Configuration"
			description="Configure the fundamental settings for your agent"
			className={styles.sectionCard}
			contentSpacing="lg"
		>
			<Select
				label="Language"
				placeholder="Select language"
				value={currentLanguage}
				onChange={handleLanguageChange}
				data={languageOptions}
				description="Choose the language for the agent's responses"
				searchable
				nothingFoundMessage="No language found"
				leftSection={<IconLanguage size={16} />}
			/>
			<Textarea
				placeholder="Enter the first message your agent will send..."
				rows={4}
				label="Agent First Message"
				value={agentData?.conversationConfig?.agent?.first_message || ""}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					onUpdateAgentData({
						conversationConfig: {
							...(agentData?.conversationConfig || {}),
							agent: {
								...(agentData?.conversationConfig?.agent || {}),

								first_message: e.target.value,
							},
						},
					})
				}
				description="This greeting message will be the first thing users see when they interact with your agent"
			/>
		</SectionCard>
	);
};

export default BasicConfiguration;
