import React from 'react';
import {
	Box,
	Card,
	Text,
	Badge,
	Group,
	Stack,
	Divider,
	ActionIcon,
} from '@mantine/core';
import {
	IconX,
	IconClock,
	IconCheck,
	IconAlertTriangle,
	IconPhoneOff,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import { useCampaignsStore } from '~/stores/campaignsStore';
import styles from './NodeDetailPanel.module.css';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';

interface NodeDetailPanelProps {
	node: DispositionNode;
	parentNode?: DispositionNode;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
	node,
	parentNode,
}) => {
	const { setRightComponent } = useCampaignsStore();
	const nodeStyle = getNodeStyle(node, parentNode ? 1 : 0);

	const handleClose = () => {
		setRightComponent(null);
	};

	const getNodeTypeInfo = (style: string) => {
		switch (style) {
			case 'effective':
				return {
					label: 'Effective Contact',
					color: 'green',
					icon: <IconCheck size={14} />,
					description: 'This node represents a successful contact outcome.',
				};
			case 'noEffective':
				return {
					label: 'No Effective Contact',
					color: 'orange',
					icon: <IconAlertTriangle size={14} />,
					description: 'This node represents an unsuccessful contact attempt.',
				};
			case 'noContact':
				return {
					label: 'No Contact',
					color: 'red',
					icon: <IconAlertTriangle size={14} />,
					description: 'This node represents no contact made.',
				};
			default:
				return {
					label: 'Default',
					color: 'gray',
					icon: null,
					description: 'This is a standard outcome node.',
				};
		}
	};

	const nodeTypeInfo = getNodeTypeInfo(nodeStyle);
	// Extract description if present
	const description = node.description || nodeTypeInfo.description;
	const dispositionLabel = useDispositionLabel();

	return (
		<Box className={styles.panel}>
			<Group justify='space-between' className={styles.header}>
				<Text size='lg' fw={600} className={styles.title}>
					{dispositionLabel('Outcome Details')}
				</Text>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={handleClose}
					size='sm'
				>
					<IconX size={16} />
				</ActionIcon>
			</Group>
			<Divider mb='md' />
			<Stack gap='md'>
				{/* Name and Description */}
				<Box>
					<Text size='md' fw={500} className={styles.nodeName}>
						{node.name}
					</Text>
					{description && (
						<Text size='sm' c='dimmed' mt={4}>
							{description}
						</Text>
					)}
				</Box>

				{/* Parent Outcome Badge (centered) */}
				{parentNode && (
					<Group justify='center'>
						<Badge
							variant='outline'
							color='gray'
							size='sm'
							className={styles.parentBadge}
						>
							{dispositionLabel('Parent')}: {parentNode.name}
						</Badge>
					</Group>
				)}

				{/* Requires Reschedule Card */}
				{node.requiresReschedule && (
					<Card withBorder className={styles.rescheduleCard}>
						<Group align='center' gap={8} mb={4}>
							<IconClock size={18} color='var(--mantine-color-orange-6)' />
							<Text size='sm' fw={600}>
								{dispositionLabel('Requires Reschedule')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{dispositionLabel(
								'This outcome requires the contact to be rescheduled for a future attempt.'
							)}
						</Text>
					</Card>
				)}

				{/* Invalidates Number Card */}
				{node.isInvalidatesNumber && (
					<Card withBorder className={styles.invalidatesCard}>
						<Group align='center' gap={8} mb={4}>
							<IconPhoneOff size={18} color='var(--mantine-color-red-6)' />
							<Text size='sm' fw={600}>
								{dispositionLabel('Invalidates Number')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{dispositionLabel(
								'This outcome marks the contact number as invalid and prevents future attempts.'
							)}
						</Text>
					</Card>
				)}
			</Stack>
		</Box>
	);
};

export default NodeDetailPanel;
