import { create } from 'zustand';
import type {
	CallMoment,
	CallMomentStatus,
	QAErrorTypeCode,
	TranscriptTurn,
} from '~/views/Campaigns/types';
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
import {
	buildAiMoments,
	turnSeconds,
} from '~/views/Campaigns/components/call-evaluation/callMoments';

let counter = 0;
const nextMomentId = () => `m-rev-${++counter}`;

export interface AddMomentInput {
	callId: string;
	turn: TranscriptTurn;
	itemId: string | null;
	itemName: string;
	errorType: QAErrorTypeCode;
	note: string;
}

interface CallMomentsState {
	/** Nothing is persisted; seeded from the mock call. */
	moments: CallMoment[];
	setStatus: (id: string, status: CallMomentStatus, note?: string) => void;
	addMoment: (input: AddMomentInput) => CallMoment;
	removeMoment: (id: string) => void;
}

export const useCallMomentsStore = create<CallMomentsState>()((set) => ({
	moments: buildAiMoments(mockCallEvaluationDetail),
	setStatus: (id, status, note) =>
		set((s) => ({
			moments: s.moments.map((m) =>
				m.id === id
					? { ...m, status, note: note ?? (status === 'pending' ? '' : m.note) }
					: m
			),
		})),
	addMoment: (input) => {
		const moment: CallMoment = {
			id: nextMomentId(),
			callId: input.callId,
			itemId: input.itemId,
			itemName: input.itemName,
			errorType: input.errorType,
			turnId: input.turn.id,
			timestamp: input.turn.timestamp,
			seconds: turnSeconds(input.turn),
			speaker: input.turn.speaker,
			quote: input.turn.text,
			source: 'reviewer',
			status: 'confirmed',
			note: input.note,
		};
		set((s) => ({ moments: [...s.moments, moment] }));
		return moment;
	},
	removeMoment: (id) =>
		set((s) => ({ moments: s.moments.filter((m) => m.id !== id) })),
}));

export const selectMoments = (s: CallMomentsState) => s.moments;
