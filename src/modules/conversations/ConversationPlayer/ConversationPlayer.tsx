import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	ActionIcon,
	Group,
	Slider,
	Stack,
	Text,
	Box,
	Select,
	Button,
} from '@mantine/core';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconVolume,
	IconHeadphones,
} from '@tabler/icons-react';
import type { VoiceFileModel } from '~/models/ConversationsModels';
import fileApi from '~/api/fileApi';
import { useExportConversationAudio } from '~/queries/conversationsQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import classes from './ConversationPlayer.module.css';
import RightSection from '~/components/RightSection';
import { useConversationStore } from '~/stores/useConversationStore';
import RightSectionCard from '~/components/RightSectionCard';
import { useTranslation } from 'react-i18next';

interface ConversationPlayerProps {
	voiceFile?: VoiceFileModel | null;
	voiceFileId?: number | string | null;
	title?: string;
	description?: string;
	paramConversationId?: number | string;
	contactName?: string;
}
//IconDeviceAudioTape
const ConversationPlayer: React.FC<ConversationPlayerProps> = ({
	voiceFile,
	voiceFileId,
	title,
	description,
	paramConversationId,
	contactName,
}) => {
	const { t } = useTranslation(['conversations', 'common']);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [playbackRate, setPlaybackRate] = useState(1);
	const audioRef = useRef<HTMLAudioElement>(null);
	const conversationId =
		useConversationStore((state) => state.selectedId) || paramConversationId;
	const { canPerformAction } = usePermissions();
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);

	// Default values from translations if not provided
	const displayTitle = title || t('player.title');
	const displayDescription = description || t('player.description');

	// Export audio mutation
	const exportAudioMutation = useExportConversationAudio();

	// Determine the file id to use (prefer explicit prop, fallback to voiceFile.id)
	const fileId = voiceFileId ?? voiceFile?.id ?? null;

	// Fetch presigned URL when we have a file id
	const {
		data: presignedUrl,
		isLoading: isPresignedLoading,
		isError: isPresignedError,
	} = useQuery({
		queryKey: ['file-presigned-url', fileId],
		queryFn: () => fileApi().getPresignedFileUrl(fileId as number | string),
		enabled: Boolean(fileId),
		staleTime: 0,
	});

	// Decide which source to use: presigned URL if available, else repositoryRoute
	const audioSrc = presignedUrl ?? voiceFile?.repositoryRoute ?? '';

	// Handle play/pause toggle
	const togglePlayPause = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play().catch((error) => {
				console.error('Error playing audio:', error);
			});
		}
		setIsPlaying(!isPlaying);
	};

	// Handle time update
	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	// Handle seeking
	const handleSeek = (value: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value;
			setCurrentTime(value);
		}
	};

	// Handle volume change
	const handleVolumeChange = (value: number) => {
		setVolume(value);
		if (audioRef.current) {
			audioRef.current.volume = value;
		}
	};

	// Handle playback rate change
	const handlePlaybackRateChange = (value: string | null) => {
		const rate = parseFloat(value || '1');
		setPlaybackRate(rate);
		if (audioRef.current) {
			audioRef.current.playbackRate = rate;
		}
	};

	// Handle audio loaded metadata
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
			audioRef.current.volume = volume;
			audioRef.current.playbackRate = playbackRate;
		}
	};

	// Handle forward/rewind
	const seek = (seconds: number) => {
		if (audioRef.current) {
			const newTime = Math.max(
				0,
				Math.min(audioRef.current.currentTime + seconds, duration)
			);
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	// Format time in seconds to MM:SS
	const formatTime = (timeInSeconds: number) => {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = Math.floor(timeInSeconds % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	// Handle audio download
	const handleDownload = async () => {
		if (!conversationId || !canExportConversations) return;

		try {
			const result = await exportAudioMutation.mutateAsync(conversationId);

			// Create download link
			const url = URL.createObjectURL(result.blob);
			const link = document.createElement('a');
			link.href = url;

			const filename = contactName
				? `${contactName.toUpperCase()}.MP3`
				: `conversation-${conversationId}.mp3`;

			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading audio:', error);
		}
	};

	// Reset and (re)load audio when source changes
	useEffect(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		if (audioRef.current && audioSrc) {
			// Ensure the new source is applied and loaded
			audioRef.current.src = audioSrc;
			audioRef.current.load();
			audioRef.current.volume = volume;
			audioRef.current.playbackRate = playbackRate;
		}
	}, [audioSrc, volume, playbackRate]);

	// Keyboard controls
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			)
				return;

			switch (event.code) {
				case 'Space':
					event.preventDefault();
					togglePlayPause();
					break;
				case 'ArrowLeft':
					event.preventDefault();
					seek(-5);
					break;
				case 'ArrowRight':
					event.preventDefault();
					seek(5);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isPlaying, duration]);

	// No valid voice file
	if (!fileId && !voiceFile?.repositoryRoute) {
		return (
			<Box
				className={classes.container}
				style={{ borderRadius: 'var(--mantine-radius-md)' }}
			>
				<RightSection title={displayTitle} description={displayDescription}>
					<Box className={classes.emptyState}>
						<IconVolume size={32} className={classes.emptyIcon} />
						<Text c='dimmed' ta='center' size='sm' mt='xs'>
							{t('player.notAvailable')}
						</Text>
					</Box>
				</RightSection>
			</Box>
		);
	}

	return (
		<RightSectionCard
			title={displayTitle}
			icon={IconPlayerPlay}
			description={displayDescription}
		>
			<audio
				ref={audioRef}
				src={audioSrc}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={() => setIsPlaying(false)}
				hidden
			/>

			<Stack gap='xs'>
				{Boolean(fileId) && (isPresignedLoading || isPresignedError) && (
					<Text size='xs' c='dimmed' ta='center' fw={500}>
						{isPresignedLoading ? t('player.loading') : t('player.error')}
					</Text>
				)}
				{/* Progress Bar */}
				<Box className={classes.progressSection}>
					<Slider
						value={currentTime}
						onChange={handleSeek}
						max={duration || 100}
						label={(val) => formatTime(Number(val))}
						className={classes.progressSlider}
						classNames={{
							track: classes.sliderTrack,
							bar: classes.sliderBar,
							thumb: classes.sliderThumb,
						}}
					/>
					<Group justify='space-between' mt='sm'>
						<Text className={classes.timeText}>{formatTime(currentTime)}</Text>
						<Text className={classes.timeText}>{formatTime(duration)}</Text>
					</Group>
				</Box>

				{/* Controls */}
				<Group justify='center' gap='lg' className={classes.playbackControls}>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='lg'
						onClick={() => seek(-10)}
						aria-label={t('player.rewind')}
						title={t('player.rewindShort')}
						className={classes.controlButton}
					>
						<IconPlayerSkipBack size={20} />
					</ActionIcon>

					<ActionIcon
						variant='filled'
						color='blue'
						radius='xl'
						size='xl'
						onClick={togglePlayPause}
						aria-label={isPlaying ? t('player.pause') : t('player.play')}
						className={classes.playButton}
					>
						{isPlaying ? (
							<IconPlayerPause size={28} />
						) : (
							<IconPlayerPlay size={28} style={{ marginLeft: '2px' }} />
						)}
					</ActionIcon>

					<ActionIcon
						variant='subtle'
						color='gray'
						size='lg'
						onClick={() => seek(10)}
						aria-label={t('player.forward')}
						title={t('player.forwardShort')}
						className={classes.controlButton}
					>
						<IconPlayerSkipForward size={20} />
					</ActionIcon>
				</Group>

				{/* Volume and Speed Controls */}
				<Group gap='md' align='center'>
					<Group
						flex={2}
						gap='sm'
						align='center'
						className={classes.volumeGroup}
					>
						<IconVolume size={16} className={classes.volumeIcon} />
						<Slider
							value={volume}
							onChange={handleVolumeChange}
							min={0}
							max={1}
							step={0.1}
							className={classes.volumeSlider}
							classNames={{
								track: classes.sliderTrack,
								bar: classes.sliderBar,
								thumb: classes.sliderThumb,
							}}
						/>
					</Group>
					<Select
						value={playbackRate.toString()}
						onChange={handlePlaybackRateChange}
						flex={1}
						data={[
							{
								value: '0.5',
								label: t('playbackSpeed', { rate: '0.5' }),
							},
							{
								value: '0.75',
								label: t('playbackSpeed', { rate: '0.75' }),
							},
							{
								value: '1',
								label: t('playbackSpeed', { rate: '1.0' }),
							},
							{
								value: '1.25',
								label: t('playbackSpeed', { rate: '1.25' }),
							},
							{
								value: '1.5',
								label: t('playbackSpeed', { rate: '1.5' }),
							},
							{
								value: '2',
								label: t('playbackSpeed', { rate: '2.0' }),
							},
						]}
						size='xs'
						allowDeselect={false}
					/>
				</Group>
				{conversationId && canExportConversations && (
					<Button
						size='sm'
						fullWidth
						color='blue'
						rightSection={<IconHeadphones size={16} />}
						onClick={handleDownload}
						aria-label={t('player.download')}
						loading={exportAudioMutation.isPending}
						disabled={exportAudioMutation.isPending}
					>
						{t('player.download')}
					</Button>
				)}
			</Stack>
		</RightSectionCard>
	);
};

export default ConversationPlayer;
