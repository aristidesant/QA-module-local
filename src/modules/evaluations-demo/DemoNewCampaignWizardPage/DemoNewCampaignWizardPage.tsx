import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContentContainer from '~/components/ContentContainer';
import { WizardStepper, wizardKitStyles } from '../components/DemoWizardKit';
import StepCampaignDetails from './StepCampaignDetails';
import ExternalCampaignWizard from '~/modules/campaigns/ExternalCampaignWizard/ExternalCampaignWizard';
import type { DemoWizardCampaignDetails } from './types';

const STEPS = [
	{ label: 'Campaign Details', description: '' },
	{ label: 'FTP Configuration', description: 'Connect data source' },
];

const DemoNewCampaignWizardPage: React.FC = () => {
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [details, setDetails] = useState<DemoWizardCampaignDetails>({
		name: '',
		campaignType: 'Sales',
		callDirection: 'Inbound',
		description: '',
	});

	const exitWizard = () => navigate('/role-preview/qa-campaigns');

	const handleCreateCampaign = () => {
		notifications.show({
			title: 'Campaign created',
			message: `"${details.name}" has been created successfully.`,
			color: 'green',
		});
		navigate('/role-preview/qa-campaigns');
	};

	return (
		<ContentContainer contentWidth='full'>
			<div className={wizardKitStyles.stepperRow}>
				<WizardStepper steps={STEPS} activeStep={activeStep} />
			</div>

			<Stack gap='md'>
				{activeStep === 0 && (
					<StepCampaignDetails
						value={details}
						onChange={setDetails}
						onNext={() => setActiveStep(1)}
						onCancel={exitWizard}
					/>
				)}

				{activeStep === 1 && (
					<ExternalCampaignWizard
						onComplete={handleCreateCampaign}
						onCancel={exitWizard}
						onBack={() => setActiveStep(0)}
					/>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default DemoNewCampaignWizardPage;
