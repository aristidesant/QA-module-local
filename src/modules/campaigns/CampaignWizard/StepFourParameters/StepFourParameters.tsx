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

interface StepFourParametersProps {
	onNext: () => void;
	onBack: () => void;
}

export const StepFourParameters: React.FC<StepFourParametersProps> = ({
	onNext,
	onBack,
}) => {
	const { createdCampaign } = useCampaignWizardStore();

	const handleSubmit = () => {
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

			<Group className={sharedStyles.actions}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Button type='button' onClick={handleSubmit}>
					Save & Continue
				</Button>
			</Group>
		</>
	);
};
