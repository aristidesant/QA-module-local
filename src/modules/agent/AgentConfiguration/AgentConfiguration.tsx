import { Button, Group, Loader, Stack, Text } from '@mantine/core';
import { type ReactNode, useCallback } from 'react';
import AgentVoices from '../../campaigns/AddNewCampaignForm/AgentVoices';
import AgentConfigurationTypeSelector from '../AgentConfigurationTypeSelector';
import AgentSettings from '../AgentSettings';
import { useAgentStore } from '~/stores/agentStore';
import { AgentKnowledgeBase } from '../AgentKnowledgeBase';
import type { AgentConfigModel } from '~/models/AgentListObject';
import type AgentListObject from '~/models/AgentListObject';
import { IconDeviceFloppy } from '@tabler/icons-react';
import AgentTools from '../AgentTools';
import AgentTemperatureControl from '../AgentTemperatureControl';
import styles from './AgentConfiguration.module.css';

type AgentConfigurationProps = {
	agentMode?: boolean;
	isLoading?: boolean;
	withVoiceSelection?: boolean;
	agent?: AgentListObject;
	editableAgent?: Partial<AgentConfigModel>;
	campaignId?: number;
	onVoiceSelect?: (voiceId: string) => void;
	onSetRightSection?: (rightSection: ReactNode) => void;
	onUpdateAgent: (updatedFields: Partial<AgentConfigModel>) => void;
};
const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
	agent,
	editableAgent,
	agentMode,
	campaignId,
	withVoiceSelection = true,
	isLoading = false,
	onUpdateAgent,
	onSetRightSection,
	onVoiceSelect = () => {}, // Default no-op function
}) => {
	const agentConfigurationType = useAgentStore(
		(state) => state.agentConfigurationType
	);
	const handleAgentUpdate = useCallback(
		(updatedFields: any) => {
			// Pass the updated fields directly to the parent handler
			onUpdateAgent(updatedFields);
		},
		[onUpdateAgent]
	);

	const shouldDisplayAgentSettings =
		(agentMode && agentConfigurationType === 'custom') || !agentMode;

	return (
		<Stack className={styles.configurationContainer} data-loading={isLoading}>
			{isLoading && <div className={styles.loadingOverlay} />}
			{withVoiceSelection && (
				<AgentVoices
					onVoiceSelect={(voice) => {
						handleAgentUpdate({
							conversationConfig: {
								...(editableAgent?.conversationConfig || {}),
								tts: {
									...(editableAgent?.conversationConfig?.tts || {}),
									voiceId: voice.voice.id,
								},
							},
						});
						onVoiceSelect(voice.voice.id);
					}}
				/>
			)}
			{agentMode && <AgentConfigurationTypeSelector />}
			{shouldDisplayAgentSettings && (
				<>
					<AgentSettings
						agentData={editableAgent}
						agent={agent}
						campaignId={campaignId}
						onUpdateAgentData={handleAgentUpdate}
						onSetRightSection={onSetRightSection}
					/>
					<AgentTemperatureControl
						agentData={editableAgent}
						onUpdateAgentData={handleAgentUpdate}
					/>
					<AgentTools agentId={agent?.id} onAgentUpdated={handleAgentUpdate} />
					<AgentKnowledgeBase />
				</>
			)}
			<div className={styles.saveButtonContainer}>
				{isLoading && (
					<div className={`${styles.savingNotification} ${styles.visible}`}>
						<div className={styles.savingContent}>
							<div className={styles.savingSpinner} />
							<Text className={styles.savingText}>
								Saving agent configuration...
							</Text>
						</div>
					</div>
				)}
				<Group mb='xs'>
					<Button
						className={styles.saveButton}
						// data-loading={isLoading}
						leftSection={
							isLoading ? <Loader size={18} /> : <IconDeviceFloppy size={18} />
						}
						type='submit'
					>
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</Group>
			</div>
		</Stack>
	);
};
export default AgentConfiguration;
