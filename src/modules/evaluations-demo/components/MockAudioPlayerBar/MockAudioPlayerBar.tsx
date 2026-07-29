import React from 'react';
import { ActionIcon, Group, Slider, Text, Tooltip } from '@mantine/core';
import {
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconVolume,
} from '@tabler/icons-react';
import styles from './MockAudioPlayerBar.module.css';

function formatTime(seconds: number) {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MockAudioPlayerBarProps {
	durationSeconds: number;
}

const MockAudioPlayerBar: React.FC<MockAudioPlayerBarProps> = ({
	durationSeconds,
}) => {
	return (
		<div className={styles.bar}>
			<div className={styles.seekRow}>
				<Text className={styles.time}>{formatTime(0)}</Text>
				<Slider
					className={styles.slider}
					size='sm'
					color='green'
					min={0}
					max={durationSeconds}
					defaultValue={0}
					label={null}
				/>
				<Text className={styles.time}>{formatTime(durationSeconds)}</Text>
			</div>

			<div className={styles.controlsRow}>
				<div className={styles.transport}>
					<Tooltip label='Back 10s' withArrow>
						<ActionIcon variant='subtle' color='gray' aria-label='Back 10 seconds'>
							<IconPlayerSkipBack size={16} />
						</ActionIcon>
					</Tooltip>
					<ActionIcon
						variant='filled'
						color='green'
						radius='xl'
						size='lg'
						aria-label='Play'
					>
						<IconPlayerPlay size={18} />
					</ActionIcon>
					<Tooltip label='Forward 10s' withArrow>
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label='Forward 10 seconds'
						>
							<IconPlayerSkipForward size={16} />
						</ActionIcon>
					</Tooltip>
				</div>

				<div className={styles.rightControls}>
					<Group gap={6} wrap='nowrap'>
						<IconVolume size={16} color='var(--mantine-color-dimmed)' />
						<Slider
							className={styles.volumeSlider}
							size='xs'
							color='green'
							defaultValue={70}
							label={null}
						/>
					</Group>
					<Tooltip label='Playback speed' withArrow>
						<span className={styles.speedChip}>1x</span>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default MockAudioPlayerBar;
