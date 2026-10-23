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
	IconVolumeOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TimelineAnchor } from '../../types';
import { groupBySecond } from './anchors';
import { formatDuration } from './scoreColor';
import styles from './CallPlayer.module.css';

interface CallPlayerProps {
	durationSeconds: number;
	currentTime: number;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onSeek: (seconds: number) => void;
	anchors: TimelineAnchor[];
	activeAnchorId: string | null;
	onAnchorClick: (anchor: TimelineAnchor) => void;
	/** Stretches of the recording muted because sensitive data is said there. */
	mutedSpans?: { seconds: number; label: string }[];
}

/** Simulated recording player: a playhead, and one marker per anchored moment of the open tab on the timeline. */
export function CallPlayer({
	durationSeconds,
	currentTime,
	isPlaying,
	onTogglePlay,
	onSeek,
	anchors,
	activeAnchorId,
	onAnchorClick,
	mutedSpans = [],
}: CallPlayerProps) {
	const { t } = useTranslation('qa.calls');

	return (
		<Card padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Text fw={600} size='sm'>
						{t('moments.player.title')}
					</Text>
					<Group gap='xs'>
						{mutedSpans.length > 0 && (
							<Badge
								size='sm'
								variant='light'
								color='gray'
								leftSection={<IconVolumeOff size={12} />}
							>
								{t('privacy.muted', { count: mutedSpans.length })}
							</Badge>
						)}
						<Badge size='sm' variant='light'>
							{formatDuration(durationSeconds)}
						</Badge>
					</Group>
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
							{groupBySecond(anchors).map(({ seconds, items }) => {
								const first = items[0];
								const needsAttention = items.some(
									(a) => a.status === 'alert' || a.status === 'confirmed'
								);
								const allDismissed = items.every(
									(a) => a.status === 'dismissed'
								);
								return (
									<Tooltip
										key={seconds}
										label={
											<Stack gap={2}>
												{items.map((a) => (
													<Text key={a.id} size='xs'>
														{t('moments.player.marker', {
															time: a.timestamp,
															item: a.label,
														})}
													</Text>
												))}
											</Stack>
										}
										withArrow
									>
										<UnstyledButton
											className={styles.marker}
											data-status={
												needsAttention
													? 'alert'
													: allDismissed
														? 'dismissed'
														: 'pending'
											}
											data-active={
												items.some((a) => a.id === activeAnchorId) || undefined
											}
											// inline-style-allow: the marker position is a runtime percentage of the call length
											style={{
												left: `${(seconds / durationSeconds) * 100}%`,
											}}
											onClick={() =>
												onAnchorClick(
													items.find((a) => a.id === activeAnchorId) ?? first
												)
											}
											aria-label={t('moments.jumpTo', {
												time: first.timestamp,
											})}
										/>
									</Tooltip>
								);
							})}
							{mutedSpans.map((span) => (
								<Tooltip
									key={span.seconds}
									label={t('privacy.mutedAt', { label: span.label })}
									withArrow
								>
									<span
										className={styles.mute}
										// inline-style-allow: the muted block position is a runtime percentage of the call length
										style={{
											left: `${(span.seconds / durationSeconds) * 100}%`,
										}}
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
