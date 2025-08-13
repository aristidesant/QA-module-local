import React from "react";
import {
	Card,
	Group,
	Text,
	Stack,
	Box,
	Progress,
	ThemeIcon,
} from "@mantine/core";
import styles from "./CampaignStatus.module.css";
import { getCampaignStatusIcon } from "../../CampaignsList/CampaignsListItem/CampaignsListItem";

interface CampaignStatusProps {
	status?: string;
	description?: string;
	timeLeft?: string;
	progress?: number; // 0-100
}

const getStatusDescription = (status: string): string => {
	const campaignStatus = status?.toLowerCase();

	switch (campaignStatus) {
		case "active":
		case "running":
			return "The campaign is currently active and executing calls.";
		case "paused":
			return "The campaign has been temporarily paused and is not making calls.";
		case "incomplete":
		case "error":
			return "The campaign encountered an error and needs attention.";
		case "ready":
		case "scheduled":
			return "The campaign is ready to start and waiting for scheduled time.";
		default:
			return "Campaign status information is not available.";
	}
};

const CampaignStatus: React.FC<CampaignStatusProps> = ({
	status = "Running",
	description,
	timeLeft = "3h:12min",
	progress = 70,
}) => {
	const statusInfo = getCampaignStatusIcon(status.toLowerCase());
	const finalDescription = description || getStatusDescription(status);

	return (
		<Stack gap="xs">
			<Card radius="md" padding="md" withBorder className={styles.card}>
				<Group align="center" wrap="nowrap" gap={16}>
					<ThemeIcon
						radius="xl"
						size={40}
						color={statusInfo.color}
						variant="light"
						className={styles.icon}
					>
						{statusInfo.icon}
					</ThemeIcon>
					<Box>
						<Text fw={600} fz="md" className={styles.statusTitle}>
							{statusInfo.label}
						</Text>
						<Text fz="sm" c="gray.6" className={styles.statusDesc}>
							{finalDescription}
						</Text>
					</Box>
				</Group>
			</Card>
			<Card radius="md" padding="md" withBorder className={styles.timeCard}>
				<Group justify="space-between" className={styles.timeHeader}>
					<Text fw={500} fz="sm">
						Today's time left
					</Text>
					<Text fw={500} fz="sm">
						{timeLeft}
					</Text>
				</Group>
				<Progress
					value={progress}
					size="md"
					radius="xl"
					color="blue"
					className={styles.progressBar}
				/>
			</Card>
		</Stack>
	);
};

export default CampaignStatus;
