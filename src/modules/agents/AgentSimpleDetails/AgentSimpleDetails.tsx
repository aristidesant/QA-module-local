import { ActionIcon, Stack, Button } from "@mantine/core";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React, { useState, useEffect } from "react";
import {
	IconChevronLeft,
	IconChevronRight,
	IconSettings,
} from "@tabler/icons-react";
import AgentProfile from "~/components/AgentProfile";
import { useGetAgent } from "~/queries/agentQueries";
import { useNavigate } from "react-router";
import AgentVoiceProgress from "./AgentVoiceProgress/AgentVoiceProgress";
import { VoicePlayer } from "~/components/VoicePlayer";

type AgentSimpleDetailsProps = {
	agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
	agent,
}) => {
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);

	// Fetch full agent if the passed `agent` is incomplete. We prefer values
	// coming from the API (useGetAgent) but fall back to the passed object.
	const { data: fetchedAgent } = useGetAgent(agent.id);

	// Merge fetched agent (when available) with the provided `agent` prop.
	const mergedAgent = fetchedAgent ?? agent;

	// Voice settings from conversationConfig - default to 0 when missing
	// (per request: do not invent defaults, show 0 instead).
	const stability =
		mergedAgent?.config?.conversationConfig?.tts?.stability ?? 0;
	const speed = mergedAgent?.config?.conversationConfig?.tts?.speed ?? 0;
	const similarityBoost =
		mergedAgent?.config?.conversationConfig?.tts?.similarityBoost ?? 0;
	const optimizeLatency =
		mergedAgent?.config?.conversationConfig?.tts?.optimizeStreamingLatency ?? 0;

	useEffect(() => {
		// Small delay to ensure smooth mounting animation
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		return () => {
			clearTimeout(timer);
			setIsVisible(false);
		};
	}, [agent.id]);

	return (
		<Stack gap="md" className={isVisible ? styles.visible : ""}>
			<div className={styles.agentSimpleDetails}>
				{/* Avatar and status */}
				<AgentProfile agent={mergedAgent} size="lg" />

				<VoicePlayer
					voiceName={mergedAgent.voice?.name || "No voice selected"}
					previewUrl={mergedAgent.voice?.previewUrl}
				/>
				{/* Campaign section */}
				<div className={styles.campaignRow}>
					<ActionIcon size="sm" variant="outline" color="gray">
						<IconChevronLeft />
					</ActionIcon>
					<div className={styles.campaignText}>
						<div className={styles.campaignLabel}>Campaign</div>
						<div className={styles.campaignName}>Personal Loan Promotion</div>
					</div>
					<ActionIcon size="sm" variant="outline" color="gray">
						<IconChevronRight />
					</ActionIcon>
				</div>
			</div>
			{/* Voice settings sliders */}
			<AgentVoiceProgress
				stability={stability}
				speed={speed}
				similarityBoost={similarityBoost}
				optimizeLatency={optimizeLatency}
			/>

			<Button
				rightSection={<IconSettings />}
				variant="light"
				onClick={() => navigate(`/agent/${agent.id}`)}
				color="teal"
				className={styles.setupButton}
			>
				Agent Profile Setup
			</Button>
		</Stack>
	);
};

export default AgentSimpleDetails;
