import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Group,
	Select,
	Slider,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconHeadphones,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconPlayerTrackNext,
	IconPlayerTrackPrev,
	IconRefresh,
	IconVolume3,
	IconVolumeOff,
	IconWaveSine,
} from '@tabler/icons-react';
import fileApi from '~/api/fileApi';
import RightSection from '~/components/RightSection';
import RightSectionCard from '~/components/RightSectionCard';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type { VoiceFileModel } from '~/models/ConversationsModels';
import {
	useExportConversationAudio,
	useReuploadConversationAudio,
} from '~/queries/conversationsQueries';
import { useTranslation } from 'react-i18next';
import classes from './ConversationPlayer.module.css';

interface ConversationPlayerProps {
	voiceFile?: VoiceFileModel | null;
	voiceFileId?: number | string | null;
	title?: string;
	description?: string;
	paramConversationId?: number | string;
	contactName?: string;
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
type CaptureStreamAudioElement = HTMLAudioElement & {
	captureStream?: () => MediaStream;
	mozCaptureStream?: () => MediaStream;
};

const WAVE_BARS = Array.from({ length: 24 }, (_, index) => `bar-${index}`);
const DEFAULT_LEVEL = 0.2;
const DEFAULT_LEVELS = Array.from(
	{ length: WAVE_BARS.length },
	() => DEFAULT_LEVEL
);

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
	const [hasLoadError, setHasLoadError] = useState(false);
	const [reloadToken, setReloadToken] = useState(0);
	const [waveLevels, setWaveLevels] = useState<number[]>(DEFAULT_LEVELS);
	const [isVisualizerActive, setIsVisualizerActive] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

	const audioRef = useRef<HTMLAudioElement>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const rafIdRef = useRef<number | null>(null);
	const frameCounterRef = useRef(0);
	const isReducedMotionRef = useRef(false);
	const lastVolumeRef = useRef(1);

	const conversationId = paramConversationId;

