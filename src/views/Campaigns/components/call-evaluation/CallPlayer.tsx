import {
	Badge,
	Button,
	Card,
	Group,
	Slider,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconVolume2,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CallMoment } from '../../types';
import { formatDuration } from './scoreColor';
import styles from './CallPlayer.module.css';

interface CallPlayerProps {
	durationSeconds: number;
	currentTime: number;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onSeek: (seconds: number) => void;
	moments: CallMoment[];
	activeMomentId: string | null;
	onMomentClick: (moment: CallMoment) => void;
}

/** Simulated recording player: a playhead, and one marker per QA moment on the timeline. */
export function CallPlayer({
	durationSeconds,
	currentTime,
	isPlaying,
	onTogglePlay,
	onSeek,
	moments,
	activeMomentId,
	onMomentClick,
}: CallPlayerProps) {
	const { t } = useTranslation('qa.calls');

	return (
		<Card padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Text fw={600} size='sm'>
						{t('moments.player.title')}
					</Text>
					<Badge size='sm' variant='light'>
						{formatDuration(durationSeconds)}
					</Badge>
				</Group>

				<Group gap='sm' wrap='nowrap' className={styles.controls}>
					<Button
						variant='light'
						size='sm'
						onClick={onTogglePlay}
						leftSection={
							isPlaying ? (
								<IconPlayerPause size={16} />
							) : (
								<IconPlayerPlay size={16} />
							)
						}
					>
						{isPlaying ? t('moments.player.pause') : t('moments.player.play')}
					</Button>
					<div className={styles.timeline}>
						<div className={styles.markerRail}>
							{moments.map((m) => (
								<Tooltip
									key={m.id}
									label={t('moments.player.marker', {
										time: m.timestamp,
										item: m.itemName,
									})}
									withArrow
								>
									<UnstyledButton
										className={styles.marker}
										data-status={m.status}
										data-active={m.id === activeMomentId || undefined}
										// inline-style-allow: the marker position is a runtime percentage of the call length
										style={{
											left: `${(m.seconds / durationSeconds) * 100}%`,
										}}
										onClick={() => onMomentClick(m)}
										aria-label={t('moments.jumpTo', { time: m.timestamp })}
									/>
								</Tooltip>
							))}
						</div>
						<Slider
							size='sm'
							value={currentTime}
							min={0}
							max={durationSeconds}
							step={1}
							onChange={onSeek}
							label={(v) => formatDuration(Math.floor(v))}
						/>
					</div>
					<Text size='xs' c='dimmed' className={styles.time}>
						{formatDuration(Math.floor(currentTime))} /{' '}
						{formatDuration(durationSeconds)}
					</Text>
				</Group>

				<Group gap='xs'>
					<IconVolume2 size={18} color='var(--mantine-color-dimmed)' />
					<div className={styles.volumeTrack}>
						<div className={styles.volumeFill} />
					</div>
				</Group>
			</Stack>
		</Card>
	);
}
