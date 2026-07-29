import React from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { WizardFooter, wizardKitStyles } from '../components/DemoWizardKit';
import type { DemoWizardCampaignDetails } from './types';

const CAMPAIGN_TYPE_OPTIONS = ['Sales', 'Support', 'Training', 'Compliance', 'Other'];
const CALL_DIRECTION_OPTIONS = ['Inbound', 'Outbound', 'Mixed'];

interface StepCampaignDetailsProps {
	value: DemoWizardCampaignDetails;
	onChange: (value: DemoWizardCampaignDetails) => void;
	onNext: () => void;
	onExit: () => void;
}

const StepCampaignDetails: React.FC<StepCampaignDetailsProps> = ({
	value,
	onChange,
	onNext,
	onExit,
}) => {
	return (
		<Stack gap='md'>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				<ActionIcon
					variant='subtle'
					color='green'
					mt={4}
					aria-label='Exit wizard'
					onClick={onExit}
				>
					<IconArrowLeft size={18} />
				</ActionIcon>
				<div>
					<Text fw={700} size='lg'>
						External Campaign Information
					</Text>
					<Text size='sm' c='dimmed'>
						Provide details for your external campaign
					</Text>
				</div>
			</Group>

			<div className={wizardKitStyles.stepCardNarrow}>
				<Stack gap='md'>
					<TextInput
						label='Campaign Name'
						placeholder='e.g., Q2 Sales Campaign'
						value={value.name}
						onChange={(e) =>
							onChange({ ...value, name: e.currentTarget.value })
						}
					/>
					<Select
						label='Campaign Type'
						data={CAMPAIGN_TYPE_OPTIONS}
						value={value.campaignType}
						onChange={(next) =>
							onChange({ ...value, campaignType: next ?? value.campaignType })
						}
					/>
					<Select
						label='Call Direction'
						data={CALL_DIRECTION_OPTIONS}
						value={value.callDirection}
						onChange={(next) =>
							onChange({ ...value, callDirection: next ?? value.callDirection })
						}
					/>
					<Textarea
						label='Description'
						placeholder='Brief description of this campaign'
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
				<Button color='green' disabled={!value.name.trim()} onClick={onNext}>
					Next
				</Button>
			</WizardFooter>
		</Stack>
	);
};

export default StepCampaignDetails;
