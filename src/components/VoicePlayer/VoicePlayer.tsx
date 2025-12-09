import { Box, Group, Text, Stack, Button } from '@mantine/core';
import {
	IconWaveSquare,
	IconPlayerPlay,
	IconPlayerPause,
} from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import styles from './VoicePlayer.module.css';

type VoicePlayerProps = {
	voiceName: string;
	previewUrl?: string;
};

const VoicePlayer: React.FC<VoicePlayerProps> = ({ voiceName, previewUrl }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Reset audio and state when previewUrl changes
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}
		setIsPlaying(false);
		setIsLoading(false);
	}, [previewUrl]);

	const createAudioElement = () => {
		if (!previewUrl) return null;

		const audio = new Audio(previewUrl);

		audio.addEventListener('loadstart', () => setIsLoading(true));
		audio.addEventListener('canplaythrough', () => setIsLoading(false));
		audio.addEventListener('ended', () => {
			setIsPlaying(false);
			setIsLoading(false);
		});
		audio.addEventListener('error', (e) => {
			setIsLoading(false);
			setIsPlaying(false);
			console.error('Error loading audio:', e);
		});

		return audio;
	};

	const handlePlay = async () => {
		if (!previewUrl) {
			console.warn('No preview URL provided');
			return;
		}

		try {
			// If currently playing, pause and stop
			if (isPlaying && audioRef.current) {
				audioRef.current.pause();
				setIsPlaying(false);
				return;
			}

			setIsLoading(true);

			// Always create a fresh audio element to ensure we're using the latest URL
			if (audioRef.current) {
				audioRef.current.pause();
			}

			audioRef.current = createAudioElement();

			if (!audioRef.current) {
				setIsLoading(false);
				return;
			}

			await audioRef.current.play();
			setIsPlaying(true);
			setIsLoading(false);
		} catch (error) {
			console.error('Error playing audio:', error);
			setIsLoading(false);
			setIsPlaying(false);
		}
	};

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	const getButtonClass = () => {
		let className = styles.playButton;
		if (isPlaying) className += ` ${styles.playing}`;
		return className;
	};

	return (
		<Box className={styles.voicePlayer} w='100%'>
			<Group
				justify='space-between'
				align='center'
				wrap='nowrap'
				style={{ width: '100%' }}
			>
				<Group gap='sm' align='center' style={{ flex: 1, minWidth: 0 }}>
					<Box className={styles.iconWrapper}>
						<IconWaveSquare
							size={16}
							color='currentColor'
							className={styles.waveIcon}
						/>
					</Box>
					<Stack gap={1} style={{ minWidth: 0 }}>
						<Text size='xs' fw={500} className={styles.voiceLabel} truncate>
							Agent voice
						</Text>
						<Text size='xs' className={styles.voiceName} truncate>
							{voiceName}
						</Text>
					</Stack>
				</Group>
				<Box className={styles.playButtonWrapper}>
					<Button
						variant='filled'
						color='blue'
						size='sm'
						radius='xl'
						className={getButtonClass()}
						onClick={handlePlay}
						disabled={!previewUrl || isLoading}
						loading={isLoading}
					>
						{isPlaying ? (
							<IconPlayerPause size={15} fill='currentColor' />
						) : (
							<IconPlayerPlay size={15} fill='currentColor' />
						)}
					</Button>
				</Box>
			</Group>
		</Box>
	);
};

export { VoicePlayer };
