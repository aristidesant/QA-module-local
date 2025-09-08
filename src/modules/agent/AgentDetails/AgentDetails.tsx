import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import { TextInput, Stack } from '@mantine/core';
import type AgentListObject from '~/models/AgentListObject';
import { notifications } from '@mantine/notifications';
import { useUpdateAgent } from '~/queries/agentQueries';
import { useAssignedTools, useUpdateAgentTools } from '~/queries/toolQueries';
import type {
	AgentConfigModel,
	AgentUpdateModel,
} from '~/models/AgentListObject';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import AgentNotSelected from '~/modules/agents/AgentNotSelected';
import { useAgentStore } from '~/stores/agentStore';
import AgentConfiguration from '../AgentConfiguration/AgentConfiguration';
import { useNavigate } from 'react-router';

export type AgentDetailsProps = {
	agent: AgentListObject;
	onAgentUpdated?: () => void;
};

/**
 * AgentDetails Component
 *
 * This component handles the complete agent editing flow including:
 * 1. Basic agent information (name, voice, etc.)
 * 2. Agent configuration settings
 * 3. Tool assignments (collected locally and applied on save)
 *
 * The tool assignment workflow:
 * - AgentTools component manages local selection state
 * - Tool changes are passed up via handleAgentUpdate
 * - When form is submitted, both agent and tool updates are processed
 * - Tool assignments are only applied when the entire form is saved
 */
const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
	const [editableAgent, setEditableAgent] = useState<Partial<AgentConfigModel>>(
		agent?.config
	);

	const navigate = useNavigate();
	const [name, setName] = useState(agent.name);
	const [voiceId, setVoiceId] = useState<string>();
	const [isEditingName] = useState(false);
	const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
	const { selectedElement, setSelectedElement } = useAgentStore(
		(state) => state
	);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const {
		mutateAsync: updateAgent,
		isPending,
		isSuccess,
		isError,
		error,
		reset,
	} = useUpdateAgent();
	const { data: assignedTools } = useAssignedTools(agent?.id);
	const updateAgentTools = useUpdateAgentTools();

	const agentId = agent.id as string;

	// Handle both regular agent updates and tool IDs
	const handleAgentUpdate = (updatedFields: any) => {
		if (updatedFields.toolIds) {
			// Handle tool IDs separately
			setSelectedToolIds(updatedFields.toolIds);
		} else {
			// Handle other agent config updates
			setEditableAgent((prev: Partial<AgentConfigModel>) => ({
				...prev,
				...updatedFields,
			}));
		}
	};
	// Focus the input when edit mode is activated
	useEffect(() => {
		if (isEditingName && nameInputRef.current) {
			nameInputRef.current.focus();
			nameInputRef.current.select();
		}
	}, [isEditingName]);

	// Notify user on mutation result
	useEffect(() => {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Ensure we have a default voice model before saving
		const updatedConfig = {
			...editableAgent.conversationConfig,
			tts: {
				...editableAgent.conversationConfig?.tts,
			},
		};

		const data: Partial<AgentUpdateModel> = {
			name,
			//! THIS WAS THE OLD APPROACH, TO BE STUDIED
			// voiceId: voiceId || updatedConfig?.tts?.voiceId,
			voiceId: agent.voice?.id || voiceId,
			conversationConfig: updatedConfig,
			platformSettings: editableAgent.platformSettings,
		};
		try {
			// First, update the agent
			await updateAgent({
				id: agentId,
				data,
			});

			// Then, handle tool assignments if there are changes
			if (selectedToolIds.length >= 0 && assignedTools) {
				try {
					const result = await updateAgentTools.mutateAsync({
						agentId,
						newToolIds: selectedToolIds,
						currentAssignedTools: assignedTools,
					});

					if (result.hasChanges) {
						notifications.show({
							title: 'Tools Updated',
							message: `Tools updated successfully.`,
							// message: `Assigned ${result.assigned} tools, unassigned ${result.unassigned} ÷tools.`,
							color: 'blue',
						});
					}
				} catch (toolError) {
					console.error('Error updating agent tools:', toolError);
					notifications.show({
						title: 'Warning',
						message: 'Agent saved but tool assignments failed.',
						color: 'yellow',
					});
				}
			}
		} catch (err) {
			console.error('Error updating agent:', err);
			notifications.show({
				title: 'Error',
				message: 'Failed to update agent.',
				color: 'red',
			});
		}
	};

	const isSubmitting = isPending || updateAgentTools.isPending;
	return (
		<ContentContainer
			title='Agent Creation'
			showBackButton
			onBackClick={() => {
				navigate('/agents');
			}}
			description='Start by setting up the key parameters required for a fully operational AI-driven campaign.'
			rightSection={selectedElement ?? <AgentNotSelected />}
		>
			<Stack>
				<form onSubmit={handleSubmit}>
					<Stack gap='xs'>
						<SectionCard>
							<TextInput
								label='Agent Name'
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</SectionCard>

						<AgentConfiguration
							editableAgent={editableAgent}
							agentMode
							agent={agent}
							isLoading={isSubmitting}
							onVoiceSelect={(voiceId: string) => {
								setVoiceId(voiceId);
							}}
							onSetRightSection={(rightSection: ReactNode) => {
								setSelectedElement(rightSection);
							}}
							onUpdateAgent={handleAgentUpdate}
						/>
					</Stack>
				</form>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDetails;
