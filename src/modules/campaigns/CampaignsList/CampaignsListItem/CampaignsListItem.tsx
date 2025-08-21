import React, { useMemo } from "react";
import {
	Card,
	Badge,
	Text,
	ActionIcon,
	Menu,
	Group,
	Stack,
	Progress,
	Avatar,
	Divider,
	Flex,
} from "@mantine/core";
import {
	IconDotsVertical,
	IconTrash,
	IconEye,
	IconPlayerPause,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconBolt,
	IconExclamationMark,
	IconCircleCheck,
	IconPlayerPlayFilled,
} from "@tabler/icons-react";
import styles from "./CampaignsListItem.module.css";
import type { Campaign } from "~/models/CampaignsModel";
import ScoreGauge from "./ScoreGauge";

export type CampaignsListItemProps = {
	campaign: Campaign;
	selected: boolean;
	onClick: () => void;
	onViewDetails: () => void;
	onEdit: () => void;
	onDelete: () => void;
};

const CampaignsListItem: React.FC<CampaignsListItemProps> = ({
	campaign,
	selected,
	onClick,
	onViewDetails,
	onDelete,
}) => {
	// Placeholder values for agent and score
	const agent = {
		name: "Clara Lucia",
		language: "Spanish ES",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
	};
	const score = (campaign?.overAllScore as number).toFixed(0);
	const progressPercentage = campaign?.progress || 0;

	// Determine progress bar color based on completion percentage
	const getProgressColor = (percentage: number): string => {
		if (percentage >= 80) return "green";
		if (percentage >= 50) return "blue";
		if (percentage >= 25) return "yellow";
		return "red";
	};

	const statusInfo = useMemo(
		() => getCampaignStatusIcon(campaign.status ?? ""),
		[campaign]
	);

	return (
		<Card
			className={
				selected ? `${styles.card} ${styles.cardSelected}` : styles.card
			}
			withBorder
			onClick={onClick}
			role="button"
			aria-pressed={selected}
			aria-label={`View campaign ${campaign.name}`}
			tabIndex={0}
		>
			{/* Header */}
			<Group justify="space-between" align="center" className={styles.header}>
				<Group gap={8} align="center">
					{/* Campaign Icon */}
					<Avatar
						size={24}
						radius="xl"
						color={statusInfo.color}
						className={styles.campaignIcon}
						title={statusInfo.label}
					>
						{statusInfo.icon}
					</Avatar>
					<Flex direction="column">
						<Text fz={"xs"} c="dimmed">
							Campaign
						</Text>
						<Text fz="xs" fw={500} className={styles.campaignName}>
							{campaign?.name}
						</Text>
					</Flex>
				</Group>

				<Group gap={8} align="center">
					<Badge
						variant="light"
						color={"gray"}
						radius="lg"
						size="md"
						fw={600}
						p="sm"
						style={{
							alignContent: "center",
							textTransform: "capitalize",
						}}
						// className={styles.typeBadge}
						rightSection={
							campaign.type === "OUTBOUND" ? (
								<IconArrowUpRight
									size={12}
									color="var(--mantine-color-green-light-color)"
								/>
							) : (
								<IconArrowDownLeft
									size={12}
									color="var(--mantine-color-blue-light-color)"
								/>
							)
						}
					>
						{campaign.type}
					</Badge>
					<Menu shadow="md" width={160}>
						<Menu.Target>
							<ActionIcon
								variant="subtle"
								color="gray"
								radius="md"
								aria-label="Campaign actions"
								onClick={(e) => e.stopPropagation()}
							>
								<IconDotsVertical size={16} aria-hidden />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onViewDetails();
								}}
								leftSection={<IconEye size={14} />}
							>
								Edit Campaign
							</Menu.Item>

							<Menu.Divider />
							<Menu.Item
								onClick={onDelete}
								leftSection={<IconTrash size={14} />}
								color="red"
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Group>
			<Divider />
			{/* Main Content */}
			<Group
				align="center"
				justify="space-between"
				mt="md"
				className={styles.mainContent}
			>
				<Stack gap={8} className={styles.progressSection}>
					<Group gap={8} align="center">
						<Text size="sm" fw={500} className={styles.progressLabel}>
							Contact List Progress
						</Text>
					</Group>
					<Progress
						value={progressPercentage}
						color={getProgressColor(progressPercentage)}
						size="md"
						radius="xl"
						className={styles.progressBar}
					/>
					<Text size="sm" c="dimmed" className={styles.campaignDescription}>
						{campaign.description ||
							"Automated calls to existing customers to inform them of their eligibility for a credit limit increase and collect confirmation to proceed."}
					</Text>
				</Stack>

				<ScoreGauge score={+score} />
			</Group>

			{/* Footer: Agent and contact methods */}
			<Group align="center" mt="lg" className={styles.footer}>
				<Group gap={8} align="center">
					<Avatar src={agent.avatar} radius="xl" size={32} />
					<Stack gap={0}>
						<Text size="sm" fw={500} className={styles.agentName}>
							{agent.name}
						</Text>
						<Text size="xs" c="dimmed" className={styles.agentLanguage}>
							{agent.language}
						</Text>
					</Stack>
				</Group>
				{/* <Flex gap={"xs"}>
					<Button
						variant="subtle"
						leftSection={
							<IconPhone size={18} color="var(--mantine-color-blue-6)" />
						}
					>
						Call
					</Button>
					<Divider orientation="vertical" />
					<Button
						variant="subtle"
						leftSection={
							<IconBrandWhatsapp
								size={18}
								color="var(--mantine-color-green-6)"
							/>
						}
					>
						WhatsApp
					</Button>
					<Divider orientation="vertical" />
					<Button
						variant="subtle"
						leftSection={
							<IconMail size={18} color="var(--mantine-color-red-6)" />
						}
					>
						Email
					</Button>
				</Flex> */}
			</Group>
		</Card>
	);
};

export default CampaignsListItem;

/**
 * Get the status icon and color for a campaign.
 * @param campaign - Campaign object
 * @returns An object containing the icon, color, and label for the campaign status.
 */
export const getCampaignStatusIcon = (status: string) => {
	const campaignStatus = status?.toLowerCase();
	const size = 30;

	switch (campaignStatus) {
		case "active":
			return {
				icon: <IconPlayerPlayFilled size={size} />,
				color: "green",
				label: "Active",
			};
		case "running":
			return {
				icon: <IconBolt size={size} />,
				color: "green",
				label: "Running",
			};
		case "paused":
			return {
				icon: <IconPlayerPause size={size} />,
				color: "yellow",
				label: "Paused",
			};
		case "completed":
			return {
				icon: <IconCircleCheck size={size} />,
				color: "green",
				label: "Completed",
			};
		case "inactive":
		case "incomplete":
		case "error":
			return {
				icon: <IconExclamationMark size={size} />,
				color: "red",
				label: "Inactive",
			};
		case "ready":
		case "scheduled":
			return {
				icon: <IconCheck size={size} />,
				color: "blue",
				label: "Ready",
			};
		default:
			return {
				icon: <IconCheck size={size} />,
				color: "gray",
				label: "Unknown Status",
			};
	}
};
