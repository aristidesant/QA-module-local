import React, { useCallback } from 'react';
import {
	Card,
	Text,
	Menu,
	LoadingOverlay,
	ActionIcon,
	Button,
} from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import {
	IconDots,
	IconEye,
	IconTools,
	IconTrash,
	IconPhoneCall,
	IconPhoneIncoming,
	IconPhoneOutgoing,
} from '@tabler/icons-react';
import AgentProfile from '~/modules/agents/AgentSimpleDetails/AgentProfile/AgentProfile';

import styles from './AgentCard.module.css';
import badgeStyles from './AgentTypeBadge.module.css';
import type AgentListObject from '~/models/AgentListObject';
import { useDeleteAgent } from '~/queries/agentQueries';
import { useRevalidator } from 'react-router';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { OutboundCallForm } from '~/components/OutboundCallForm';
import { modals } from '@mantine/modals';
import { useAgentStore } from '~/stores/agentStore';

export interface AgentCardProps {
	agent: AgentListObject;
	onClick?: (agent: AgentListObject) => void;
	showDelete?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
	agent,
	onClick,
	showDelete = true,
}) => {
	const { revalidate } = useRevalidator();
	const { setSelectedAgent } = useAgentStore();
	const { mutateAsync: deleteAgent, isPending: isDeleting } = useDeleteAgent();
	const navigate = useNavigate();

	const handleRemove = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			openConfirmModal({
				title: `Remove Agent`,
				centered: true,
				children: (
					<Text size='sm'>
						Are you sure you want to remove <b>{agent.name}</b>? This action
						cannot be undone.
					</Text>
				),
				labels: { confirm: 'Remove Agent', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				onCancel: () => {},
				onConfirm: async () => {
					try {
						await deleteAgent(agent.id);
						revalidate();
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Error deleting agent:', error);
					}
					notifications.show({
						title: 'Agent Removed',
						message: `${agent.name} has been removed successfully.`,
						color: 'green',
						autoClose: 3000,
						icon: <IconTrash size={16} />,
					});
				},
			});
		},
		[agent, deleteAgent, revalidate]
	);

	const handleView = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setSelectedAgent(agent);
			navigate(`/agent/${agent.id}`);
		},
		[navigate, agent.id]
	);

	// createdAt and isValidDate are not used

	// Use utility functions for consistent agent data extraction

	// isFemale is not used

	const handleDemoCall = (agent: AgentListObject) => {
		modals.open({
			modalId: 'demo-call-modal',
			withCloseButton: false,
			children: (
				<OutboundCallForm
					agent={agent}
					onSuccess={() => {
						modals.close('demo-call-modal');
						notifications.show({
							title: 'Demo Call Started',
							message: `A demo call with ${agent.name} has been initiated.`,
							color: 'green',
							autoClose: 3000,
							icon: <IconEye size={16} />,
						});
					}}
					onClose={() => modals.close('demo-call-modal')}
				/>
			),
		});
	};

	return (
		<Card
			withBorder
			radius='md'
			onClick={onClick ? () => onClick(agent) : undefined}
			data-testid='agent-card'
			className={styles.agentCard}
			padding='lg'
		>
			<LoadingOverlay visible={isDeleting} />

			{/* Three-dot menu */}
			<div className={styles.menuContainer}>
				<Menu
					withArrow
					width={200}
					withinPortal
					position='bottom-end'
					shadow='md'
				>
					<Menu.Target>
						<ActionIcon
							type='button'
							variant='transparent'
							aria-label='Agent actions'
							onClick={(e) => e.stopPropagation()}
						>
							<IconDots size={18} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconTools size={16} />}
							onClick={handleView}
						>
							Open Setup
						</Menu.Item>
						{showDelete && (
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={16} />}
								onClick={handleRemove}
							>
								Remove
							</Menu.Item>
						)}
					</Menu.Dropdown>
				</Menu>
			</div>

			<div className={styles.cardContent}>
				{/* Agent Profile */}
				<div className={styles.infoSection}>
					{agent.type && (
						<span
							className={
								`${badgeStyles.agentTypeBadge} ` +
								(agent.type === 'INBOUND'
									? badgeStyles.agentTypeInbound
									: badgeStyles.agentTypeOutbound)
							}
							data-testid='agent-type-badge'
						>
							{agent.type === 'INBOUND' ? (
								<>
									<IconPhoneIncoming size={14} /> Inbound
								</>
							) : (
								<>
									<IconPhoneOutgoing size={14} /> Outbound
								</>
							)}
						</span>
					)}
					<div className={styles.agentProfileWrapper}>
						<AgentProfile
							agent={agent}
							size='md'
							onClick={onClick ? () => onClick(agent) : undefined}
						/>
					</div>
				</div>

				{/* Bottom content area */}
				<div className={styles.bottomContent}>
					<div className={styles.actionsRow}>
						<Button
							fullWidth
							color='dark'
							variant='light'
							leftSection={<IconPhoneCall size={16} />}
							onClick={(event) => {
								event.stopPropagation();
								handleDemoCall(agent);
							}}
						>
							Test Call
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
};

export default AgentCard;
