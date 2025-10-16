import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Tooltip, Button, Stack } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { IconRefresh, IconToolsOff } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import ConfigurationSummary from './ConfigurationSummary';
import EmptyState from '~/components/EmptyState';

const isValidValue = (value: unknown): boolean => {
	if (value === null || value === undefined) return false;
	if (typeof value === 'string' && value.length === 0) return false;
	if (typeof value === 'number' && isNaN(value)) return false;
	return true;
};

const isValidObject = (obj: unknown): obj is Record<string, any> => {
	return (
		obj !== null &&
		obj !== undefined &&
		typeof obj === 'object' &&
		!Array.isArray(obj)
	);
};

const CampaignConfigurationPredefinedParams: React.FC = () => {
	const predefinedParams = useCampaignsPredefinedParams();
	const form = useCampaignFormContext();
	const [appliedParam, setAppliedParam] =
		useState<CampaignPredefinedParam | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const appliedPreviewConfig = useMemo(() => {
		return appliedParam?.params?.conversationConfig ?? null;
	}, [appliedParam]);

	const applyConversationConfig = (config: ConversationConfigModel) => {
		if (!isValidObject(config)) {
			console.log('Config is not a valid object:', config);
			return;
		}
		console.log('Applying conversation config:', config);
		const conversationConfig: Record<string, any> = {};

		// Apply all properties from the config that have valid values
		(
			[
				'asr',
				'tts',
				'turn',
				'agent',
				'conversation',
				'languagePresets',
			] as const
		).forEach((key) => {
			const value = config[key];
			console.log(`Processing key '${key}':`, value);
			console.log(config);

			// Accept any valid value (object, array, primitive)
			if (isValidValue(value)) {
				if (isValidObject(value)) {
					// Deep clone objects to avoid reference issues
					conversationConfig[key] = JSON.parse(JSON.stringify(value));
				} else if (Array.isArray(value)) {
					conversationConfig[key] = [...value];
				} else {
					conversationConfig[key] = value;
				}
			}
		});

		// Only update the form if there are valid properties to apply
		console.log('Filtered conversation config:', conversationConfig);
		if (Object.keys(conversationConfig).length > 0) {
			const currentAgentConfig = form.values.agentConfig || {};
			const mergedConfig = deepMergeConfig(
				currentAgentConfig.conversationConfig || {},
				conversationConfig as Record<string, any>
			);

			console.log('Merged config:', mergedConfig);
			form.setValues({
				agentConfig: {
					...currentAgentConfig,
					conversationConfig: mergedConfig as ConversationConfigModel,
				},
			});
		} else {
			console.log('No valid properties to apply from config');
		}
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleApplyFromModal = (param: CampaignPredefinedParam) => {
		if (param.params?.conversationConfig) {
			applyConversationConfig(param.params.conversationConfig);
			setAppliedParam(param);
			setIsModalOpen(false);
		}
	};

	return (
		<>
			<SectionCard
				title='Predefined Parameters'
				description='Select from predefined parameter sets for your campaign'
				headerActions={
					<Tooltip label='Choose from predefined campaign configurations'>
						<Button
							variant='light'
							leftSection={<IconRefresh size={16} />}
							onClick={handleOpenModal}
						>
							Select configuration
						</Button>
					</Tooltip>
				}
			>
				<Stack gap='lg'>
					{appliedParam ? (
						<Stack gap='sm'>
							{appliedPreviewConfig && (
								<ConfigurationSummary
									config={form.values?.agentConfig?.conversationConfig}
								/>
							)}
						</Stack>
					) : (
						<EmptyState
							icon={<IconToolsOff />}
							message='No configuration applied yet. Default values are in use.'
						/>
					)}
				</Stack>
			</SectionCard>

			<CampaignPredefinedParamsModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				predefinedParams={predefinedParams}
				initialSelectionName={appliedParam?.name ?? null}
				onApply={handleApplyFromModal}
			/>
		</>
	);
};

export default CampaignConfigurationPredefinedParams;
