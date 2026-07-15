import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseVoicePreviewReturn {
	playingVoiceId: string | null;
	progress: number;
	toggle: (voiceId: string, previewUrl: string) => void;
	stop: () => void;
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
		const audio = new Audio();
		audioRef.current = audio;
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('timeupdate', handleTimeUpdate);

		return () => {
			audio.pause();
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audioRef.current = null;
		};
	}, [handleEnded, handleTimeUpdate]);

	return {
		playingVoiceId,
		progress,
		toggle,
		stop,
	};
};
