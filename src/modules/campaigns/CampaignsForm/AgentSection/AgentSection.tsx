import { Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CampaignAgentSelector from '../components/CampaignAgentSelector';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';
import {
	useCampaignAgentEditor,
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import {
	useGetCampaignAgents,
	useUpdateCampaignAgentConfig,
} from '~/queries/campaignAgentsQueries';

interface AgentSectionProps {
	onOpenSettings?: () => void;
}

const AgentSection: React.FC<AgentSectionProps> = ({ onOpenSettings }) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const {
		selectedCampaignAgentId,
		setSelectedCampaignAgentId,
		selectedCampaignAgent,
	} = useCampaignAgentEditor();
	const { data: campaignAgents } = useGetCampaignAgents(campaignId || 0);
	const updateCampaignAgentConfig = useUpdateCampaignAgentConfig();

	const sortedCampaignAgents = useMemo(
		() =>
			[...(campaignAgents ?? [])].sort((a, b) => {
				if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
				return a.agentType.localeCompare(b.agentType);
			}),
		[campaignAgents]
	);
	const usesCampaignAgentConfig = Boolean(campaignId && selectedCampaignAgent);

	const handleSaveAgent = async () => {
		if (!campaignId || !selectedCampaignAgent) return;

		try {
			await updateCampaignAgentConfig.mutateAsync({
				campaignId,
				id: selectedCampaignAgent.id,
				updateData: {
					config: form.values.agentConfig,
					versionDescription: form.values.versionDescription,
				},
			});
			notifications.show({
				color: 'green',
				message: t('form.agent.selector.saved'),
			});
		} catch {
			notifications.show({
				color: 'red',
				message: t('form.agent.selector.saveError'),
			});
		}
	};

	return (
		<Stack>
			{sortedCampaignAgents.length > 1 && (
				<Group justify='space-between' align='end' gap='sm'>
					<CampaignAgentSelector
						agents={sortedCampaignAgents}
						value={selectedCampaignAgentId}
						onChange={setSelectedCampaignAgentId}
						label={t('form.agent.selector.label')}
					/>
					{usesCampaignAgentConfig && (
						<Button
							size='xs'
							variant='light'
							onClick={handleSaveAgent}
							loading={updateCampaignAgentConfig.isPending}
						>
							{updateCampaignAgentConfig.isPending
								? t('form.agent.selector.saving')
								: t('form.agent.selector.save')}
						</Button>
					)}
				</Group>
			)}
			{sortedCampaignAgents.length <= 1 && usesCampaignAgentConfig && (
				<Group justify='flex-end'>
					<Button
						size='xs'
						variant='light'
						onClick={handleSaveAgent}
						loading={updateCampaignAgentConfig.isPending}
					>
						{updateCampaignAgentConfig.isPending
							? t('form.agent.selector.saving')
							: t('form.agent.selector.save')}
					</Button>
				</Group>
			)}
			<CampaignConfigurationPrompt onOpenSettings={onOpenSettings} />
			<CampaignConfigurationBasic />
			<CampaignConfigurationPredefinedParams />
		</Stack>
	);
};

export default AgentSection;
