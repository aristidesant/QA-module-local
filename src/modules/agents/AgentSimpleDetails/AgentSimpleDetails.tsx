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
import { useGetAgent, useGetAgentCampaigns } from "~/queries/agentQueries";
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
	const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);

	// Fetch full agent if the passed `agent` is incomplete. We prefer values
	// coming from the API (useGetAgent) but fall back to the passed object.
	const { data: fetchedAgent } = useGetAgent(agent.id);

	// Fetch agent campaigns
	const { data: campaigns = [], isLoading: campaignsLoading } =
		useGetAgentCampaigns(agent.id);

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

	// Campaign navigation functions
	const goToPreviousCampaign = () => {
		if (campaigns.length > 0) {
			setCurrentCampaignIndex((prevIndex) =>
				prevIndex === 0 ? campaigns.length - 1 : prevIndex - 1
			);
		}
	};

	const goToNextCampaign = () => {
		if (campaigns.length > 0) {
			setCurrentCampaignIndex((prevIndex) =>
				prevIndex === campaigns.length - 1 ? 0 : prevIndex + 1
			);
		}
	};

	// Get current campaign
	const currentCampaign = campaigns[currentCampaignIndex];
	const hasCampaigns = campaigns.length > 0;
	const hasMultipleCampaigns = campaigns.length > 1;

	useEffect(() => {
		// Small delay to ensure smooth mounting animation
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		// Reset campaign index when agent changes
		setCurrentCampaignIndex(0);

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
					<ActionIcon
						size="sm"
						variant="outline"
						color="gray"
						onClick={goToPreviousCampaign}
						disabled={!hasMultipleCampaigns || campaignsLoading}
					>
						<IconChevronLeft />
					</ActionIcon>
					<div className={styles.campaignText}>
						<div className={styles.campaignLabel}>Campaign</div>
						<div className={styles.campaignName}>
							{campaignsLoading
								? "Loading campaigns..."
								: hasCampaigns
								? currentCampaign?.name || "Unnamed Campaign"
								: "No campaigns assigned"}
						</div>
						{hasMultipleCampaigns && (
							<div className={styles.campaignCounter}>
								{currentCampaignIndex + 1} of {campaigns.length}
							</div>
						)}
					</div>
					<ActionIcon
						size="sm"
						variant="outline"
						color="gray"
						onClick={goToNextCampaign}
						disabled={!hasMultipleCampaigns || campaignsLoading}
					>
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
