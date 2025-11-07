import React from 'react';
import { Stepper } from '@mantine/core';
import {
	IconListDetails,
	IconSettings,
	IconNetwork,
	IconClock,
	IconCheck,
} from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { StepOneGeneral } from './StepOneGeneral';
import { StepTwoAgent } from './StepTwoAgent';
import { StepThreeOutcomes } from './StepThreeOutcomes';
import { StepFourParameters } from './StepFourParameters';
import { StepFiveSuccess } from './StepFiveSuccess';
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
			<Stepper active={activeStep} iconSize={42} className={styles.stepper}>
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
					label='Outcomes'
					description='Outcome configuration'
					icon={<IconNetwork size={18} />}
				>
					<div className={styles.stepContent}>
						<StepThreeOutcomes onNext={nextStep} onBack={prevStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label='Parameters'
					description='Working hours & settings'
					icon={<IconClock size={18} />}
				>
					<div className={styles.stepContent}>
						<StepFourParameters onNext={nextStep} onBack={prevStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label='Complete'
					description='Campaign ready'
					icon={<IconCheck size={18} />}
				>
					<div className={styles.stepContent}>
						<StepFiveSuccess onComplete={onComplete || (() => {})} />
					</div>
				</Stepper.Step>
			</Stepper>
		</div>
	);
};
