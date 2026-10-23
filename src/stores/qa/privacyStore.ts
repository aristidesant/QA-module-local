import { create } from 'zustand';
import type {
	RevealLogEntry,
	RevealReason,
	RevealSession,
} from '~/modules/qa/privacy/types';

let counter = 0;
const nextId = () => `rv-${++counter}`;
const minutesFromNow = (minutes: number, from = Date.now()) =>
	new Date(from + minutes * 60_000).toISOString();

/** Earlier reveals, so the log in Settings is not empty on first open. */
const SEED_LOG: RevealLogEntry[] = [
	{
		id: 'rv-seed-1',
		callId: 'call-014',
		by: 'Laura Méndez (QA Manager)',
		reason: 'disputeReview',
		note: 'Dispute DSP-2031: confirm the account number the agent read back.',
		at: '2026-10-20T14:02:00.000Z',
		expiresAt: '2026-10-20T14:17:00.000Z',
	},
	{
		id: 'rv-seed-2',
		callId: 'call-009',
		by: 'Laura Méndez (QA Manager)',
		reason: 'complianceInvestigation',
		note: '',
		at: '2026-10-17T09:40:00.000Z',
		expiresAt: '2026-10-17T09:55:00.000Z',
		hiddenAt: '2026-10-17T09:46:00.000Z',
	},
	{
		id: 'rv-seed-3',
		callId: 'call-003',
		by: 'Admin (Super Admin)',
		reason: 'fraudCheck',
		note: 'Card used on three accounts in one week.',
		at: '2026-10-11T16:15:00.000Z',
		expiresAt: '2026-10-11T16:30:00.000Z',
	},
];

export interface RevealInput {
	callId: string;
	by: string;
	reason: RevealReason;
	note: string;
	minutes: number;
}

interface PrivacyState {
	/** Active reveal per call. Nothing is persisted. */
	reveals: Record<string, RevealSession>;
	log: RevealLogEntry[];
	reveal: (input: RevealInput) => RevealSession;
	conceal: (callId: string) => void;
}

export const usePrivacyStore = create<PrivacyState>()((set) => ({
	reveals: {},
	log: SEED_LOG,
	reveal: ({ callId, by, reason, note, minutes }) => {
		const now = Date.now();
		const session: RevealSession = {
			callId,
			by,
			reason,
			note,
			at: new Date(now).toISOString(),
			expiresAt: minutesFromNow(minutes, now),
		};
		set((s) => ({
			reveals: { ...s.reveals, [callId]: session },
			log: [{ id: nextId(), ...session }, ...s.log],
		}));
		return session;
	},
	conceal: (callId) =>
		set((s) => {
			const session = s.reveals[callId];
			if (!session) return s;
			const reveals = { ...s.reveals };
			delete reveals[callId];
			// Only a reveal hidden before it ran out counts as "hidden early".
			const early = Date.parse(session.expiresAt) > Date.now();
			const hiddenAt = new Date().toISOString();
			return {
				reveals,
				log: early
					? s.log.map((e) =>
							e.callId === callId && e.at === session.at && !e.hiddenAt
								? { ...e, hiddenAt }
								: e
						)
					: s.log,
			};
		}),
}));

export const selectReveals = (s: PrivacyState) => s.reveals;
export const selectRevealLog = (s: PrivacyState) => s.log;
