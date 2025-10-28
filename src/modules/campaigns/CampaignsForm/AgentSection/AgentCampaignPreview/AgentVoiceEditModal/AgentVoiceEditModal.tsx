import React, { useState, useRef, useCallback } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';
import { useUpdateAgent, useGetAgent } from '~/queries/agentQueries';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { useAgentVoicesColumns } from '../../../../AddNewCampaignForm/AgentVoices/useAgentVoicesColumns';
import BaseTable from '~/components/BaseTable/BaseTable';
import styles from './AgentVoiceEditModal.module.css';

interface AgentVoiceEditModalProps {
	agentId: string;
	currentVoiceId: string;
	onClose: () => void;
	onSuccess?: () => void;
}

export const AgentVoiceEditModal: React.FC<AgentVoiceEditModalProps> = ({
	agentId,
	currentVoiceId,
	onClose,
	onSuccess,
}) => {
	const [selectedVoiceId, setSelectedVoiceId] =
		useState<string>(currentVoiceId);
	const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
	const [playProgress, setPlayProgress] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement>(null);

	const updateAgentMutation = useUpdateAgent();
	const { data: agent } = useGetAgent(agentId);

	const [filters] = useState({
		name: '',
		gender: '',
		language: '',
		status: '',
		age: '',
		accent: '',
	});
	const [debouncedFilters] = useDebouncedValue(filters, 400);

	const { data: elevenLabsVoices, isLoading: isLoadingVoices } =
		useGetAllAgentVoices(
			Object.fromEntries(
				Object.entries(debouncedFilters).filter(([_, value]) => value !== '')
			) as Record<string, string>
		);

	const voices = elevenLabsVoices ?? [];

	const handlePlayVoice = useCallback(
		(voiceId: string, previewUrl: string) => {
			if (!previewUrl) return;

			if (playingVoiceId === voiceId) {
				audioRef.current?.pause();
				setPlayingVoiceId(null);
				setPlayProgress(0);
			} else if (audioRef.current) {
				if (playingVoiceId) {
					audioRef.current.pause();
					setPlayProgress(0);
				}

				audioRef.current.src = previewUrl;
				audioRef.current
					.play()
					.then(() => {
						setPlayingVoiceId(voiceId);
					})
					.catch(console.error);
			}
		},
		[playingVoiceId]
	);

	const handleAudioEnded = () => {
		setPlayingVoiceId(null);
		setPlayProgress(0);
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			const progress =
				(audioRef.current.currentTime / audioRef.current.duration) * 100;
			setPlayProgress(progress);
		}
	};

	const columns = useAgentVoicesColumns({
		onPlayVoice: handlePlayVoice,
		playingVoiceId,
		playProgress,
	});

	const handleVoiceSelection = useCallback(
		(voiceId: string) => {
			if (playingVoiceId && playingVoiceId !== voiceId) {
				audioRef.current?.pause();
				setPlayingVoiceId(null);
				setPlayProgress(0);
			}
			setSelectedVoiceId(voiceId);
		},
		[playingVoiceId]
	);

	const handleSaveAgent = async () => {
		if (!selectedVoiceId) {
			notifications.show({
				title: 'Error',
				message: 'Please select a voice',
				color: 'red',
			});
			return;
		}

		if (!agent) {
			notifications.show({
				title: 'Error',
				message: 'Agent data not loaded',
				color: 'red',
			});
			return;
		}

		try {
			// Preserve existing conversationConfig and only update voiceId
			const existingConversationConfig =
				(agent as any).conversationConfig || {};
			const existingTts = existingConversationConfig.tts || {};

			await updateAgentMutation.mutateAsync({
				id: agentId,
				data: {
					voiceId: selectedVoiceId, // Root level voiceId
					conversationConfig: {
						...existingConversationConfig,
						tts: {
							...existingTts,
							voiceId: selectedVoiceId, // Nested voiceId
						},
					},
				},
			});

			notifications.show({
				title: 'Success',
				message: 'Agent voice updated successfully',
				color: 'green',
			});

			onSuccess?.();
			onClose();
		} catch (error: any) {
			notifications.show({
				title: 'Error',
				message:
					error?.response?.data?.message || 'Failed to update agent voice',
				color: 'red',
			});
		}
	};

	const hasChanges = selectedVoiceId !== currentVoiceId;

	return (
		<Stack gap='md'>
			<audio
				ref={audioRef}
				onEnded={handleAudioEnded}
				onTimeUpdate={handleTimeUpdate}
				style={{ display: 'none' }}
			/>

			<Text size='sm' c='dimmed'>
				Select a voice for your agent and click save to apply the changes.
			</Text>

			<div className={styles.tableContainer}>
				<BaseTable
					data={voices}
					columns={columns}
					density='compact'
					onRowClick={(row) => handleVoiceSelection(row.voice.id)}
					getRowClassName={(row) =>
						row.original.voice.id === selectedVoiceId ? styles.selectedRow : ''
					}
					emptyMessage='No voices found'
					isLoading={isLoadingVoices}
				/>
			</div>

			<Button
				leftSection={<IconDeviceFloppy size={16} />}
				onClick={handleSaveAgent}
				loading={updateAgentMutation.isPending}
				disabled={!hasChanges || updateAgentMutation.isPending}
				fullWidth
			>
				{updateAgentMutation.isPending ? 'Saving...' : 'Save Agent'}
			</Button>
		</Stack>
	);
};

export default AgentVoiceEditModal;
