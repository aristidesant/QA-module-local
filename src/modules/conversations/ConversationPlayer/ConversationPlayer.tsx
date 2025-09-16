import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	ActionIcon,
	Group,
	Slider,
	Stack,
	Text,
	Box,
	Paper,
	Tooltip,
} from '@mantine/core';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconVolume,
	IconDownload,
} from '@tabler/icons-react';
import type { VoiceFileModel } from '~/models/ConversationsModels';
import fileApi from '~/api/fileApi';
import { useExportConversationAudio } from '~/queries/conversationsQueries';
import classes from './ConversationPlayer.module.css';
import RightSection from '~/components/RightSection';
import { useConversationStore } from '~/stores/useConversationStore';

interface ConversationPlayerProps {
	voiceFile?: VoiceFileModel | null;
	voiceFileId?: number | string | null;
	title?: string;
	description?: string;
}
//IconDeviceAudioTape
const ConversationPlayer: React.FC<ConversationPlayerProps> = ({
	voiceFile,
	voiceFileId,
	title = 'Recording',
	description,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	const conversationId = useConversationStore((state) => state.selectedId);

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

	// Handle audio loaded metadata
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
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
		if (!conversationId) return;

		try {
			const result = await exportAudioMutation.mutateAsync(conversationId);

			// Create download link
			const url = URL.createObjectURL(result.blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = result.filename;
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
		}
	}, [audioSrc]);

	// No valid voice file
	if (!fileId && !voiceFile?.repositoryRoute) {
		return (
			<Paper className={classes.container} radius='md'>
				<RightSection title={title} description={description}>
					<Box className={classes.emptyState}>
						<IconVolume size={32} className={classes.emptyIcon} />
						<Text c='dimmed' ta='center' size='sm' mt='xs'>
							Conversation not available
						</Text>
					</Box>
				</RightSection>
			</Paper>
		);
	}

	return (
		<Paper className={classes.container} radius='md'>
			<RightSection
				title={title}
				description={
					<Group justify='space-between' align='center'>
						{description && (
							<Text size='xs' c='dimmed'>
								{description}
							</Text>
						)}
						{conversationId && (
							<Tooltip label='Download conversation audio' position='bottom'>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={handleDownload}
									aria-label='Download audio'
									loading={exportAudioMutation.isPending}
									disabled={exportAudioMutation.isPending}
								>
									<IconDownload size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				}
			>
				<audio
					ref={audioRef}
					src={audioSrc}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={() => setIsPlaying(false)}
					hidden
				/>

				<Stack gap='md'>
					{Boolean(fileId) && (isPresignedLoading || isPresignedError) && (
						<Text size='xs' c='dimmed'>
							{isPresignedLoading ? 'Loading audio…' : 'Could not load audio.'}
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
						<Group justify='space-between' mt='xs'>
							<Text size='xs' c='dimmed' className={classes.timeText}>
								{formatTime(currentTime)}
							</Text>
							<Text size='xs' c='dimmed' className={classes.timeText}>
								{formatTime(duration)}
							</Text>
						</Group>
					</Box>

					{/* Controls */}
					<Group justify='center' gap='md' className={classes.controlsGroup}>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='lg'
							onClick={() => seek(-10)}
							aria-label='Rewind 10 seconds'
							title='Rewind 10s'
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
							aria-label={isPlaying ? 'Pause' : 'Play'}
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
							aria-label='Forward 10 seconds'
							title='Forward 10s'
							className={classes.controlButton}
						>
							<IconPlayerSkipForward size={20} />
						</ActionIcon>
					</Group>
				</Stack>
			</RightSection>
		</Paper>
	);
};

export default ConversationPlayer;
