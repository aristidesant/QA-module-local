import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechSynthesisState {
	/** Whether the browser supports the Web Speech API */
	isSupported: boolean;
	/** Whether an utterance is currently being spoken */
	isSpeaking: boolean;
	/** Arbitrary id of the utterance currently playing (e.g. a row id) */
	currentId: string | number | null;
}

interface UseSpeechSynthesisReturn extends SpeechSynthesisState {
	/**
	 * Speak the given text using the browser's TTS engine.
	 * @param text     – Text to speak.
	 * @param lang     – BCP-47 language tag (e.g. "es-DO", "en-US"). Optional.
	 * @param id       – Arbitrary id to track which item is playing. Optional.
	 */
	speak: (text: string, lang?: string | null, id?: string | number) => void;
	/** Stop any in-progress utterance. */
	stop: () => void;
}

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Lightweight hook wrapping the native Web Speech Synthesis API.
 *
 * – Matches the best voice for a given BCP-47 locale
 *   (exact → language-prefix → default).
 * – Cancels previous utterance on new speak() call.
 * – Cleans up on unmount.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
	const [state, setState] = useState<SpeechSynthesisState>({
		isSupported: SUPPORTED,
		isSpeaking: false,
		currentId: null,
	});

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

	// Load voices – some browsers (Chrome) fire `voiceschanged` asynchronously.
	useEffect(() => {
		if (!SUPPORTED) return;

		const loadVoices = () => {
			voicesRef.current = window.speechSynthesis.getVoices();
		};

		loadVoices();
		window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

		return () => {
			window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
		};
	}, []);

	// Cancel on unmount.
	useEffect(() => {
		return () => {
			if (SUPPORTED) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	/**
	 * Score a voice for naturalness.
	 * Higher is better. Cloud / "Enhanced" / "Premium" voices score highest.
	 */
	const scoreVoice = useCallback((voice: SpeechSynthesisVoice): number => {
		let score = 0;
		const name = voice.name.toLowerCase();

		// Cloud / remote voices are usually Google's WaveNet or similar – much better quality.
		if (!voice.localService) score += 20;

		// Known high-quality voice name patterns across browsers / OS.
		const premiumPatterns = [
			'enhanced',
			'premium',
			'natural',
			'neural',
			'wavenet',
			'google',
			'microsoft .+ online',
		];
		if (premiumPatterns.some((p) => new RegExp(p).test(name))) score += 15;

		// macOS high-quality voices (Samantha, Mónica, Paulina, etc.).
		const macQuality = [
			'samantha',
			'mónica',
			'monica',
			'paulina',
			'jorge',
			'diego',
			'karen',
			'daniel',
			'tessa',
		];
		if (macQuality.some((n) => name.includes(n))) score += 10;

		// Penalise voices that are obviously low-quality / novelty.
		const lowQuality = ['espeak', 'mbrola', 'festival', 'novelty', 'compact'];
		if (lowQuality.some((n) => name.includes(n))) score -= 20;

		return score;
	}, []);

	/**
	 * Find the best-sounding voice matching a BCP-47 tag.
	 *
	 * Strategy (per tier, pick the highest-scored voice):
	 *   1. Exact locale match   (e.g. "es-DO" === "es-DO")
	 *   2. Language-prefix match (e.g. "es-DO" → "es-ES")
	 *   3. Any voice (browser default)
	 */
	const findVoice = useCallback(
		(lang: string): SpeechSynthesisVoice | null => {
			const voices = voicesRef.current;
			if (!lang || voices.length === 0) return null;

			const normalised = lang.toLowerCase();
			const prefix = normalised.split('-')[0];

			const bestOf = (list: SpeechSynthesisVoice[]) =>
				list.length === 0
					? null
					: list.reduce((best, v) =>
							scoreVoice(v) > scoreVoice(best) ? v : best
						);

			// 1. Exact locale match — pick highest-quality among them.
			const exactMatches = voices.filter(
				(v) => v.lang.toLowerCase() === normalised
			);
			if (exactMatches.length > 0) return bestOf(exactMatches);

			// 2. Language-prefix match.
			const prefixMatches = voices.filter(
				(v) => v.lang.toLowerCase().split('-')[0] === prefix
			);
			if (prefixMatches.length > 0) return bestOf(prefixMatches);

			return null;
		},
		[scoreVoice]
	);

	const stop = useCallback(() => {
		if (!SUPPORTED) return;
		window.speechSynthesis.cancel();
		utteranceRef.current = null;
		setState((prev) => ({ ...prev, isSpeaking: false, currentId: null }));
	}, []);

	const speak = useCallback(
		(text: string, lang?: string | null, id?: string | number) => {
			if (!SUPPORTED || !text.trim()) return;

			// If the same id is already playing, toggle it off.
			if (id !== undefined && state.currentId === id && state.isSpeaking) {
				stop();
				return;
			}

			// Cancel any in-flight utterance.
			window.speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(text);

			// Slightly slower rate + natural pitch for a less robotic feel.
			utterance.rate = 0.95;
			utterance.pitch = 1.0;

			if (lang) {
				utterance.lang = lang;
				const voice = findVoice(lang);
				if (voice) {
					utterance.voice = voice;
				}
			}

			utterance.onstart = () => {
				setState((prev) => ({
					...prev,
					isSpeaking: true,
					currentId: id ?? null,
				}));
			};

			utterance.onend = () => {
				utteranceRef.current = null;
				setState((prev) => ({
					...prev,
					isSpeaking: false,
					currentId: null,
				}));
			};

			utterance.onerror = () => {
				utteranceRef.current = null;
				setState((prev) => ({
					...prev,
					isSpeaking: false,
					currentId: null,
				}));
			};

			utteranceRef.current = utterance;
			window.speechSynthesis.speak(utterance);
		},
		[findVoice, state.currentId, state.isSpeaking, stop]
	);

	return {
		...state,
		speak,
		stop,
	};
}
