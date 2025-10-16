import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Stack, Select, Text, Group, Button } from '@mantine/core';
import { CampaignPredefinedParam } from '../../../useCampaignsPredefinedParams';
import ConfigurationSummary from '../ConfigurationSummary';

interface CampaignPredefinedParamsModalProps {
	opened: boolean;
	onClose: () => void;
	predefinedParams: CampaignPredefinedParam[];
	initialSelectionName: string | null;
	onApply: (param: CampaignPredefinedParam) => void;
}

const CampaignPredefinedParamsModal: React.FC<
	CampaignPredefinedParamsModalProps
> = ({ opened, onClose, predefinedParams, initialSelectionName, onApply }) => {
	const [selectionName, setSelectionName] = useState<string | null>(
		initialSelectionName
	);

	useEffect(() => {
		if (opened) {
			setSelectionName(initialSelectionName);
		}
	}, [opened, initialSelectionName]);

	const selectedParam = useMemo(() => {
		if (!selectionName) {
			return null;
		}

		return (
			predefinedParams.find((param) => param.name === selectionName) ?? null
		);
	}, [selectionName, predefinedParams]);

	const previewConfig = useMemo(() => {
		return selectedParam?.params?.conversationConfig ?? null;
	}, [selectedParam]);

	const handleApply = () => {
		if (selectedParam?.params?.conversationConfig) {
			onApply(selectedParam);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Configuration Preview'
			size='xl'
		>
			<Stack gap='md'>
				<Select
					label='Select a predefined parameter set'
					placeholder='Choose a configuration'
					data={predefinedParams.map((param) => ({
						value: param.name,
						label: param.name,
					}))}
					value={selectionName}
					onChange={setSelectionName}
					searchable
					clearable
				/>
				{previewConfig ? (
					<ConfigurationSummary config={previewConfig} />
				) : (
					<Text size='sm' c='dimmed'>
						Choose a predefined configuration to preview its details.
					</Text>
				)}
				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleApply} disabled={!previewConfig}>
						Apply
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default CampaignPredefinedParamsModal;