	const { canPerformAction } = usePermissions();
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);

	const displayTitle = title || t('player.title');
	const displayDescription = description || t('player.description');

	const exportAudioMutation = useExportConversationAudio();
	const reuploadAudioMutation = useReuploadConversationAudio();

	const fileId = voiceFileId ?? voiceFile?.id ?? null;

	const {
		data: presignedUrl,
		isLoading: isPresignedLoading,
		isError: isPresignedError,
		refetch: refetchPresignedUrl,
	} = useQuery({
		queryKey: ['file-presigned-url', fileId],
		queryFn: () => fileApi().getPresignedFileUrl(fileId as number | string),
		enabled: Boolean(fileId),
		staleTime: 0,
	});

	const audioSrc = presignedUrl ?? voiceFile?.repositoryRoute ?? '';
	const shouldShowRetry =
		Boolean(conversationId) &&
		(hasLoadError || (!audioSrc && !isPresignedLoading && !isPresignedError));
	const progressPercent =
		duration > 0
			? Math.max(0, Math.min(100, (currentTime / duration) * 100))
			: 0;

	const stopVisualizerLoop = () => {
		if (rafIdRef.current) {
			window.cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}

		setWaveLevels(DEFAULT_LEVELS);
	};

	const initializeVisualizer = async () => {
		if (!audioRef.current || isReducedMotionRef.current) return false;

		const BrowserAudioContext =
			window.AudioContext || (window as WebkitWindow).webkitAudioContext;

		if (!BrowserAudioContext) return false;

		try {
			if (!audioContextRef.current) {
				audioContextRef.current = new BrowserAudioContext();
			}

			if (audioContextRef.current.state === 'suspended') {
				await audioContextRef.current.resume();
			}

			if (!analyserRef.current) {
				const analyser = audioContextRef.current.createAnalyser();
				analyser.fftSize = 512;
				analyser.smoothingTimeConstant = 0.86;
				analyserRef.current = analyser;
			}

			if (!mediaSourceRef.current) {
				const audioElement = audioRef.current as CaptureStreamAudioElement;
				const stream =
					audioElement.captureStream?.() || audioElement.mozCaptureStream?.();

				if (!stream) {
					setIsVisualizerActive(false);
					return false;
				}

				const source = audioContextRef.current.createMediaStreamSource(stream);
				source.connect(analyserRef.current);
				mediaSourceRef.current = source;
			}

			setIsVisualizerActive(true);
			return true;
		} catch (error) {
			void error;
			setIsVisualizerActive(false);
			return false;
		}
	};

	const startVisualizerLoop = () => {
		if (!analyserRef.current || isReducedMotionRef.current) return;

		const analyser = analyserRef.current;
		const frequencyData = new Uint8Array(analyser.frequencyBinCount);

		const update = () => {
			rafIdRef.current = window.requestAnimationFrame(update);

			if (
				!audioRef.current ||
				audioRef.current.paused ||
				audioRef.current.ended ||
				document.hidden
			) {
				return;
			}

			frameCounterRef.current += 1;
			if (frameCounterRef.current % 2 !== 0) return;

			analyser.getByteFrequencyData(frequencyData);

			const from = 2;
			const to = Math.min(frequencyData.length - 1, 132);
			const bins = to - from;
			if (bins <= 0) return;

			const bucket = Math.max(1, Math.floor(bins / WAVE_BARS.length));

			setWaveLevels((previous) => {
				return previous.map((currentLevel, index) => {
					let sum = 0;
					let count = 0;
					const start = from + index * bucket;
					const end = Math.min(start + bucket, to);

					for (let pointer = start; pointer < end; pointer += 1) {
						sum += frequencyData[pointer];
						count += 1;
					}

					const average = count > 0 ? sum / count : 0;
					const normalized = average / 255;
					const boosted = Math.min(1, Math.pow(normalized, 1.25) * 1.85);
					const floor = 0.12;
					const targetLevel = floor + boosted * 0.88;

					return currentLevel * 0.5 + targetLevel * 0.5;
				});
			});
		};

		stopVisualizerLoop();
		update();
	};

	const handleVolumeChange = (value: number) => {
		setVolume(value);
		if (audioRef.current) {
			audioRef.current.volume = value;
		}
	};

	const togglePlayPause = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
			return;
		}

		initializeVisualizer().finally(() => {
			audioRef.current?.play().catch(() => undefined);
		});
	};

	const handleToggleMute = () => {
		if (isMuted || volume === 0) {
			const nextVolume = Math.max(0.1, lastVolumeRef.current || 1);
			handleVolumeChange(nextVolume);
			setIsMuted(false);
			return;
		}

		lastVolumeRef.current = volume;
		handleVolumeChange(0);
		setIsMuted(true);
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	const handleSeek = (value: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value;
			setCurrentTime(value);
		}
	};

	const jumpToStart = () => {
		handleSeek(0);
	};

	const jumpToEnd = () => {
		handleSeek(duration || 0);
	};

	const handleSeekAndPlay = (seconds: number) => {
		seek(seconds);
		if (!isPlaying) {
			togglePlayPause();
		}
	};

	const handlePlaybackRateChange = (value: string | null) => {
		const rate = parseFloat(value || '1');
		setPlaybackRate(rate);
		if (audioRef.current) {
			audioRef.current.playbackRate = rate;
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			const metadataDuration = Number.isFinite(audioRef.current.duration)
				? audioRef.current.duration
				: 0;
			setDuration(metadataDuration);
			audioRef.current.volume = volume;
			audioRef.current.playbackRate = playbackRate;
		}
		setHasLoadError(false);
	};

	const handleAudioPlay = () => {
		setIsPlaying(true);
		startVisualizerLoop();
	};

	const handleAudioPause = () => {
		setIsPlaying(false);
		stopVisualizerLoop();
	};

	const handleAudioEnded = () => {
		setIsPlaying(false);
		setCurrentTime(duration || 0);
		stopVisualizerLoop();
	};

	const handleCanPlay = () => {
		initializeVisualizer();
	};

	const handleAudioError = () => {
		setHasLoadError(true);
		setIsPlaying(false);
		setIsVisualizerActive(false);
		stopVisualizerLoop();
	};

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

	const formatTime = (timeInSeconds: number) => {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = Math.floor(timeInSeconds % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const formatSpeedLabel = (speed: number) => {
		return speed.toFixed(2).replace(/\.00$/, '.0');
	};

	const getWaveHeight = (index: number) => {
		if (!isVisualizerActive || !isPlaying) return undefined;
		const level = waveLevels[index] ?? DEFAULT_LEVEL;
		const pct = Math.max(12, Math.min(100, Math.round(level * 100)));
		return { height: `${pct}%` };
	};

	const handleDownload = async () => {
		if (!conversationId || !canExportConversations) return;

		try {
			const result = await exportAudioMutation.mutateAsync(conversationId);

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
			void error;
		}
	};

	const handleReuploadAudio = async () => {
		if (!conversationId) return;

		try {
			await reuploadAudioMutation.mutateAsync(conversationId);
			setHasLoadError(false);
			await refetchPresignedUrl();
			setReloadToken((previous) => previous + 1);
		} catch (error) {
			void error;
		}
	};

	useEffect(() => {
		setIsMuted(volume === 0);
		if (volume > 0) {
			lastVolumeRef.current = volume;
		}
	}, [volume]);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		isReducedMotionRef.current = mediaQuery.matches;

		const updateMotionPreference = (event: MediaQueryListEvent) => {
			isReducedMotionRef.current = event.matches;
			if (event.matches) {
				stopVisualizerLoop();
			}
		};

		mediaQuery.addEventListener('change', updateMotionPreference);

		return () => {
			mediaQuery.removeEventListener('change', updateMotionPreference);
		};
	}, []);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				stopVisualizerLoop();
				return;
			}

			if (isPlaying) {
				startVisualizerLoop();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [isPlaying]);

	useEffect(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		setHasLoadError(false);
		setWaveLevels(DEFAULT_LEVELS);

		if (audioRef.current) {
			if (audioSrc) {
				audioRef.current.src = audioSrc;
				audioRef.current.load();
				audioRef.current.volume = volume;
				audioRef.current.playbackRate = playbackRate;
			} else {
				audioRef.current.src = '';
			}
		}

		stopVisualizerLoop();
	}, [audioSrc, conversationId, volume, playbackRate, reloadToken]);

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

	useEffect(() => {
		return () => {
			stopVisualizerLoop();
			mediaSourceRef.current?.disconnect();
			analyserRef.current?.disconnect();
			audioContextRef.current?.close().catch(() => null);
		};
	}, []);

	if (!fileId && !voiceFile?.repositoryRoute) {
		return (
			<Box className={classes.container}>
				<RightSection title={displayTitle} description={displayDescription}>
					<Box className={classes.emptyState}>
						<IconWaveSine size={32} className={classes.emptyIcon} />
						<Text c='dimmed' ta='center' size='sm' mt='xs' mb='md'>
							{t('player.notAvailable')}
						</Text>
						{shouldShowRetry && (
							<Button
								size='xs'
								variant='light'
								leftSection={<IconRefresh size={14} />}
								onClick={handleReuploadAudio}
								loading={reuploadAudioMutation.isPending}
								disabled={reuploadAudioMutation.isPending}
								aria-label={t('player.retryLabel')}
							>
								{t('player.retryLabel')}
							</Button>
						)}
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
			rightSection={
				conversationId && canExportConversations ? (
					<Tooltip label={t('player.download')} withArrow>
						<ActionIcon
							variant='default'
							color='gray'
							size='sm'
							onClick={handleDownload}
							aria-label={t('player.download')}
							loading={exportAudioMutation.isPending}
							disabled={exportAudioMutation.isPending}
							className={classes.headerDownloadButton}
						>
							<IconHeadphones size={15} />
						</ActionIcon>
					</Tooltip>
				) : undefined
			}
		>
			<audio
				ref={audioRef}
				src={audioSrc}
				onCanPlay={handleCanPlay}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onError={handleAudioError}
				onPlay={handleAudioPlay}
				onPause={handleAudioPause}
				onEnded={handleAudioEnded}
				hidden
			/>

			<Stack gap='xs' className={classes.playerRoot}>
				{Boolean(fileId) && (isPresignedLoading || isPresignedError) && (
					<Text
						size='xs'
						c='dimmed'
						ta='left'
						fw={500}
						className={classes.noticeBanner}
					>
						{isPresignedLoading ? t('player.loading') : t('player.error')}
					</Text>
				)}

				{shouldShowRetry && (
					<Group
						justify='space-between'
						align='center'
						className={classes.retryArea}
					>
						<Text size='xs' c='dimmed' fw={500} className={classes.retryText}>
							{t('player.retryHint')}
						</Text>
						<Button
							size='xs'
							variant='default'
							leftSection={<IconRefresh size={14} />}
							onClick={handleReuploadAudio}
							loading={reuploadAudioMutation.isPending}
							disabled={reuploadAudioMutation.isPending}
							aria-label={t('player.retryLabel')}
						>
							{t('player.retryLabel')}
						</Button>
					</Group>
				)}

				<Box
					className={classes.playerShell}
					data-playing={isPlaying ? 'true' : 'false'}
				>
					<Box className={classes.playerStage}>
						<Group
							justify='space-between'
							align='center'
							className={classes.stageMetaRow}
						>
							<Group gap={8} align='center' className={classes.stageStatus}>
								<Box
									className={classes.playIndicator}
									data-playing={isPlaying ? 'true' : 'false'}
								/>
								<Text size='xs' fw={700} className={classes.statusLabel}>
									{isPlaying ? t('player.pause') : t('player.play')}
								</Text>
							</Group>
							<Group gap={6} align='center' className={classes.headerMeta}>
								<Text size='xs' className={classes.headerTime}>
									{formatTime(currentTime)}
								</Text>
								<Text size='xs' c='dimmed' className={classes.headerDivider}>
									/
								</Text>
								<Text size='xs' className={classes.headerTime}>
									{formatTime(duration)}
								</Text>
								<Badge
									variant='default'
									size='xs'
									className={classes.speedBadge}
								>
									{t('playbackSpeed', { rate: formatSpeedLabel(playbackRate) })}
								</Badge>
							</Group>
						</Group>

						<Box className={classes.stageWaveformWrap}>
							<Box
								className={classes.waveform}
								data-playing={isPlaying ? 'true' : 'false'}
								data-live={isVisualizerActive ? 'true' : 'false'}
							>
								{WAVE_BARS.map((barKey, index) => (
									<Box
										key={barKey}
										className={classes.waveBar}
										style={getWaveHeight(index)}
									/>
								))}
							</Box>
							<ActionIcon
								variant='filled'
								color='dark'
								radius='md'
								size='xl'
								onClick={togglePlayPause}
								aria-label={isPlaying ? t('player.pause') : t('player.play')}
								aria-pressed={isPlaying}
								className={classes.stagePlayButton}
							>
								{isPlaying ? (
									<IconPlayerPause size={20} />
								) : (
									<IconPlayerPlay size={20} className={classes.playIcon} />
								)}
							</ActionIcon>
						</Box>

						<Box className={classes.stageTimeline}>
							<Slider
								value={currentTime}
								onChange={handleSeek}
								max={duration || 100}
								label={(value) => formatTime(Number(value))}
								className={classes.progressSlider}
								classNames={{
									track: classes.sliderTrack,
									bar: classes.sliderBar,
									thumb: classes.sliderThumb,
								}}
							/>
							<Box
								className={classes.timelineProgress}
								style={{ width: `${progressPercent}%` }}
								aria-hidden='true'
							/>
						</Box>
					</Box>

					<Box className={classes.playerFooter}>
						<Group justify='center' gap='xs' className={classes.transportBar}>
							<Group gap={6} align='center' className={classes.transportGroup}>
								<ActionIcon
									variant='default'
									color='gray'
									size='md'
									onClick={jumpToStart}
									aria-label={t('player.rewind')}
									className={classes.controlButton}
									disabled={!duration}
								>
									<IconPlayerTrackPrev size={15} />
								</ActionIcon>

								<ActionIcon
									variant='default'
									color='gray'
									size='md'
									onClick={() => handleSeekAndPlay(-10)}
									aria-label={t('player.rewind')}
									title={t('player.rewindShort')}
									className={classes.controlButton}
								>
									<IconPlayerSkipBack size={17} />
								</ActionIcon>

								<ActionIcon
									variant='default'
									color='gray'
									size='md'
									onClick={() => handleSeekAndPlay(10)}
									aria-label={t('player.forward')}
									title={t('player.forwardShort')}
									className={classes.controlButton}
								>
									<IconPlayerSkipForward size={17} />
								</ActionIcon>

								<ActionIcon
									variant='default'
									color='gray'
									size='md'
									onClick={jumpToEnd}
									aria-label={t('player.forward')}
									className={classes.controlButton}
									disabled={!duration}
								>
									<IconPlayerTrackNext size={15} />
								</ActionIcon>
							</Group>
						</Group>

						<Group gap='xs' align='stretch' className={classes.utilityRail}>
							<Group gap={6} align='center' className={classes.volumeGroup}>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={handleToggleMute}
									className={classes.muteButton}
									aria-label={isMuted ? t('player.unmute') : t('player.mute')}
									aria-pressed={isMuted}
								>
									{isMuted ? (
										<IconVolumeOff size={15} className={classes.volumeIcon} />
									) : (
										<IconVolume3 size={15} className={classes.volumeIcon} />
									)}
								</ActionIcon>

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

								<Text size='xs' className={classes.volumeValue}>
									{Math.round(volume * 100)}%
								</Text>
							</Group>

							<Select
								value={playbackRate.toString()}
								onChange={handlePlaybackRateChange}
								flex={1}
								data={[
									{ value: '0.5', label: t('playbackSpeed', { rate: '0.5' }) },
									{
										value: '0.75',
										label: t('playbackSpeed', { rate: '0.75' }),
									},
									{ value: '1', label: t('playbackSpeed', { rate: '1.0' }) },
									{
										value: '1.25',
										label: t('playbackSpeed', { rate: '1.25' }),
									},
									{ value: '1.5', label: t('playbackSpeed', { rate: '1.5' }) },
									{ value: '2', label: t('playbackSpeed', { rate: '2.0' }) },
								]}
								size='xs'
								allowDeselect={false}
								className={classes.speedSelect}
								classNames={{
									input: classes.speedSelectInput,
									dropdown: classes.speedSelectDropdown,
									option: classes.speedSelectOption,
								}}
								maxDropdownHeight={220}
								checkIconPosition='right'
							/>
						</Group>
					</Box>
				</Box>
			</Stack>
		</RightSectionCard>
	);
};

export default ConversationPlayer;
