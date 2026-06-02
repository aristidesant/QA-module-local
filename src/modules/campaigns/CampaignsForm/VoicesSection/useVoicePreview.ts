import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseVoicePreviewReturn {
	audioRef: React.RefObject<HTMLAudioElement | null>;
	playingVoiceId: string | null;
	progress: number;
	toggle: (voiceId: string, previewUrl: string) => void;
	stop: () => void;
	handleEnded: () => void;
	handleTimeUpdate: () => void;
}

export const useVoicePreview = (): UseVoicePreviewReturn => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);

	const stop = useCallback(() => {
		audioRef.current?.pause();
		setPlayingVoiceId(null);
		setProgress(0);
	}, []);

	const toggle = useCallback(
		(voiceId: string, previewUrl: string) => {
			if (!previewUrl || !audioRef.current) {
				return;
			}

			if (playingVoiceId === voiceId) {
				stop();
				return;
			}

			audioRef.current.pause();
			audioRef.current.src = previewUrl;
			setProgress(0);

			audioRef.current
				.play()
				.then(() => {
					setPlayingVoiceId(voiceId);
				})
				.catch(() => {
					setPlayingVoiceId(null);
					setProgress(0);
				});
		},
		[playingVoiceId, stop]
	);

	const handleEnded = useCallback(() => {
		setPlayingVoiceId(null);
		setProgress(0);
	}, []);

	const handleTimeUpdate = useCallback(() => {
		const audio = audioRef.current;
		if (!audio || !audio.duration) {
			return;
		}
		setProgress((audio.currentTime / audio.duration) * 100);
	}, []);

	useEffect(() => {
		return () => {
			audioRef.current?.pause();
		};
	}, []);

	return {
		audioRef,
		playingVoiceId,
		progress,
		toggle,
		stop,
		handleEnded,
		handleTimeUpdate,
	};
};
