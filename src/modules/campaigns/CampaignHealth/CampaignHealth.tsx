// src/modules/campaigns/CampaignHealth/CampaignHealth.tsx

import React, { useMemo } from 'react';
import { Alert, Badge, Group, Loader, Stack, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useGetCampaignRequirements } from '~/queries/campaignsQueries';
import classes from './CampaignHealth.module.css';

interface CampaignHealthProps {
	campaignId: string;
}

const CampaignHealth: React.FC<CampaignHealthProps> = ({ campaignId }) => {
	const {
		data: requirements,
		isLoading,
		error,
	} = useGetCampaignRequirements(campaignId);

	if (isLoading) {
		return (
			<Group justify='center'>
				<Loader size='sm' />
				<Text className={classes.loadingText}>Loading campaign health...</Text>
			</Group>
		);
	}

	if (error) {
		return (
			<Alert color='red' variant='light' title='Error'>
				<Text className={classes.loadingText}>
					Failed to load campaign requirements.
				</Text>
			</Alert>
		);
	}

	if (!requirements) {
		return (
			<Text className={classes.loadingText}>
				No requirements data available.
			</Text>
		);
	}

	const {
		canRun = false,
		campaignType = 'Unknown',
		missingRequirements = [],
	} = requirements;

	return (
		<Stack gap='md' className={classes.root}>
			<div className={classes.statusCard}>
				<Group
					justify='space-between'
					align='flex-start'
					className={classes.statusHeader}
				>
					<div className={classes.statusCopy}>
						<Text className={classes.statusLabel}>Overall status</Text>
						<Text className={classes.statusCaption}>
							Campaign type: {campaignType}
						</Text>
					</div>
					<Badge
						color={canRun ? 'green' : 'red'}
						leftSection={canRun ? <IconCheck size={14} /> : <IconX size={14} />}
						variant='light'
						className={classes.statusBadge}
					>
						{canRun ? 'Ready to Run' : 'Not Ready'}
					</Badge>
				</Group>
			</div>

			{!canRun && missingRequirements.length > 0 && (
				<Alert
					color='orange'
					variant='light'
					title='Missing requirements'
					classNames={{
						root: classes.requirementsCard,
						title: classes.requirementsTitle,
						message: classes.requirementsMessage,
					}}
				>
					{missingRequirements.map((req, index) => (
						<div key={index} className={classes.requirementItem}>
							<span className={classes.requirementBullet}>•</span>
							<Text component='span' className={classes.requirementCopy}>
								{req}
							</Text>
						</div>
					))}
				</Alert>
			)}
		</Stack>
	);
};

export default CampaignHealth;
