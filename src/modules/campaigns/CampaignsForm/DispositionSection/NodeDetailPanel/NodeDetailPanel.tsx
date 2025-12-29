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
import { useTranslation } from 'react-i18next';

interface NodeDetailPanelProps {
	node: DispositionNode;
	parentNode?: DispositionNode;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
	node,
	parentNode,
}) => {
	const { t } = useTranslation('campaigns');
	const { setRightComponent } = useCampaignsStore();
	const nodeStyle = getNodeStyle(node, parentNode ? 1 : 0);

	const handleClose = () => {
		setRightComponent(null);
	};

	const getNodeTypeInfo = (style: string) => {
		switch (style) {
			case 'effective':
				return {
					label: t('disposition.detailPanel.effectiveContact'),
					color: 'green',
					icon: <IconCheck size={14} />,
					description: t('disposition.detailPanel.effectiveDesc'),
				};
			case 'noEffective':
				return {
					label: t('disposition.detailPanel.noEffectiveContact'),
					color: 'orange',
					icon: <IconAlertTriangle size={14} />,
					description: t('disposition.detailPanel.noEffectiveDesc'),
				};
			case 'noContact':
				return {
					label: t('disposition.detailPanel.noContact'),
					color: 'red',
					icon: <IconAlertTriangle size={14} />,
					description: t('disposition.detailPanel.noContactDesc'),
				};
			default:
				return {
					label: t('disposition.detailPanel.default'),
					color: 'gray',
					icon: null,
					description: t('disposition.detailPanel.defaultDesc'),
				};
		}
	};

	const nodeTypeInfo = getNodeTypeInfo(nodeStyle);
	// Extract description if present
	const description = node.description || nodeTypeInfo.description;

	return (
		<Box className={styles.panel}>
			<Group justify='space-between' className={styles.header}>
				<Text size='lg' fw={600} className={styles.title}>
					{t('disposition.detailPanel.title')}
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
							{t('disposition.detailPanel.parent')}: {parentNode.name}
						</Badge>
					</Group>
				)}

				{/* Requires Reschedule Card */}
				{node.requiresReschedule && (
					<Card withBorder className={styles.rescheduleCard}>
						<Group align='center' gap={8} mb={4}>
							<IconClock size={18} color='var(--mantine-color-orange-6)' />
							<Text size='sm' fw={600}>
								{t('disposition.detailPanel.rescheduleCardTitle')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{t('disposition.detailPanel.rescheduleCardDesc')}
						</Text>
					</Card>
				)}

				{/* Invalidates Number Card */}
				{node.isInvalidatesNumber && (
					<Card withBorder className={styles.invalidatesCard}>
						<Group align='center' gap={8} mb={4}>
							<IconPhoneOff size={18} color='var(--mantine-color-red-6)' />
							<Text size='sm' fw={600}>
								{t('disposition.detailPanel.invalidatesCardTitle')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{t('disposition.detailPanel.invalidatesCardDesc')}
						</Text>
					</Card>
				)}
			</Stack>
		</Box>
	);
};

export default NodeDetailPanel;
