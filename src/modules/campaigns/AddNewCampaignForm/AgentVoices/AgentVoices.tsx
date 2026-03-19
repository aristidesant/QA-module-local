import { useCallback, useRef, useState } from 'react';
import {
	Text,
	Loader,
	Group,
	Avatar,
	Badge,
	Stack,
	Card,
	ActionIcon,
} from '@mantine/core';
import { IconMicrophone, IconEdit, IconPlus } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { useAgentVoicesColumns } from './useAgentVoicesColumns';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './AgentVoices.module.css';

type AgentVoicesProps = {
	onVoiceSelect: (voice: AgentVoiceModel) => void;
	selectedVoiceId?: string;
};

export interface AgentVoicesFilterValues {
	name: string;
	gender: string;
	language: string;
	status: string;
	age: string;
	accent: string;
}

const AgentVoices: React.FC<AgentVoicesProps> = ({
	onVoiceSelect,
	selectedVoiceId,
}) => {
	const { t } = useTranslation(['campaigns.create', 'common']);
	const [filters] = useState<AgentVoicesFilterValues>({
		name: '',
		gender: '',
		language: '',
		status: '',
		age: '',
		accent: '',
	});
	const [debouncedFilters] = useDebouncedValue(filters, 400);

	const {
		data: elevenLabsVoices,
		isLoading,
		isError,
	} = useGetAllAgentVoices(
		Object.fromEntries(
			Object.entries(debouncedFilters).filter(([_, value]) => value !== '')
		) as Record<string, string>
	);

	const voices = elevenLabsVoices ?? [];
	const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
	const [playProgress, setPlayProgress] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement>(null);

	const handleVoiceSelection = useCallback(
		(voiceId: string) => {
			const selectedVoice = voices.find((voice) => voice.voice.id === voiceId);
			if (!selectedVoice) return;

			if (playingVoiceId && playingVoiceId !== voiceId) {
				audioRef.current?.pause();
				setPlayingVoiceId(null);
				setPlayProgress(0);
			}

			onVoiceSelect(selectedVoice);
			modals.close('agent-voice-selection-modal');
		},
		[playingVoiceId, voices, onVoiceSelect]
	);

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
					.catch(() => undefined);
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

	const selectedVoice = selectedVoiceId
		? voices.find((voice) => voice.voice.id === selectedVoiceId)
		: null;

	const openVoiceModal = useCallback(() => {
		modals.open({
			modalId: 'agent-voice-selection-modal',
			title: t('addNewCampaign.voices.modalTitle'),
			size: 'xl',
			centered: true,
			children: (
				<div className={classes.container}>
					<div className={classes.tableWrapper}>
						<BaseTable
							data={voices}
							columns={columns}
							density='compact'
							onRowClick={(row) => handleVoiceSelection(row.voice.id)}
							getRowClassName={(row) =>
								row.original.voice.id === selectedVoiceId
									? classes.selectedRow
									: ''
							}
							emptyMessage={t('addNewCampaign.voices.noVoices')}
						/>
					</div>
				</div>
			),
		});
	}, [voices, columns, selectedVoiceId, handleVoiceSelection, t]);

	let content: React.ReactNode = null;

	if (isLoading) {
		content = (
			<div className={classes.stateCard}>
				<Loader color='var(--mantine-color-blue-6)' size='lg' />
				<Text size='lg' fw={600}>
					{t('addNewCampaign.voices.loading')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('addNewCampaign.voices.loadingDesc')}
				</Text>
			</div>
		);
	} else if (isError) {
		content = (
			<div className={classes.stateCard}>
				<IconMicrophone className={classes.stateIcon} size={48} />
				<Text size='lg' fw={600} c='red'>
					{t('addNewCampaign.voices.error')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('addNewCampaign.voices.errorDesc')}
				</Text>
			</div>
		);
	} else if (voices.length === 0) {
		content = (
			<div className={classes.stateCard}>
				<IconMicrophone className={classes.stateIcon} size={48} />
				<Text size='lg' fw={600}>
					{t('addNewCampaign.voices.noVoices')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('addNewCampaign.voices.noVoicesDesc')}
				</Text>
			</div>
		);
	} else {
		content = selectedVoice ? (
			<Card
				withBorder
				radius='md'
				className={classes.selectedVoiceCard}
				style={{ cursor: 'pointer' }}
				onClick={openVoiceModal}
			>
				<Group align='center' justify='space-between'>
					<Group align='center' gap='md'>
						<Avatar
							src={
								selectedVoice.voice.gender?.toLowerCase() === 'female'
									? '/images/avatar-f-do.png'
									: '/images/avatar-m-do.png'
							}
							alt={selectedVoice.voice.name}
							radius='xl'
							size={48}
							style={{
								border: `2px solid ${
									selectedVoice.voice.gender?.toLowerCase() === 'female'
										? 'var(--mantine-color-pink-4)'
										: 'var(--mantine-color-blue-4)'
								}`,
							}}
						/>
						<Stack gap={2}>
							<Text
								fw={600}
								size='md'
								style={{ color: 'var(--mantine-color-dark-7)' }}
							>
								{selectedVoice.voice.name}
							</Text>
							<Group gap='xs'>
								<Text size='sm' c='dimmed'>
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
									{selectedVoice.voice.gender
										? t(
												`addNewCampaign.voices.${selectedVoice.voice.gender.toLowerCase()}`
											)
										: t('addNewCampaign.voices.unknown')}
								</Badge>
							</Group>
						</Stack>
					</Group>
					<ActionIcon
						variant='light'
						color='blue'
						size='lg'
						radius='xl'
						aria-label={t('addNewCampaign.voices.changeVoice')}
					>
						<IconEdit size={18} />
					</ActionIcon>
				</Group>
			</Card>
		) : (
			<Card
				withBorder
				radius='md'
				className={classes.selectVoiceCard}
				style={{ cursor: 'pointer' }}
				onClick={openVoiceModal}
			>
				<Group align='center' justify='center' gap='sm' p='lg'>
					<IconPlus
						size={24}
						style={{ color: 'var(--mantine-color-gray-5)' }}
					/>
					<Text size='md' c='dimmed' fw={500}>
						{t('addNewCampaign.voices.selectVoice')}
					</Text>
				</Group>
			</Card>
		);
	}

	return (
		<SectionCard
			icon={IconMicrophone}
			title={t('addNewCampaign.voices.title')}
			description={t('addNewCampaign.voices.description')}
			contentSpacing='md'
			id='agent-voices-section'
		>
			<audio
				ref={audioRef}
				onEnded={handleAudioEnded}
				onTimeUpdate={handleTimeUpdate}
				className={classes.hiddenAudio}
			/>
			{content}
		</SectionCard>
	);
};

export default AgentVoices;
