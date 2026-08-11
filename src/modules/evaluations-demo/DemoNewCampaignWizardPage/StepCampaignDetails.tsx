import React from 'react';
import {
	Button,
	Card,
	Container,
	Select,
	Stack,
	Textarea,
	TextInput,
} from '@mantine/core';
import type { DemoWizardCampaignDetails } from './types';

const CAMPAIGN_TYPE_OPTIONS = ['Sales', 'Support', 'Training', 'Compliance', 'Other'];
const CALL_DIRECTION_OPTIONS = ['Inbound', 'Outbound', 'Mixed'];

interface StepCampaignDetailsProps {
	value: DemoWizardCampaignDetails;
	onChange: (value: DemoWizardCampaignDetails) => void;
	onNext: () => void;
	onCancel: () => void;
}

const StepCampaignDetails: React.FC<StepCampaignDetailsProps> = ({
	value,
	onChange,
	onNext,
	onCancel,
}) => {
	return (
		<>
			{/* Main Content Area */}
			{/* inline-style-allow: */}
			<div
				style={{
					minHeight: '100vh',
					paddingBottom: '80px',
				}}
			>
				<Container size='sm' py='xl'>
					<Card shadow='sm' p='lg' radius='md' withBorder>
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
									onChange({
										...value,
										campaignType: next ?? value.campaignType,
									})
								}
							/>
							<Select
								label='Call Direction'
								data={CALL_DIRECTION_OPTIONS}
								value={value.callDirection}
								onChange={(next) =>
									onChange({
										...value,
										callDirection: next ?? value.callDirection,
									})
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
					</Card>
				</Container>
			</div>

			{/* Fixed Controls at Bottom - Full Width */}
			{/* inline-style-allow: */}
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 'var(--mantine-spacing-sm)',
					padding: 'var(--mantine-spacing-lg)',
					backgroundColor: 'var(--mantine-color-white)',
					borderTop: '1px solid var(--mantine-color-gray-2)',
					zIndex: 100,
				}}
			>
				<Button variant='default' onClick={onCancel}>
					Cancel
				</Button>

				<Button disabled>Previous</Button>

				<Button disabled={!value.name.trim()} onClick={onNext}>
					Next
				</Button>
			</div>
		</>
	);
};

export default StepCampaignDetails;
