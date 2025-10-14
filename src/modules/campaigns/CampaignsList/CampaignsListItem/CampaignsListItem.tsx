import React, { useMemo } from 'react';
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
} from '@mantine/core';
import {
	IconDotsVertical,
	IconTrash,
	IconEye,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconExclamationMark,
} from '@tabler/icons-react';
import styles from './CampaignsListItem.module.css';
import type { Campaign } from '~/models/CampaignsModel';
import ScoreGauge from './ScoreGauge';
import { getCampaignStatusInfo } from '../useCampaignsColumns';

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
	const score = (campaign?.overAllScore as number).toFixed(0);
	const progressPercentage = campaign?.progress || 0;

	// Determine progress bar color based on completion percentage
	const getProgressColor = (percentage: number): string => {
		if (percentage >= 80) return 'green';
		if (percentage >= 50) return 'blue';
		if (percentage >= 25) return 'yellow';
		return 'red';
	};

	const statusInfo = useMemo(
		() => getCampaignStatusInfo(campaign.status ?? ''),
		[campaign]
	);

	return (
		<Card
			className={
				selected ? `${styles.card} ${styles.cardSelected}` : styles.card
			}
			withBorder
			onClick={onClick}
			role='button'
			aria-pressed={selected}
			aria-label={`View campaign ${campaign.name}`}
			tabIndex={0}
		>
			{/* Header */}
			<Group justify='space-between' align='center' className={styles.header}>
				<Group gap={8} align='center'>
					{/* Campaign Icon */}
					<Avatar
						size={24}
						radius='xl'
						color={statusInfo.color}
						className={styles.campaignIcon}
						title={statusInfo.label}
					>
						<statusInfo.icon size={14} />
					</Avatar>
					<Flex direction='column'>
						<Text fz={'xs'} c='dimmed'>
							Campaign
						</Text>
						<Text fz='xs' fw={500} className={styles.campaignName}>
							{campaign?.name}
						</Text>
					</Flex>
				</Group>

				<Group gap={8} align='center'>
					<Badge
						variant='light'
						color={'gray'}
						radius='lg'
						size='md'
						fw={600}
						p='sm'
						style={{
							alignContent: 'center',
							textTransform: 'capitalize',
						}}
						// className={styles.typeBadge}
						rightSection={
							campaign.type === 'OUTBOUND' ? (
								<IconArrowUpRight
									size={12}
									color='var(--mantine-color-green-light-color)'
								/>
							) : (
								<IconArrowDownLeft
									size={12}
									color='var(--mantine-color-blue-light-color)'
								/>
							)
						}
					>
						{campaign.type}
					</Badge>
					<Menu shadow='md' width={160}>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								radius='md'
								aria-label='Campaign actions'
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
								color='red'
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
				align='center'
				justify='space-between'
				mt='md'
				className={styles.mainContent}
			>
				<Stack gap={8} className={styles.progressSection}>
					<Group gap={8} align='center'>
						<Text size='sm' fw={500} className={styles.progressLabel}>
							Contact List Progress
						</Text>
					</Group>
					<Progress
						value={progressPercentage}
						color={getProgressColor(progressPercentage)}
						size='md'
						radius='xl'
						className={styles.progressBar}
					/>
					<Text size='sm' c='dimmed' className={styles.campaignDescription}>
						{campaign.description ||
							'Automated calls to existing customers to inform them of their eligibility for a credit limit increase and collect confirmation to proceed.'}
					</Text>
				</Stack>

				<ScoreGauge score={+score} />
			</Group>

			{/* Footer: Agents */}
			<div className={styles.footer}>
				<div className={styles.agentsSection}>
					{campaign.agents && campaign.agents.length > 0 ? (
						<div className={styles.agentsContainer}>
							<div className={styles.agentsList}>
								{campaign.agents.slice(0, 4).map((campaignAgent) => (
									<div key={campaignAgent.id} className={styles.agentItem}>
										<Avatar
											radius='xl'
											size={28}
											color='blue'
											className={styles.agentAvatar}
											title={`${campaignAgent.agent.name} - ${campaignAgent.agent.language}`}
										>
											{campaignAgent.agent.name.charAt(0).toUpperCase()}
										</Avatar>
										<div className={styles.agentInfo}>
											<Text size='xs' fw={500} className={styles.agentName}>
												{campaignAgent.agent.name}
											</Text>
											<Text
												size='xs'
												c='dimmed'
												className={styles.agentLanguage}
											>
												{campaignAgent.agent.language}
											</Text>
										</div>
									</div>
								))}
								{campaign.agents.length > 4 && (
									<div className={styles.moreAgents}>
										<Avatar
											radius='xl'
											size={28}
											color='gray'
											className={styles.moreAgentsAvatar}
										>
											<Text size='xs' fw={600}>
												+{campaign.agents.length - 4}
											</Text>
										</Avatar>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className={styles.noAgentsContainer}>
							<Avatar
								radius='xl'
								size={28}
								color='gray'
								variant='light'
								className={styles.noAgentsAvatar}
							>
								<IconExclamationMark size={16} />
							</Avatar>
							<div className={styles.noAgentsText}>
								<Text size='xs' c='dimmed' className={styles.noAgentsMessage}>
									No agents assigned
								</Text>
								<Text size='xs' c='dimmed' className={styles.noAgentsSubtext}>
									Assign agents to start this campaign
								</Text>
							</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};

export default CampaignsListItem;
