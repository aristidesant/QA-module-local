import React, { useState } from 'react';
import {
	Button,
	Group,
	Stack,
	Text,
	ActionIcon,
	Center,
	Loader,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { IconCalculator } from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useUpdateCampaign } from '~/queries/campaignsQueries';
import SectionCard from '~/components/SectionCard';
import ParametersSection from '~/modules/campaigns/CampaignsForm/ParametersSection';
import SchedulerCalculator from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator';
import type { WorkingHours } from '~/models/CampaignsModel';
import sharedStyles from '../CampaignWizard.module.css';

interface StepFourParametersProps {
	onNext: () => void;
	onBack: () => void;
}

export const StepFourParameters: React.FC<StepFourParametersProps> = ({
	onNext,
	onBack,
}) => {
	const { createdCampaign, setIsSubmitting, setCreatedCampaign } =
		useCampaignWizardStore();

	const updateCampaign = useUpdateCampaign();
	const queryClient = useQueryClient();

	// Start with empty working hours unless campaign already has them
	const [workingHours, setWorkingHours] = useState<WorkingHours>(
		createdCampaign?.workingHours || {}
	);

	const handleWorkingHoursChange = (
		day: string,
		field: string,
		value: boolean | string
	) => {
		const updatedHours = { ...workingHours };
		updatedHours[day] = { ...updatedHours[day], [field]: value };
		setWorkingHours(updatedHours);
	};

	const handleCopyToAll = (sourceDay: string) => {
		const sourceHours = workingHours[sourceDay];
		if (!sourceHours) return;

		const updatedHours = { ...workingHours };
		Object.keys(updatedHours).forEach((day) => {
			updatedHours[day] = { ...sourceHours };
		});
		setWorkingHours(updatedHours);
	};

	const handleSubmit = async () => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Update campaign with working hours
			const updatedCampaign = await updateCampaign.mutateAsync({
				id: String(createdCampaign.id),
				data: {
					workingHours,
				},
			});

			// Update store with fresh campaign data
			setCreatedCampaign(updatedCampaign);
			setIsSubmitting(false);

			// Invalidate campaign cache
			queryClient.invalidateQueries({
				queryKey: ['campaign', String(createdCampaign.id)],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaigns'],
			});

			notifications.show({
				title: 'Working Hours Saved',
				message: 'Campaign working hours configured successfully.',
				color: 'green',
			});

			onNext();
		} catch (error) {
			setIsSubmitting(false);
			notifications.show({
				title: 'Error',
				message:
					error instanceof Error
						? error.message
						: 'Failed to save working hours configuration',
				color: 'red',
			});
		}
	};

	// Loading state check
	if (!createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>Loading campaign data...</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<Stack gap='md'>
				{/* Working Hours Configuration Section */}
				<SectionCard
					title='Working Hours'
					description='Define the days and time ranges during which your agents are allowed to make calls.'
					headerActions={
						<ActionIcon
							size='md'
							variant='subtle'
							onClick={() =>
								modals.open({
									title: 'Scheduler Calculator',
									fullScreen: true,
									children: <SchedulerCalculator />,
								})
							}
						>
							<IconCalculator size={18} />
						</ActionIcon>
					}
				>
					<ParametersSection
						workingHours={workingHours}
						onChange={handleWorkingHoursChange}
						onCopyToAll={handleCopyToAll}
					/>
				</SectionCard>
			</Stack>

			<Group className={sharedStyles.actions}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Button
					type='button'
					loading={updateCampaign.isPending}
					onClick={handleSubmit}
				>
					Save & Continue
				</Button>
			</Group>
		</>
	);
};
