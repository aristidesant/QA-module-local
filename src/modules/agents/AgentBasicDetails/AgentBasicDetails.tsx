import React from "react";
import { Stack, Box, Center } from "@mantine/core";
import AgentProfile from "~/components/AgentProfile/AgentProfile";
import styles from "./AgentBasicDetails.module.css";
import type AgentListObject from "~/models/AgentListObject";
import AgentVoiceProgress from "../AgentSimpleDetails/AgentVoiceProgress";
import type { AgentConfigModel } from "~/models/AgentListObject";
import { VoiceMiniPlayer } from "~/components/VoiceMiniPlayer";

export interface AgentBasicDetailsProps {
	/** The agent data to display */
	agent?: AgentListObject;
	agentData?: AgentConfigModel;
}

const AgentBasicDetails: React.FC<AgentBasicDetailsProps> = ({
	agent,
	agentData,
}) => {
	return (
		<div>
			<Stack gap="xs">
				{/* Agent Profile Section */}
				<Box className={styles.agentSection}>
					<AgentProfile agent={agent} size="lg" />
				</Box>

				{/* Voice Settings Section */}

				<AgentVoiceProgress
					optimizeLatency={
						agentData?.conversationConfig?.tts?.optimizeStreamingLatency ?? 3
					}
					stability={agentData?.conversationConfig?.tts?.stability ?? 0.5}
					speed={agentData?.conversationConfig?.tts?.speed ?? 1.0}
					similarityBoost={
						agentData?.conversationConfig?.tts?.similarityBoost ?? 0.8
					}
				/>
				<Center mt="lg">
					<VoiceMiniPlayer
						disabled={!agent?.voice?.previewUrl}
						voiceUrl={agent?.voice?.previewUrl}
					/>
				</Center>
			</Stack>
		</div>
	);
};

export default AgentBasicDetails;
