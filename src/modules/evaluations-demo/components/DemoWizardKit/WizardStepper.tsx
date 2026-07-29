import React from 'react';
import { IconCheck } from '@tabler/icons-react';
import styles from './DemoWizardKit.module.css';

export interface WizardStep {
	label: string;
	description: string;
}

interface WizardStepperProps {
	steps: WizardStep[];
	activeStep: number;
}

const WizardStepper: React.FC<WizardStepperProps> = ({ steps, activeStep }) => {
	return (
		<div className={styles.stepsRow}>
			{steps.map((step, index) => {
				const isCompleted = index < activeStep;
				const isActive = index === activeStep;
				const circleClass = isCompleted
					? styles.stepCircleCompleted
					: isActive
						? styles.stepCircleActive
						: styles.stepCirclePending;

				return (
					<React.Fragment key={step.label}>
						{index > 0 && (
							<div
								className={[
									styles.stepConnector,
									index <= activeStep ? styles.stepConnectorActive : '',
								]
									.filter(Boolean)
									.join(' ')}
							/>
						)}
						<div className={styles.stepItem}>
							<div className={circleClass}>
								{isCompleted ? <IconCheck size={18} /> : index + 1}
							</div>
							<div>
								<div className={styles.stepLabel}>{step.label}</div>
								<div className={styles.stepDescription}>{step.description}</div>
							</div>
						</div>
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default WizardStepper;
