import React from 'react';
import { Button, Group, Select, Stack, Textarea, TextInput } from '@mantine/core';
import type { QaTestDetails } from './types';
import { WizardFooter, wizardKitStyles } from '../components/DemoWizardKit';

const QA_TYPE_OPTIONS = [
	'Sales',
	'Support',
	'Localization',
	'Retention',
	'Activation',
	'Accounts Receivable',
	'Compliance',
];

interface StepTestDetailsProps {
	value: QaTestDetails;
	onChange: (value: QaTestDetails) => void;
	onCancel: () => void;
	onNext: () => void;
}

const StepTestDetails: React.FC<StepTestDetailsProps> = ({
	value,
	onChange,
	onCancel,
	onNext,
}) => {
	return (
		<Stack gap='md'>
			<div className={wizardKitStyles.stepCardNarrow}>
				<Stack gap='md'>
					<TextInput
						label='Test Name'
						placeholder='e.g., Sales Call Quality Standards'
						value={value.name}
						onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
					/>
					<Select
						label='QA Type'
						data={QA_TYPE_OPTIONS}
						value={value.qaType}
						onChange={(next) => onChange({ ...value, qaType: next ?? value.qaType })}
					/>
					<Textarea
						label='Test Description'
						placeholder='Brief description of what this test evaluates'
						minRows={3}
						value={value.description}
						onChange={(e) =>
							onChange({ ...value, description: e.currentTarget.value })
						}
					/>
				</Stack>
			</div>

			<div className={wizardKitStyles.footerSpacer} />

			<WizardFooter>
				<Button variant='default' disabled>
					Back
				</Button>
				<Group gap='sm'>
					<Button variant='default' onClick={onCancel}>
						Cancel
					</Button>
					<Button color='green' disabled={!value.name.trim()} onClick={onNext}>
						Continue
					</Button>
				</Group>
			</WizardFooter>
		</Stack>
	);
};

export default StepTestDetails;
