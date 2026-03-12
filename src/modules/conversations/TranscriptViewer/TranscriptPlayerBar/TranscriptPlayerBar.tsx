import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionIcon, Box, Group, Slider, Text, Tooltip } from '@mantine/core';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
} from '@tabler/icons-react';
import fileApi from '~/api/fileApi';
import type { VoiceFileModel } from '~/models/ConversationsModels';
import { useTranslation } from 'react-i18next';
import styles from './TranscriptPlayerBar.module.css';

export interface TranscriptPlayerBarProps {
	voiceFile?: VoiceFileModel | null;
	onTimeUpdate?: (currentTime: number) => void;
	onPlayStateChange?: (isPlaying: boolean) => void;
	seekToRef?: React.MutableRefObject<((time: number) => void) | null>;
}

export function TranscriptPlayerBar({
	voiceFile,
	onTimeUpdate,
	onPlayStateChange,
	seekToRef,
}: TranscriptPlayerBarProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [hasLoadError, setHasLoadError] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	const pendingSeekRef = useRef<number | null>(null);
	const pendingPlayAfterSeekRef = useRef(false);

	const fileId = voiceFile?.id ?? null;

	const { data: presignedUrl, isLoading: isPresignedLoading } = useQuery({
		queryKey: ['file-presigned-url', fileId],
		queryFn: () => fileApi().getPresignedFileUrl(fileId as number | string),
		enabled: Boolean(fileId),
		staleTime: 0,
	});

	const audioSrc = presignedUrl ?? voiceFile?.repositoryRoute ?? '';

	const togglePlayPause = useCallback(() => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play().catch((error) => {
				console.error('Error playing audio:', error);
			});
		}
	}, [isPlaying]);

	const seekTo = useCallback(
		(time: number) => {
			if (!audioRef.current) return;
			const audioDuration = audioRef.current.duration;
			// If metadata hasn't loaded yet, store a pending seek
			if (!Number.isFinite(audioDuration) || audioDuration === 0) {
				pendingSeekRef.current = time;
				setCurrentTime(time);
				onTimeUpdate?.(time);
				return;
			}
			const clampedTime = Math.max(0, Math.min(time, audioDuration));
			audioRef.current.currentTime = clampedTime;
			setCurrentTime(clampedTime);
			onTimeUpdate?.(clampedTime);
		},
		[onTimeUpdate]
	);

	const seekRelative = useCallback(
		(delta: number) => {
			if (!audioRef.current) return;
			const audioDuration = audioRef.current.duration || 0;
			const newTime = Math.max(
				0,
				Math.min(audioRef.current.currentTime + delta, audioDuration)
			);
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
			onTimeUpdate?.(newTime);
		},
		[onTimeUpdate]
	);

	const handleSeek = useCallback(
		(value: number) => {
			if (audioRef.current) {
				audioRef.current.currentTime = value;
				setCurrentTime(value);
				onTimeUpdate?.(value);
			}
		},
		[onTimeUpdate]
	);

	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current) {
			const time = audioRef.current.currentTime;
			setCurrentTime(time);
			onTimeUpdate?.(time);
		}
	}, [onTimeUpdate]);

	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			const d = Number.isFinite(audioRef.current.duration)
				? audioRef.current.duration
				: 0;
			setDuration(d);

			// Apply pending seek that was requested before metadata was ready
			if (pendingSeekRef.current !== null) {
				const pendingTime = Math.max(0, Math.min(pendingSeekRef.current, d));
				audioRef.current.currentTime = pendingTime;
				setCurrentTime(pendingTime);
				onTimeUpdate?.(pendingTime);
				pendingSeekRef.current = null;

				if (pendingPlayAfterSeekRef.current) {
					pendingPlayAfterSeekRef.current = false;
					audioRef.current.play().catch(console.error);
				}
			}
		}
		setHasLoadError(false);
	}, [onTimeUpdate]);

	const handleAudioPlay = useCallback(() => {
		setIsPlaying(true);
		onPlayStateChange?.(true);
	}, [onPlayStateChange]);

	const handleAudioPause = useCallback(() => {
		setIsPlaying(false);
		onPlayStateChange?.(false);
	}, [onPlayStateChange]);

	const handleAudioEnded = useCallback(() => {
		setIsPlaying(false);
		onPlayStateChange?.(false);
		if (audioRef.current) {
			setCurrentTime(audioRef.current.duration || 0);
		}
	}, [onPlayStateChange]);

	const handleAudioError = useCallback(() => {
		setHasLoadError(true);
		setIsPlaying(false);
		onPlayStateChange?.(false);
	}, [onPlayStateChange]);

	// Expose seekTo via ref for parent click-to-seek
	useEffect(() => {
		if (seekToRef) {
			seekToRef.current = (time: number) => {
				const audio = audioRef.current;
				if (!audio) return;

				const audioDuration = audio.duration;
				// If audio metadata isn't loaded yet, store pending seek + play
				if (!Number.isFinite(audioDuration) || audioDuration === 0) {
					pendingSeekRef.current = time;
					pendingPlayAfterSeekRef.current = true;
					setCurrentTime(time);
					onTimeUpdate?.(time);
					return;
				}

				const clampedTime = Math.max(0, Math.min(time, audioDuration));
				audio.currentTime = clampedTime;
				setCurrentTime(clampedTime);
				onTimeUpdate?.(clampedTime);

				// Wait for the seek to complete before playing to avoid delay
				const onSeeked = () => {
					audio.removeEventListener('seeked', onSeeked);
					audio.play().catch(console.error);
				};
				// If already at that position, play immediately
				if (!audio.seeking) {
					audio.play().catch(console.error);
				} else {
					audio.addEventListener('seeked', onSeeked, { once: true });
				}
			};
		}
	}, [seekToRef, seekTo, onTimeUpdate]);

	// Reset state when audio source changes
	useEffect(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		setHasLoadError(false);
		pendingSeekRef.current = null;
		pendingPlayAfterSeekRef.current = false;

		if (audioRef.current) {
			if (audioSrc) {
				audioRef.current.src = audioSrc;
				audioRef.current.load();
			} else {
				audioRef.current.src = '';
			}
		}
	}, [audioSrc]);

	const formatTime = (s: number) => {
		const mins = Math.floor(s / 60);
		const secs = Math.floor(s % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (!fileId && !voiceFile?.repositoryRoute) {
		return null;
	}

	if (isPresignedLoading) {
		return (
			<Box className={styles.playerBar}>
				<Text size='xs' c='dimmed' ta='center'>
					{t('player.loading')}
				</Text>
			</Box>
		);
	}

	if (hasLoadError) {
		return (
			<Box className={styles.playerBar}>
				<Text size='xs' c='dimmed' ta='center'>
					{t('player.error')}
				</Text>
			</Box>
		);
	}

	return (
		<Box className={styles.playerBar}>
			<audio
				ref={audioRef}
				src={audioSrc}
				preload='auto'
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onError={handleAudioError}
				onPlay={handleAudioPlay}
				onPause={handleAudioPause}
				onEnded={handleAudioEnded}
				hidden
			/>

			<Group gap='xs' align='center' wrap='nowrap' className={styles.controls}>
				<Tooltip label={t('player.rewindShort')} position='top'>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='sm'
						onClick={() => seekRelative(-10)}
						aria-label={t('player.rewind')}
					>
						<IconPlayerSkipBack size={16} />
					</ActionIcon>
				</Tooltip>

				<ActionIcon
					variant='filled'
					size='md'
					radius='xl'
					onClick={togglePlayPause}
					aria-label={isPlaying ? t('player.pause') : t('player.play')}
					className={styles.playButton}
				>
					{isPlaying ? (
						<IconPlayerPause size={16} />
					) : (
						<IconPlayerPlay size={16} style={{ marginLeft: 1 }} />
					)}
				</ActionIcon>

				<Tooltip label={t('player.forwardShort')} position='top'>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='sm'
						onClick={() => seekRelative(10)}
						aria-label={t('player.forward')}
					>
						<IconPlayerSkipForward size={16} />
					</ActionIcon>
				</Tooltip>

				<Text size='xs' c='dimmed' className={styles.time}>
					{formatTime(currentTime)}
				</Text>

				<Slider
					value={currentTime}
					onChange={handleSeek}
					max={duration || 100}
					label={(value) => formatTime(Number(value))}
					className={styles.progressSlider}
					classNames={{
						track: styles.sliderTrack,
						bar: styles.sliderBar,
						thumb: styles.sliderThumb,
					}}
				/>

				<Text size='xs' c='dimmed' className={styles.time}>
					{formatTime(duration)}
				</Text>
			</Group>
		</Box>
	);
}

export default TranscriptPlayerBar;
