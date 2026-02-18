// CampaignConfigurationTools.tsx
import React, { useState, useCallback } from 'react';
import { ThemeIcon, Text, ActionIcon, Tooltip, Loader } from '@mantine/core';
import { IconPuzzle, IconTrash, IconPlus } from '@tabler/icons-react';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import RightSectionCard from '~/components/RightSectionCard';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useToolsByCategory } from '~/queries/toolQueries';
import type {
	AgentConfigModel,
	ConversationConfigModel,
} from '~/models/AgentListObject';
import CampaignConfigurationToolsAddModal from './CampaignConfigurationToolsAddModal';
import classes from './CampaignConfigurationTools.module.css';
import { useTranslation } from 'react-i18next';

/**
 * CampaignConfigurationTools Component
 *
 * Displays only active (selected) tools as KB-style rows.
 * Inactive tools can be added via the modal triggered by the "Add tool" button.
 */
const CampaignConfigurationTools: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data: toolCategories } = useToolCategories();
	const { data: tools, isLoading } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);

	const selectedToolIds: string[] =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.toolIds ?? [];

	const activeTools = (tools ?? []).filter((tool) =>
		selectedToolIds.includes(tool.identifier)
	);

	const updateToolIds = useCallback(
		(newIds: string[]) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;

			const updatedAgentConfig: Partial<AgentConfigModel> = {
				...currentAgentConfig,
				conversationConfig: currentConversationConfig
					? ({
							...currentConversationConfig,
							agent: {
								...currentAgent,
								prompt: {
									...currentPrompt,
									toolIds: newIds,
								},
							},
						} as ConversationConfigModel)
					: undefined,
			};

			form.setFieldValue('agentConfig', updatedAgentConfig);
		},
		[form]
	);

	const handleRemoveTool = useCallback(
		(identifier: string) => {
			updateToolIds(selectedToolIds.filter((id) => id !== identifier));
		},
		[selectedToolIds, updateToolIds]
	);

	const handleSaveSelections = useCallback(
		(newSelectedIds: string[]) => {
			updateToolIds(newSelectedIds);
			setIsModalOpen(false);
		},
		[updateToolIds]
	);

	return (
		<RightSectionCard
			icon={IconPuzzle}
			title={t('form.agent.tools.title')}
			description={t('form.agent.tools.description')}
		>
			<div className={classes.container}>
				{isLoading ? (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 6,
							padding: '12px',
							justifyContent: 'center',
						}}
					>
						<Loader size='xs' />
						<Text size='xs' c='dimmed'>
							{t('form.agent.tools.noTools')}
						</Text>
					</div>
				) : activeTools.length > 0 ? (
					activeTools.map((tool) => (
						<div key={tool.identifier} className={classes.item}>
							<ThemeIcon variant='light' color='violet' size='md'>
								<IconPuzzle size={16} />
							</ThemeIcon>
							<div className={classes.itemInfo}>
								<div className={classes.itemName}>{tool.name}</div>
								<div className={classes.itemMeta}>
									<span className={classes.itemType}>
										{t('form.agent.tools.customIntegration')}
									</span>
								</div>
							</div>
							<Tooltip label={t('form.agent.tools.remove')} position='left'>
								<ActionIcon
									variant='subtle'
									color='red'
									size='sm'
									onClick={() => handleRemoveTool(tool.identifier)}
									aria-label={t('form.agent.tools.removeAria', {
										name: tool.name,
									})}
								>
									<IconTrash size={15} />
								</ActionIcon>
							</Tooltip>
						</div>
					))
				) : (
					<Text size='xs' c='dimmed'>
						{t('form.agent.tools.noSelection')}
					</Text>
				)}

				<button
					type='button'
					className={classes.addButton}
					onClick={() => setIsModalOpen(true)}
				>
					<IconPlus size={14} className={classes.plusIcon} />
					<span>{t('form.agent.tools.add')}</span>
				</button>
			</div>

			<CampaignConfigurationToolsAddModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				allTools={tools ?? []}
				selectedIds={selectedToolIds}
				isLoading={isLoading}
				onSave={handleSaveSelections}
			/>
		</RightSectionCard>
	);
};

export default CampaignConfigurationTools;
