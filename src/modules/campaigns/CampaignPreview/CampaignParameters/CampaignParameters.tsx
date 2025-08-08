import React from "react";
import { Card, Text, Stack, Group, Badge } from "@mantine/core";
import styles from "./CampaignParameters.module.css";
import type { CampaignParameters as CampaignParametersType } from "~/models/CampaignsModel";

interface CampaignParametersProps {
	parameters?: CampaignParametersType;
}

const CampaignParameters: React.FC<CampaignParametersProps> = ({
	parameters,
}) => {
	// Mock data with fallbacks
	const mockParameters = parameters || {
		callingHours: {
			days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
			startTime: "09:00",
			endTime: "18:00",
			timezone: "America/New_York",
		},
		voicemailDetection: true,
		callRetries: 2,
		maxConcurrentCalls: 5,
		answerMachineDetection: true,
	};

	const formatCallingHours = () => {
		const { days, startTime, endTime } = mockParameters.callingHours;
		const dayRange =
			days.length === 5 && days.includes("Mon") && days.includes("Fri")
				? "Mon-Fri"
				: days.join(", ");

		// Convert 24h to 12h format
		const formatTime = (time: string) => {
			const [hours, minutes] = time.split(":");
			const hour = parseInt(hours);
			const ampm = hour >= 12 ? "PM" : "AM";
			const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
			return `${displayHour}:${minutes} ${ampm}`;
		};

		return `${dayRange}, ${formatTime(startTime)} - ${formatTime(endTime)}`;
	};

	return (
		<Stack gap="md" mt="sm">
			<div>
				<Text fw={600} size="md" className={styles.title}>
					Defined Parameters
				</Text>
				<Text size="xs" c="dimmed" className={styles.subtitle}>
					These settings control how and when interactions are executed.
				</Text>
			</div>

			<Stack gap="xs" className={styles.parametersList}>
				<Card
					radius="md"
					padding="sm"
					withBorder
					className={styles.parameterCard}
				>
					<Group justify="space-between" className={styles.parameterItem}>
						<Text size="sm" c="dimmed">
							Calling hours
						</Text>
						<Text size="sm" fw={500}>
							{formatCallingHours()}
						</Text>
					</Group>
				</Card>

				<Card
					radius="md"
					padding="sm"
					withBorder
					className={styles.parameterCard}
				>
					<Group justify="space-between" className={styles.parameterItem}>
						<Text size="sm" c="dimmed">
							Voicemail detection
						</Text>
						<Badge
							variant="light"
							color={mockParameters.voicemailDetection ? "green" : "red"}
							size="sm"
						>
							{mockParameters.voicemailDetection ? "Enabled" : "Disabled"}
						</Badge>
					</Group>
				</Card>

				<Card
					radius="md"
					padding="sm"
					withBorder
					className={styles.parameterCard}
				>
					<Group justify="space-between" className={styles.parameterItem}>
						<Text size="sm" c="dimmed">
							Call retries
						</Text>
						<Text size="sm" fw={500}>
							Up to {mockParameters.callRetries} times
						</Text>
					</Group>
				</Card>
			</Stack>
		</Stack>
	);
};

export default CampaignParameters;
