// src/modules/campaigns/CampaignHealth/CampaignHealth.tsx

import React from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Group, Loader, Stack, Text } from '@mantine/core';
import {
	IconX,
	IconAlertTriangle,
	IconCalendarOff,
	IconArrowRight,
} from '@tabler/icons-react';
import { useGetCampaignRequirements } from '~/queries/campaignsQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import classes from './CampaignHealth.module.css';

interface CampaignHealthProps {
	campaignId: string;
}

const CampaignHealth: React.FC<CampaignHealthProps> = ({ campaignId }) => {
	const navigate = useNavigate();
	const {
		data: requirements,
		isLoading,
		error,
	} = useGetCampaignRequirements(campaignId);

	// Ensure hooks maintain consistent call order by invoking permissions here
	const { canPerformAction } = usePermissions();
	const canEdit = canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE);

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
		return null;
	}

	const { hasDispositionFlow = false, hasActiveSchedule = false } =
		requirements;

	// If all requirements are met, don't show anything
	if (hasDispositionFlow && hasActiveSchedule) {
		return null;
	}

	return (
		<Stack gap='md' className={classes.root}>
			<div className={classes.detailsList}>
				{!hasDispositionFlow && (
					<div className={classes.detailItem}>
						<Group gap='xs'>
							<IconAlertTriangle size={16} className={classes.iconWarning} />
							<Text className={classes.detailLabel}>Disposition Flow</Text>
						</Group>
						<Group gap='xs'>
							<IconX size={14} className={classes.iconError} />
							<Text className={classes.detailValue}>Not configured</Text>
						</Group>
					</div>
				)}
				{!hasActiveSchedule && (
					<div className={classes.detailItem}>
						<Group gap='xs'>
							<IconCalendarOff size={16} className={classes.iconWarning} />
							<Text className={classes.detailLabel}>Active Schedule</Text>
						</Group>
						<Group gap='xs'>
							<IconX size={14} className={classes.iconError} />
							<Text className={classes.detailValue}>Not active</Text>
						</Group>
					</div>
				)}
			</div>
			{canEdit && (
				<Button
					variant='light'
					rightSection={<IconArrowRight size={16} />}
					onClick={() => navigate(`/campaign/${campaignId}`)}
					className={classes.editButton}
				>
					Go to edit
				</Button>
			)}
		</Stack>
	);
};

export default CampaignHealth;
