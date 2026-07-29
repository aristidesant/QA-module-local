import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContentContainer from '~/components/ContentContainer';
import { WizardStepper, wizardKitStyles } from '../components/DemoWizardKit';
import StepCampaignDetails from './StepCampaignDetails';
import StepUploadFiles from './StepUploadFiles';
import StepConfirmRoster from './StepConfirmRoster';
import type { DemoWizardCampaignDetails, DemoWizardUploadedFile } from './types';

const STEPS = [
	{ label: 'Campaign Details', description: '' },
	{ label: 'Upload Files', description: 'Optional' },
	{ label: 'Confirm Roster', description: '' },
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
	const [emailOverrides, setEmailOverrides] = useState<Record<string, string>>({});

	const exitWizard = () => navigate('/evaluations-demo');

	const handleCreateCampaign = () => {
		notifications.show({
			title: 'Campaign created',
			message: `"${details.name}" has been created successfully.`,
			color: 'green',
		});
		navigate('/evaluations-demo');
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
					<StepUploadFiles
						files={files}
						onChange={setFiles}
						onBack={() => setActiveStep(0)}
						onNext={() => setActiveStep(2)}
						onExit={exitWizard}
					/>
				)}

				{activeStep === 2 && (
					<StepConfirmRoster
						files={files}
						emailOverrides={emailOverrides}
						onEmailOverrideChange={(agentName, email) =>
							setEmailOverrides((prev) => ({ ...prev, [agentName]: email }))
						}
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
