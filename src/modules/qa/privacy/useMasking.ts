import { useEffect, useMemo, useState } from 'react';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import { selectReveals, usePrivacyStore } from '~/stores/qa/privacyStore';
import { maskSegments, maskText } from './mask';
import type { MaskSegment, PrivacySettings, RevealSession } from './types';

/**
 * What the current viewer sees of a call's text: masked, or the real data while a reveal
 * is active. Pass the callId only on the call detail; everywhere else the data is never revealed.
 */
export const useMasking = (callId?: string) => {
	const settings: PrivacySettings = useSettingsStore(selectThresholds).privacy;
	const reveals = usePrivacyStore(selectReveals);
	const conceal = usePrivacyStore((s) => s.conceal);
	const session: RevealSession | null = callId
		? (reveals[callId] ?? null)
		: null;
	// Re-render when the reveal runs out, so the data hides without a click.
	const [, setTick] = useState(0);
	useEffect(() => {
		if (!session || !callId) return;
		const left = Date.parse(session.expiresAt) - Date.now();
		if (left <= 0) {
			conceal(callId);
			return;
		}
		const timer = window.setTimeout(() => {
			conceal(callId);
			setTick((t) => t + 1);
		}, left);
		return () => window.clearTimeout(timer);
	}, [session, callId, conceal]);

	const revealed = !!session && Date.parse(session.expiresAt) > Date.now();
	const active = settings.enabled && !revealed;

	return useMemo(
		() => ({
			settings,
			active,
			revealed,
			session: revealed ? session : null,
			segments: (text: string): MaskSegment[] =>
				active ? maskSegments(text, settings) : [{ text }],
			mask: (text: string) => (active ? maskText(text, settings) : text),
		}),
		[settings, active, revealed, session]
	);
};
