import React from "react";
import {
	Card,
	Badge,
	Text,
	ActionIcon,
	Menu,
	Group,
	Stack,
	Avatar,
	Divider,
	Button,
} from "@mantine/core";
import {
	IconDotsVertical,
	IconEdit,
	IconTrash,
	IconEye,
	IconPhone,
} from "@tabler/icons-react";
import styles from "./CampaignsGridItem.module.css";
import type { Campaign } from "~/models/CampaignsModel";

export type CampaignsGridItemProps = {
	campaign: Campaign;
	selected: boolean;
	onClick: () => void;
	onViewDetails: () => void;
	onEdit: () => void;
	onDelete: () => void;
};

const CampaignsGridItem: React.FC<CampaignsGridItemProps> = ({
	campaign,
	selected,
	onClick,
	onViewDetails,
	onEdit,
	onDelete,
}) => {
	const statusColorMap: Record<string, string> = {
		active: "green",
		paused: "yellow",
		completed: "blue",
		draft: "gray",
	};

	const statusColor = statusColorMap[campaign.status || "draft"] || "gray";

	return (
		<Card
			className={`${styles.gridItem} ${selected ? styles.selected : ""}`}
			onClick={onClick}
			withBorder
			padding="md"
			radius="md"
			shadow={selected ? "md" : "xs"}
		>
			<Card.Section className={styles.header}>
				<Group justify="space-between" p="sm">
					<Badge color={statusColor} variant="light" size="sm">
						{campaign.status || "Draft"}
					</Badge>
					<Menu shadow="md" width={200}>
						<Menu.Target>
							<ActionIcon
								variant="subtle"
								color="gray"
								onClick={(e) => e.stopPropagation()}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEye size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onViewDetails();
								}}
							>
								View Details
							</Menu.Item>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onEdit();
								}}
							>
								Edit
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								color="red"
								leftSection={<IconTrash size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Card.Section>

			<Stack gap="sm" className={styles.content}>
				<div>
					<Text fw={600} size="lg" className={styles.campaignName}>
						{campaign.name}
					</Text>
					{campaign.description && (
						<Text size="sm" c="dimmed" className={styles.description}>
							{campaign.description}
						</Text>
					)}
				</div>

				<Divider />

				<Group justify="space-between">
					<Stack gap={4}>
						<Text size="xs" c="dimmed">
							Calls Made
						</Text>
						<Text fw={600}>1,245</Text>
					</Stack>
					<Stack gap={4}>
						<Text size="xs" c="dimmed">
							Success Rate
						</Text>
						<Text fw={600} c="green">
							68.7%
						</Text>
					</Stack>
				</Group>

				<Group gap="xs" className={styles.agents}>
					<Avatar size="sm" radius="xl" src="https://i.pravatar.cc/150?img=1" />
					<Avatar size="sm" radius="xl" src="https://i.pravatar.cc/150?img=2" />
					<Avatar size="sm" radius="xl" color="gray">
						+3
					</Avatar>
				</Group>

				<Button
					variant="light"
					size="sm"
					leftSection={<IconPhone size={14} />}
					onClick={(e) => {
						e.stopPropagation();
						// Handle start campaign
					}}
					className={styles.actionButton}
				>
					Start Campaign
				</Button>
			</Stack>
		</Card>
	);
};

export default CampaignsGridItem;
