import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContentContainer from '~/components/ContentContainer';
import { WizardStepper, wizardKitStyles } from '../components/DemoWizardKit';
import StepCampaignDetails from './StepCampaignDetails';
import StepUploadFiles from './StepUploadFiles';
import ExternalCampaignWizard from '~/modules/campaigns/ExternalCampaignWizard/ExternalCampaignWizard';
import type {
	DemoWizardCampaignDetails,
	DemoWizardUploadedFile,
} from './types';

const STEPS = [
	{ label: 'Campaign Details', description: '' },
	{ label: 'FTP Configuration', description: 'Connect data source' },
	{ label: 'Upload Files', description: 'Optional' },
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
	const [files, setFiles] = useState<DemoWizardUploadedFile[]>([]);

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
						onExit={exitWizard}
					/>
				)}

				{activeStep === 1 && (
					<ExternalCampaignWizard onComplete={() => setActiveStep(2)} />
				)}

				{activeStep === 2 && (
					<StepUploadFiles
						campaignDetails={details}
						files={files}
						onChange={setFiles}
						onBack={() => setActiveStep(1)}
						onCreate={handleCreateCampaign}
						onExit={exitWizard}
					/>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default DemoNewCampaignWizardPage;
