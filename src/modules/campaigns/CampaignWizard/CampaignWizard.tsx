import React from 'react';
import { Stepper } from '@mantine/core';
import {
	IconListDetails,
	IconSettings,
	IconUsers,
	IconCheck,
} from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { StepOneGeneral } from './StepOneGeneral';
import { StepTwoAgent } from './StepTwoAgent';
import styles from './CampaignWizard.module.css';

interface CampaignWizardProps {
	onComplete?: () => void;
	onCancel?: () => void;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
	onComplete,
	onCancel,
}) => {
	const { activeStep, nextStep, prevStep, reset } = useCampaignWizardStore();

	const handleCancel = () => {
		reset();
		onCancel?.();
	};

	return (
		<div className={styles.container}>
			<Stepper active={activeStep} className={styles.stepper}>
				<Stepper.Step
					label='General'
					description='Campaign details'
					icon={<IconListDetails size={18} />}
				>
					<div className={styles.stepContent}>
						<StepOneGeneral onNext={nextStep} onCancel={handleCancel} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label='Agent'
					description='Agent setup'
					icon={<IconSettings size={18} />}
				>
					<div className={styles.stepContent}>
						<StepTwoAgent onNext={nextStep} onBack={prevStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label='Contacts'
					description='Audience selection'
					icon={<IconUsers size={18} />}
				>
					<div className={styles.stepContent}>
						{/* Step 3 will be added here */}
						<p>Step 3 - Coming soon</p>
					</div>
				</Stepper.Step>

				<Stepper.Step
					label='Review'
					description='Final check'
					icon={<IconCheck size={18} />}
				>
					<div className={styles.stepContent}>
						{/* Step 4 will be added here */}
						<p>Step 4 - Coming soon</p>
					</div>
				</Stepper.Step>
			</Stepper>
		</div>
	);
};
