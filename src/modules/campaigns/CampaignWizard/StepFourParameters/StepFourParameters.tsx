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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
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
				void error;
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
					<Text c='dimmed'>{t('wizard.steps.parameters.loading')}</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<Stack gap='xl' className={sharedStyles.stepSurface}>
				<Box className={sharedStyles.stepHeaderCard}>
					<Text className={sharedStyles.stepEyebrow}>
						{t('wizard.steps.parameters.eyebrow')}
					</Text>
					<Text className={sharedStyles.stepTitle}>
						{t('wizard.steps.parameters.title')}
					</Text>
					<Text className={sharedStyles.stepDescriptionText}>
						{t('wizard.steps.parameters.intro')}
					</Text>
				</Box>

				{/* Working Hours Configuration Section */}
				<SectionCard
					title={t('wizard.steps.parameters.workingHoursTitle')}
					description={t('wizard.steps.parameters.workingHoursDesc')}
					headerActions={
						<ActionIcon
							size='md'
							variant='subtle'
							onClick={() =>
								modals.open({
									title: t('wizard.steps.parameters.schedulerCalculator'),
									fullScreen: true,
									children: <SchedulerCalculator />,
								})
							}
						>
							<IconCalculator size={18} />
						</ActionIcon>
					}
				>
					<ParametersSection campaignId={createdCampaign.id} />
				</SectionCard>
			</Stack>

			<Group className={sharedStyles.actions} justify='flex-end'>
				<Button type='button' onClick={handleSubmit}>
					{t('wizard.steps.parameters.submit')}
				</Button>
			</Group>
		</>
	);
};
