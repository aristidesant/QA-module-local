import { useState, useRef, useEffect } from 'react';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconLoader,
	IconCheck,
} from '@tabler/icons-react';
import styles from './VoiceMiniPlayer.module.css';

export interface VoiceMiniPlayerProps {
	voiceUrl?: string;
	disabled?: boolean;
	size?: 'small' | 'normal';
	onSelect?: () => void;
}

export function VoiceMiniPlayer({
	voiceUrl,
	disabled = false,
	size = 'normal',
	onSelect,
}: VoiceMiniPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const isDisabled = disabled || !voiceUrl;

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	const handleClick = async () => {
		if (isDisabled || !voiceUrl) {
			return;
		}

		try {
			// If currently playing, pause and stop
			if (isPlaying && audioRef.current) {
				audioRef.current.pause();
				setIsPlaying(false);
				return;
			}

			// Create new audio if needed
			if (!audioRef.current || audioRef.current.src !== voiceUrl) {
				if (audioRef.current) {
					audioRef.current.pause();
				}

				audioRef.current = new Audio(voiceUrl);

				// Add event listeners
				audioRef.current.addEventListener('ended', () => {
					setIsPlaying(false);
					setIsLoading(false);
				});

				audioRef.current.addEventListener('error', () => {
					setIsLoading(false);
					setIsPlaying(false);
				});

				audioRef.current.addEventListener('loadstart', () => {
					setIsLoading(true);
				});

				audioRef.current.addEventListener('canplaythrough', () => {
					setIsLoading(false);
				});
			}

			setIsLoading(true);
			await audioRef.current.play();
			setIsPlaying(true);
			setIsLoading(false);
		} catch (error) {
			console.error('Error playing audio:', error);
			setIsLoading(false);
			setIsPlaying(false);
		}
	};

	const renderIcon = () => {
		if (isLoading) {
			return <IconLoader className={styles.loadingSpinner} />;
		}

		if (isPlaying) {
			return <IconPlayerPause className={styles.pauseIcon} />;
		}

		return <IconPlayerPlay className={styles.playIcon} />;
	};

	return (
		<div
			className={`${styles.voiceMiniPlayer} ${
				size === 'small' ? styles.small : ''
			}`}
		>
			<div className={styles.playButtonContainer}>
				{/* Wave indicators for playing animation */}
				<div
					className={`${styles.waveIndicator} ${isPlaying ? styles.playing : ''}`}
				/>
				<div
					className={`${styles.waveIndicator} ${isPlaying ? styles.playing : ''}`}
				/>
				<div
					className={`${styles.waveIndicator} ${isPlaying ? styles.playing : ''}`}
				/>

				{/* Play button */}
				<button
					className={styles.playButton}
					onClick={handleClick}
					disabled={isDisabled}
				>
					{renderIcon()}
				</button>
			</div>

			{/* Select button */}
			<button
				className={styles.selectButton}
				onClick={onSelect}
				disabled={disabled || !onSelect}
			>
				<IconCheck className={styles.selectIcon} />
			</button>
		</div>
	);
}
