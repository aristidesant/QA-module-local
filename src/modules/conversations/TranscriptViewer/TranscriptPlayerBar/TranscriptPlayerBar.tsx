import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	ActionIcon,
	Box,
	Button,
	Group,
	Popover,
	Select,
	Slider,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconDownload,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconRefresh,
	IconVolume,
	IconVolumeOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import fileApi from '~/api/fileApi';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type { VoiceFileModel } from '~/models/ConversationsModels';
import {
	useExportConversationAudio,
	useReuploadConversationAudio,
} from '~/queries/conversationsQueries';
import styles from './TranscriptPlayerBar.module.css';

export interface TranscriptPlayerBarProps {
	voiceFile?: VoiceFileModel | null;
	conversationId?: number | string;
	contactName?: string;
	onTimeUpdate?: (currentTime: number) => void;
	onPlayStateChange?: (isPlaying: boolean) => void;
	seekToRef?: React.MutableRefObject<((time: number) => void) | null>;
}

const SPEED_OPTIONS = ['0.75', '1', '1.25', '1.5', '2'].map((value) => ({
	value,
	label: `${Number(value)
		.toFixed(value === '1' ? 1 : 2)
		.replace(/0$/, '')}×`,
}));

export function TranscriptPlayerBar({
	voiceFile,
	conversationId,
	contactName,
	onTimeUpdate,
	onPlayStateChange,
	seekToRef,
}: TranscriptPlayerBarProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [playbackRate, setPlaybackRate] = useState('1');
	const [hasLoadError, setHasLoadError] = useState(false);
	const [reloadToken, setReloadToken] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	const pendingSeekRef = useRef<number | null>(null);
	const pendingPlayAfterSeekRef = useRef(false);
	const lastVolumeRef = useRef(1);

	const fileId = voiceFile?.id ?? null;
	const { canPerformAction } = usePermissions();
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);
	const exportAudioMutation = useExportConversationAudio();
	const reuploadAudioMutation = useReuploadConversationAudio();

	const {
		data: presignedUrl,
		isLoading: isPresignedLoading,
		isError: isPresignedError,
		refetch: refetchPresignedUrl,
	} = useQuery({
		queryKey: ['file-presigned-url', fileId, reloadToken],
		queryFn: () => fileApi().getPresignedFileUrl(fileId as number | string),
		enabled: Boolean(fileId),
		staleTime: 0,
	});

	const audioSrc = presignedUrl ?? voiceFile?.repositoryRoute ?? '';
	const isUnavailable =
		hasLoadError || isPresignedError || (!audioSrc && !isPresignedLoading);

	const updateCurrentTime = useCallback(
		(time: number) => {
			setCurrentTime(time);
			onTimeUpdate?.(time);
		},
		[onTimeUpdate]
	);

	const seekTo = useCallback(
		(time: number, playAfterSeek = false) => {
			const audio = audioRef.current;
			if (!audio) return;

			const audioDuration = audio.duration;
			if (!Number.isFinite(audioDuration) || audioDuration === 0) {
				pendingSeekRef.current = time;
				pendingPlayAfterSeekRef.current = playAfterSeek;
				updateCurrentTime(time);
				return;
			}

			const clampedTime = Math.max(0, Math.min(time, audioDuration));
			audio.currentTime = clampedTime;
			updateCurrentTime(clampedTime);
			if (playAfterSeek) {
				audio.play().catch(() => undefined);
			}
		},
		[updateCurrentTime]
	);

	const seekRelative = useCallback(
		(delta: number) => {
			const audio = audioRef.current;
			if (!audio) return;
			seekTo(audio.currentTime + delta);
		},
		[seekTo]
	);

	const togglePlayPause = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			audio.play().catch(() => undefined);
		} else {
			audio.pause();
		}
	}, []);

	const handleLoadedMetadata = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
		setDuration(nextDuration);
		audio.volume = volume;
		audio.playbackRate = Number(playbackRate);
		setHasLoadError(false);

		if (pendingSeekRef.current !== null) {
			const pendingTime = pendingSeekRef.current;
			const shouldPlay = pendingPlayAfterSeekRef.current;
			pendingSeekRef.current = null;
			pendingPlayAfterSeekRef.current = false;
			seekTo(pendingTime, shouldPlay);
		}
	}, [playbackRate, seekTo, volume]);

	const handleVolumeChange = (value: number) => {
		setVolume(value);
		if (value > 0) lastVolumeRef.current = value;
		if (audioRef.current) audioRef.current.volume = value;
	};

	const toggleMute = () => {
		handleVolumeChange(volume === 0 ? lastVolumeRef.current : 0);
	};

	const handlePlaybackRateChange = (value: string | null) => {
		const nextRate = value ?? '1';
		setPlaybackRate(nextRate);
		if (audioRef.current) audioRef.current.playbackRate = Number(nextRate);
	};

	const handleDownload = async () => {
		if (!conversationId || !canExportConversations) return;
		try {
			const result = await exportAudioMutation.mutateAsync(conversationId);
			const url = URL.createObjectURL(result.blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = contactName
				? `${contactName.toUpperCase()}.MP3`
				: `conversation-${conversationId}.mp3`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch {
			// The compact player remains in its current state when an export fails.
		}
	};

	const handleRetry = async () => {
		if (!conversationId) return;
		try {
			await reuploadAudioMutation.mutateAsync(conversationId);
			setHasLoadError(false);
			setReloadToken((value) => value + 1);
			await refetchPresignedUrl();
		} catch {
			setHasLoadError(true);
		}
	};

	useEffect(() => {
		if (seekToRef) {
			seekToRef.current = (time: number) => seekTo(time, true);
		}
		return () => {
			if (seekToRef) seekToRef.current = null;
		};
	}, [seekTo, seekToRef]);

	useEffect(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		setHasLoadError(false);
		pendingSeekRef.current = null;
		pendingPlayAfterSeekRef.current = false;
	}, [audioSrc]);

	const formatTime = (seconds: number) => {
		const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
		const minutes = Math.floor(safeSeconds / 60);
		const remainder = Math.floor(safeSeconds % 60);
		return `${minutes}:${remainder.toString().padStart(2, '0')}`;
	};

	if (isPresignedLoading) {
		return (
			<Box className={styles.playerBar} aria-live='polite'>
				<div className={styles.statusPlayer}>
					<Text size='sm'>{t('player.loading')}</Text>
				</div>
			</Box>
		);
	}

	if (isUnavailable) {
		return (
			<Box className={styles.playerBar} aria-live='polite'>
				<div className={styles.statusPlayer}>
					<Text size='sm' className={styles.statusText}>
						{hasLoadError || isPresignedError
							? t('player.error')
							: t('player.notAvailable')}
					</Text>
					{conversationId && (
						<Button
							size='xs'
							variant='default'
							leftSection={<IconRefresh size={14} />}
							onClick={handleRetry}
							loading={reuploadAudioMutation.isPending}
						>
							{t('player.retryLabel')}
						</Button>
					)}
				</div>
			</Box>
		);
	}

	return (
		<Box className={styles.playerBar}>
			<audio
				ref={audioRef}
				src={audioSrc}
				preload='metadata'
				onTimeUpdate={() =>
					updateCurrentTime(audioRef.current?.currentTime ?? 0)
				}
				onLoadedMetadata={handleLoadedMetadata}
				onError={() => setHasLoadError(true)}
				onPlay={() => {
					setIsPlaying(true);
					onPlayStateChange?.(true);
				}}
				onPause={() => {
					setIsPlaying(false);
					onPlayStateChange?.(false);
				}}
				onEnded={() => {
					setIsPlaying(false);
					onPlayStateChange?.(false);
					updateCurrentTime(duration);
				}}
				hidden
			/>

			<div className={styles.controls}>
				<Group gap={4} wrap='nowrap' className={styles.transportControls}>
					<Tooltip label={t('player.rewindShort')}>
						<ActionIcon
							variant='subtle'
							size='md'
							onClick={() => seekRelative(-10)}
							aria-label={t('player.rewind')}
							className={styles.controlButton}
						>
							<IconPlayerSkipBack size={17} />
						</ActionIcon>
					</Tooltip>
					<ActionIcon
						variant='filled'
						size='lg'
						onClick={togglePlayPause}
						aria-label={isPlaying ? t('player.pause') : t('player.play')}
						aria-pressed={isPlaying}
						className={styles.playButton}
					>
						{isPlaying ? (
							<IconPlayerPause size={18} />
						) : (
							<IconPlayerPlay size={18} className={styles.playIcon} />
						)}
					</ActionIcon>
					<Tooltip label={t('player.forwardShort')}>
						<ActionIcon
							variant='subtle'
							size='md'
							onClick={() => seekRelative(10)}
							aria-label={t('player.forward')}
							className={styles.controlButton}
						>
							<IconPlayerSkipForward size={17} />
						</ActionIcon>
					</Tooltip>
				</Group>

				<div className={styles.timelineGroup}>
					<Slider
						value={currentTime}
						onChange={(value) => seekTo(value)}
						max={duration || 100}
						label={(value) => formatTime(Number(value))}
						className={styles.progressSlider}
						classNames={{
							track: styles.sliderTrack,
							bar: styles.sliderBar,
							thumb: styles.sliderThumb,
						}}
					/>
					<Text className={styles.time}>
						{formatTime(currentTime)} / {formatTime(duration)}
					</Text>
				</div>

				<Group gap={6} wrap='nowrap' className={styles.utilityControls}>
					<Select
						value={playbackRate}
						onChange={handlePlaybackRateChange}
						data={SPEED_OPTIONS}
						allowDeselect={false}
						aria-label={t('player.speed')}
						classNames={{ input: styles.speedInput }}
						className={styles.speedSelect}
					/>
					<Popover width={220} position='bottom-end' withArrow shadow='md'>
						<Popover.Target>
							<ActionIcon
								variant='subtle'
								size='md'
								aria-label={t('player.volume')}
								className={styles.controlButton}
							>
								{volume === 0 ? (
									<IconVolumeOff size={18} />
								) : (
									<IconVolume size={18} />
								)}
							</ActionIcon>
						</Popover.Target>
						<Popover.Dropdown className={styles.volumePopover}>
							<Group gap='xs' wrap='nowrap'>
								<ActionIcon
									variant='subtle'
									onClick={toggleMute}
									aria-label={
										volume === 0 ? t('player.unmute') : t('player.mute')
									}
								>
									{volume === 0 ? (
										<IconVolumeOff size={18} />
									) : (
										<IconVolume size={18} />
									)}
								</ActionIcon>
								<div className={styles.volumeControl}>
									<Text size='xs' fw={600} mb={4}>
										{t('player.volume')}
									</Text>
									<Slider
										value={volume}
										onChange={handleVolumeChange}
										min={0}
										max={1}
										step={0.05}
										label={(value) => `${Math.round(value * 100)}%`}
									/>
								</div>
							</Group>
						</Popover.Dropdown>
					</Popover>
					{canExportConversations && conversationId && (
						<Tooltip label={t('player.download')}>
							<ActionIcon
								variant='subtle'
								size='md'
								onClick={handleDownload}
								loading={exportAudioMutation.isPending}
								aria-label={t('player.download')}
								className={styles.controlButton}
							>
								<IconDownload size={18} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</div>
		</Box>
	);
}

export default TranscriptPlayerBar;
