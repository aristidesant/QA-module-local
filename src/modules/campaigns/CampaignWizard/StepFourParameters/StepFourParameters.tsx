import React from 'react';
import {
	Button,
	Group,
	Stack,
	Text,
	ActionIcon,
	Center,
	Loader,
	Box,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconCalculator } from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import SectionCard from '~/components/SectionCard';
import ParametersSection from '~/modules/campaigns/CampaignsForm/ParametersSection';
import SchedulerCalculator from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator';
import sharedStyles from '../CampaignWizard.module.css';
import { useSetCampaignDraft } from '~/queries/campaignsQueries';

interface StepFourParametersProps {
	onNext: () => void;
}

export const StepFourParameters: React.FC<StepFourParametersProps> = ({
	onNext,
}) => {
	const { createdCampaign } = useCampaignWizardStore();
	const { mutateAsync: setDraft } = useSetCampaignDraft();

	const handleSubmit = async () => {
		if (createdCampaign?.id) {
			try {
				await setDraft({
					campaignId: String(createdCampaign.id),
					data: { isDraft: true, draftStep: 4 }, // Save as Step 4 (Success Step)
				});
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Failed to save draft step:', error);
			}
		}
		onNext();
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
			<Stack gap='xl' className={sharedStyles.stepSurface}>
				<Box className={sharedStyles.stepHeaderCard}>
					<Text className={sharedStyles.stepEyebrow}>Scheduling</Text>
					<Text className={sharedStyles.stepTitle}>
						Control your calling window
					</Text>
					<Text className={sharedStyles.stepDescriptionText}>
						Keep outreach aligned with business hours and compliance. Copy
						schedules across days or fine-tune each block.
					</Text>
				</Box>

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
						workingHours={createdCampaign.workingHours || {}}
						onChange={() => {}}
						onCopyToAll={() => {}}
						campaignId={createdCampaign.id}
					/>
				</SectionCard>
			</Stack>

			<Group className={sharedStyles.actions} justify='flex-end'>
				<Button type='button' onClick={handleSubmit}>
					Save & Continue
				</Button>
			</Group>
		</>
	);
};
