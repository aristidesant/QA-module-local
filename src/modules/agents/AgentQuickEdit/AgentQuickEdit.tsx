import React, { useState, useCallback } from 'react';
import { Button, Stack, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import AgentListObject from '~/models/AgentListObject';
import type { AgentConfigModel } from '~/models/AgentListObject';
import { useUpdateAgent } from '~/queries/agentQueries';
import AgentVoices from '~/modules/agent/AgentVoices';
import AgentTemperatureControl from '~/modules/agent/AgentTemperatureControl';

type AgentQuickEditProps = {
	agent: AgentListObject;
	onUpdate?: () => void;
};

const AgentQuickEdit: React.FC<AgentQuickEditProps> = ({ agent, onUpdate }) => {
	const [editableAgent, setEditableAgent] = useState<Partial<AgentConfigModel>>(
		agent?.config || {}
	);
	const [voiceId, setVoiceId] = useState<string>(agent?.voice?.id || '');

	const {
		mutateAsync: updateAgent,
		isPending,
		isSuccess,
		isError,
		error,
		reset,
	} = useUpdateAgent();

	const handleAgentUpdate = useCallback((updatedFields: any) => {
		setEditableAgent((prev: Partial<AgentConfigModel>) => ({
			...prev,
			...updatedFields,
		}));
	}, []);

	const handleVoiceSelect = useCallback(
		(selectedVoiceId: string) => {
			setVoiceId(selectedVoiceId);
			handleAgentUpdate({
				conversationConfig: {
					...(editableAgent?.conversationConfig || {}),
					tts: {
						...(editableAgent?.conversationConfig?.tts || {}),
						voiceId: selectedVoiceId,
					},
				},
			});
		},
		[editableAgent?.conversationConfig, handleAgentUpdate]
	);

	const handleSubmit = async () => {
		try {
			const data = {
				voiceId: voiceId || editableAgent?.conversationConfig?.tts?.voiceId,
				conversationConfig: editableAgent.conversationConfig,
			};

			await updateAgent({
				id: agent.id,
				data,
			});
			if (onUpdate) onUpdate();
		} catch (err) {
			console.error('Error updating agent:', err);
			notifications.show({
				title: 'Error',
				message: 'Failed to update agent.',
				color: 'red',
			});
		}
	};

	// Notify user on mutation result
	React.useEffect(() => {
		if (isSuccess) {
			notifications.show({
				title: 'Success',
				message: 'Agent updated successfully.',
			});
			reset();
		} else if (isError && error) {
			notifications.show({
				title: 'Error',
				message: (error as any)?.message || 'Failed to update agent.',
				color: 'red',
			});
			reset();
		}
	}, [isSuccess, isError, error, reset]);

	return (
		<Stack>
			<AgentVoices
				onSelectVoice={handleVoiceSelect}
				agentData={editableAgent}
				onUpdateAgentData={handleAgentUpdate}
				agent={agent}
			/>
			<AgentTemperatureControl
				agentData={editableAgent}
				onUpdateAgentData={handleAgentUpdate}
			/>
			<Button
				leftSection={
					isPending ? <Loader size={18} /> : <IconDeviceFloppy size={18} />
				}
				onClick={handleSubmit}
				disabled={isPending}
			>
				{isPending ? 'Saving...' : 'Save Changes'}
			</Button>
		</Stack>
	);
};

export default AgentQuickEdit;
