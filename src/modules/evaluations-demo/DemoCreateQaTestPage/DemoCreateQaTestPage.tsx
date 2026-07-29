import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionIcon, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { WizardStepper, wizardKitStyles } from '../components/DemoWizardKit';
import StepTestDetails from './StepTestDetails';
import StepEvaluationCriteria from './StepEvaluationCriteria';
import StepReview from './StepReview';
import type { CriteriaMode, EvaluationGroup, QaTestDetails } from './types';

const STEPS = [
	{ label: 'Test Details', description: 'Name and description' },
	{ label: 'Evaluation Criteria', description: 'Aspects and items' },
	{ label: 'Review', description: 'Confirm and save' },
];

const DemoCreateQaTestPage: React.FC = () => {
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [details, setDetails] = useState<QaTestDetails>({
		name: '',
		qaType: 'Sales',
		description: '',
	});
	const [criteriaMode, setCriteriaMode] = useState<CriteriaMode>(null);
	const [groups, setGroups] = useState<EvaluationGroup[]>([]);
	const [passThreshold, setPassThreshold] = useState(80);

	const exitWizard = () => navigate('/role-preview/qa-forms');

	const handleSaveDraft = () => {
		notifications.show({
			title: 'Saved as draft',
			message: `"${details.name || 'Untitled test'}" has been saved as a draft.`,
			color: 'yellow',
		});
		exitWizard();
	};

	const handlePublish = () => {
		notifications.show({
			title: 'Test published',
			message: `"${details.name}" has been published successfully.`,
			color: 'green',
		});
		exitWizard();
	};

	return (
		<ContentContainer contentWidth='full'>
			<div className={wizardKitStyles.headerRow}>
				<div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
					<ActionIcon
						variant='subtle'
						color='green'
						mt={4}
						aria-label='Exit wizard'
						onClick={exitWizard}
					>
						<IconArrowLeft size={18} />
					</ActionIcon>
					<div>
						<Text fw={700} size='xl'>
							New QA Form
						</Text>
						<Text size='sm' c='dimmed'>
							Define test criteria and evaluation items
						</Text>
					</div>
				</div>
			</div>

			<div className={wizardKitStyles.stepperRow}>
				<WizardStepper steps={STEPS} activeStep={activeStep} />
			</div>

			<Stack gap='md'>
				{activeStep === 0 && (
					<StepTestDetails
						value={details}
						onChange={setDetails}
						onCancel={exitWizard}
						onNext={() => setActiveStep(1)}
					/>
				)}

				{activeStep === 1 && (
					<StepEvaluationCriteria
						mode={criteriaMode}
						onModeChange={setCriteriaMode}
						groups={groups}
						onChange={setGroups}
						onBack={() => setActiveStep(0)}
						onCancel={exitWizard}
						onSaveDraft={handleSaveDraft}
						onNext={() => setActiveStep(2)}
					/>
				)}

				{activeStep === 2 && (
					<StepReview
						details={details}
						groups={groups}
						passThreshold={passThreshold}
						onPassThresholdChange={setPassThreshold}
						onBack={() => setActiveStep(1)}
						onCancel={exitWizard}
						onSaveDraft={handleSaveDraft}
						onPublish={handlePublish}
					/>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default DemoCreateQaTestPage;
