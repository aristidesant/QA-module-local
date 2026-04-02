import React from 'react';
import { Stepper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconListDetails,
	IconSettings,
	IconNetwork,
	IconClock,
	IconFlag,
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
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	const { activeStep, nextStep, reset } = useCampaignWizardStore();

	const handleCancel = () => {
		reset();
		onCancel?.();
	};

	return (
		<div className={styles.wrapper}>
			<Stepper
				active={activeStep}
				iconSize={34}
				size='sm'
				contentPadding='0'
				classNames={{
					root: styles.stepperRoot,
					steps: styles.stepperSteps,
					stepBody: styles.stepBody,
					stepLabel: styles.stepLabel,
					stepDescription: styles.stepDescription,
					stepIcon: styles.stepIcon,
					separator: styles.stepSeparator,
				}}
			>
				<Stepper.Step
					label={t('wizard.steps.general.label')}
					description={t('wizard.steps.general.description')}
					icon={<IconListDetails size={18} />}
				>
					<div className={styles.stepContent}>
						<StepOneGeneral onNext={nextStep} onCancel={handleCancel} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label={t('wizard.steps.agent.label')}
					description={t('wizard.steps.agent.description')}
					icon={<IconSettings size={18} />}
				>
					<div className={styles.stepContent}>
						<StepTwoAgent onNext={nextStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label={t('wizard.steps.outcomes.label')}
					description={t('wizard.steps.outcomes.description')}
					icon={<IconNetwork size={18} />}
				>
					<div className={styles.stepContent}>
						<StepThreeOutcomes onNext={nextStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label={t('wizard.steps.parameters.label')}
					description={t('wizard.steps.parameters.description')}
					icon={<IconClock size={18} />}
				>
					<div className={styles.stepContent}>
						<StepFourParameters onNext={nextStep} />
					</div>
				</Stepper.Step>

				<Stepper.Step
					label={t('wizard.steps.complete.label')}
					description={t('wizard.steps.complete.description')}
					icon={<IconFlag size={18} />}
				>
					<div className={styles.stepContent}>
						<StepFiveSuccess onComplete={onComplete || (() => {})} />
					</div>
				</Stepper.Step>
			</Stepper>
		</div>
	);
};
