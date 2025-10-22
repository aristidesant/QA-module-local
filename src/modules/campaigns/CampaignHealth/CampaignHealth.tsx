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
	const detailRows = useMemo(() => {
		const schedules = requirements?.details?.schedules ?? {
			active: 0,
			total: 0,
		};
		const agents = requirements?.details?.agents ?? {
			withPrompt: 0,
			total: 0,
		};
		const contactLists = requirements?.details?.contactLists ?? {
			active: 0,
			total: 0,
		};
		const dispositionFlow = requirements?.details?.dispositionFlow ?? {
			assigned: false,
			flowId: null,
		};

		if (!requirements) {
			return [];
		}

		return [
			{
				label: 'Active schedules',
				value: `${schedules.active} / ${schedules.total}`,
			},
			{
				label: 'Agents with prompts',
				value: `${agents.withPrompt} / ${agents.total}`,
			},
			{
				label: 'Active contact lists',
				value: `${contactLists.active} / ${contactLists.total}`,
			},
			{
				label: 'Disposition flow',
				value: dispositionFlow.assigned ? 'Assigned' : 'Not assigned',
			},
		];
	}, [requirements]);
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

			<div className={classes.detailsSection}>
				<Text className={classes.sectionTitle}>Key checks</Text>
				<div className={classes.detailsList}>
					{detailRows.map(({ label, value }) => (
						<div key={label} className={classes.detailItem}>
							<Text component='span' className={classes.detailLabel}>
								{label}
							</Text>
							<Text component='span' className={classes.detailValue}>
								{value}
							</Text>
						</div>
					))}
				</div>
			</div>
		</Stack>
	);
};

export default CampaignHealth;
