import { useCallback, useState } from 'react';
import {
	Text,
	Loader,
	Group,
	Avatar,
	Badge,
	Stack,
	Card,
	Button,
	Modal,
} from '@mantine/core';
import { IconMicrophone, IconChevronDown } from '@tabler/icons-react';

import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import VoiceList from './VoiceList';
import { VoiceMiniPlayer } from '~/components/VoiceMiniPlayer';
import classes from './AgentVoiceSelector.module.css';

type AgentVoiceSelectorProps = {
	onSelect: (voice: AgentVoiceModel) => void;
	selectedVoiceId?: string;
};

const AgentVoiceSelector: React.FC<AgentVoiceSelectorProps> = ({
	onSelect,
	selectedVoiceId,
}) => {
	const { data: elevenLabsVoices, isLoading, isError } = useGetAllAgentVoices();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const voices = elevenLabsVoices ?? [];

	const selectedVoice = voices.find(
		(voice) => voice.voice.id === selectedVoiceId
	);

	const handleVoiceSelection = useCallback(
		(voiceId: string) => {
			const selected = voices.find((voice) => voice.voice.id === voiceId);

			if (!selected) {
				return;
			}

			onSelect(selected);
			setIsModalOpen(false);
		},
		[voices, onSelect]
	);

	const openVoiceModal = useCallback(() => {
		setIsModalOpen(true);
	}, []);

	if (isLoading) {
		return (
			<div className={classes.loadingContainer}>
				<Loader color='var(--mantine-color-blue-6)' size='sm' />
				<Text size='sm' c='dimmed'>
					Loading voices...
				</Text>
			</div>
		);
	}

	if (isError) {
		return (
			<div className={classes.errorContainer}>
				<Text size='sm' c='red'>
					Failed to load voices
				</Text>
			</div>
		);
	}

	return (
		<div className={classes.container}>
			{selectedVoice ? (
				<Card withBorder className={classes.selectedCard}>
					<Group justify='space-between' align='center' wrap='nowrap'>
						<Group gap='md' align='center'>
							<Avatar
								src={
									selectedVoice.voice.gender?.toLowerCase() === 'female'
										? '/images/avatar-f-do.png'
										: '/images/avatar-m-do.png'
								}
								alt={selectedVoice.voice.name}
								radius='xl'
								size={40}
								className={
									selectedVoice.voice.gender?.toLowerCase() === 'female'
										? classes.avatarFemale
										: classes.avatarMale
								}
							/>
							<Stack gap={2}>
								<Text fw={600} size='sm' className={classes.voiceName}>
									{selectedVoice.voice.name}
								</Text>
								<Group gap='xs'>
									<Text size='xs' c='dimmed'>
										{getLanguageFlagEmoji(selectedVoice.voice.language || '')}{' '}
										{selectedVoice.voice.language}
									</Text>
									<Badge
										size='xs'
										variant='light'
										color={
											selectedVoice.voice.gender?.toLowerCase() === 'female'
												? 'pink'
												: 'blue'
										}
									>
										{selectedVoice.voice.gender ?? 'Unknown'}
									</Badge>
								</Group>
							</Stack>
							<VoiceMiniPlayer
								voiceUrl={selectedVoice.voice.previewUrl}
								disabled={!selectedVoice.voice.previewUrl}
								size='small'
							/>
						</Group>
						<Button
							variant='subtle'
							size='xs'
							onClick={openVoiceModal}
							rightSection={<IconChevronDown size={14} />}
						>
							Change
						</Button>
					</Group>
				</Card>
			) : (
				<Card withBorder className={classes.emptyCard} onClick={openVoiceModal}>
					<Group justify='center' align='center' gap='sm'>
						<IconMicrophone size={20} className={classes.emptyIcon} />
						<Text size='sm' c='dimmed' fw={500}>
							Select a voice
						</Text>
					</Group>
				</Card>
			)}

			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Select AI Voice'
				size='xl'
				centered
				closeOnClickOutside={false}
				closeOnEscape={false}
			>
				<div className={classes.modalContainer}>
					<VoiceList
						voices={voices}
						selectedVoiceId={selectedVoiceId}
						onVoiceSelect={handleVoiceSelection}
					/>
				</div>
			</Modal>
		</div>
	);
};

export default AgentVoiceSelector;
