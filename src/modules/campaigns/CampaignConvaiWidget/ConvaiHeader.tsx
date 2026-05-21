import { useMemo } from 'react';
import { Badge, Group, Text, Title } from '@mantine/core';
import {
	IconAlertCircle,
	IconCircleCheck,
	IconLoader2,
	IconMessageCircle,
} from '@tabler/icons-react';
import { STATUS_COLOR_MAP, type ConvaiStatus } from './CampaignConvaiWidget.types';
import styles from './CampaignConvaiWidget.module.css';

export interface ConvaiHeaderLabels {
	title: string;
	description: string;
	helper: string;
}

export interface ConvaiHeaderProps {
	status: ConvaiStatus;
	statusLabel: string;
	labels: ConvaiHeaderLabels;
}

const ConvaiHeader = ({ status, statusLabel, labels }: ConvaiHeaderProps) => {
	const statusIcon = useMemo(() => {
		if (status === 'connecting') {
			return <IconLoader2 size={16} className={styles.spinningIcon} />;
		}
		if (status === 'connected') {
			return <IconCircleCheck size={16} />;
		}
		if (status === 'error') {
			return <IconAlertCircle size={16} />;
		}
		return <IconMessageCircle size={16} />;
	}, [status]);

	return (
		<div className={styles.header}>
			<div className={styles.headerCopy}>
				<Group gap='xs' align='center' wrap='nowrap'>
					<span className={styles.iconBadge}>{statusIcon}</span>
					<Title order={5} className={styles.title}>
						{labels.title}
					</Title>
				</Group>
				<Text size='sm' c='dimmed' className={styles.description}>
					{labels.description}
				</Text>
				<Text size='xs' c='dimmed'>
					{labels.helper}
				</Text>
			</div>
			<Badge
				variant='light'
				color={STATUS_COLOR_MAP[status]}
				className={styles.statusBadge}
			>
				{statusLabel}
			</Badge>
		</div>
	);
};

export default ConvaiHeader;
