import { create } from 'zustand';
import type {
	CallNote,
	CallNoteAuthor,
	CallNoteAuthorRole,
} from '~/models/qa/callNotes';
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
import type { PreviewRole } from '~/constants/previewRole';

let counter = 0;
const nextNoteId = () => `note-${++counter}`;

/** Who writes when a role is being previewed; the mock has no real sign-in. */
const AUTHORS: Record<CallNoteAuthorRole, CallNoteAuthor> = {
	supervisor: { id: 'sup-1', name: 'Marcos Rivera', role: 'supervisor' },
	qaManager: { id: 'qam-1', name: 'Laura Méndez', role: 'qaManager' },
	superAdmin: { id: 'adm-1', name: 'Admin', role: 'superAdmin' },
};

/** The author for the previewed role; any other role writes as the QA Manager. */
export const authorForRole = (role: PreviewRole | null): CallNoteAuthor =>
	role === 'supervisor' || role === 'superAdmin'
		? AUTHORS[role]
		: AUTHORS.qaManager;

const CALL_ID = mockCallEvaluationDetail.callId;

/** Earlier notes, so the section is not empty on first open. */
const SEED_NOTES: CallNote[] = [
	{
		id: 'note-seed-1',
		callId: CALL_ID,
		text: 'The promotional price is quoted here without the regular price after month six. This is the one violation on the call.',
		author: AUTHORS.qaManager,
		createdAt: '2026-10-26T15:20:00.000Z',
		seconds: 75,
	},
	{
		id: 'note-seed-2',
		callId: CALL_ID,
		text: 'Good recovery after the early objection. Worth using as a coaching example for the team.',
		author: AUTHORS.supervisor,
		createdAt: '2026-10-26T17:05:00.000Z',
		seconds: 41,
	},
	{
		id: 'note-seed-3',
		callId: CALL_ID,
		text: 'Customer asked for a callback after the 15th. Already scheduled with the agent.',
		author: AUTHORS.supervisor,
		createdAt: '2026-10-27T09:10:00.000Z',
		editedAt: '2026-10-27T09:25:00.000Z',
	},
];

export interface AddNoteInput {
	callId: string;
	text: string;
	author: CallNoteAuthor;
	seconds?: number;
}

interface CallNotesState {
	/** Nothing is persisted; seeded from the mock call. */
	notes: CallNote[];
	addNote: (input: AddNoteInput) => CallNote;
	editNote: (id: string, text: string) => void;
	removeNote: (id: string) => void;
}

export const useCallNotesStore = create<CallNotesState>()((set) => ({
	notes: SEED_NOTES,
	addNote: ({ callId, text, author, seconds }) => {
		const note: CallNote = {
			id: nextNoteId(),
			callId,
			text,
			author,
			createdAt: new Date().toISOString(),
			seconds,
		};
		set((s) => ({ notes: [note, ...s.notes] }));
		return note;
	},
	editNote: (id, text) =>
		set((s) => ({
			notes: s.notes.map((n) =>
				n.id === id ? { ...n, text, editedAt: new Date().toISOString() } : n
			),
		})),
	removeNote: (id) =>
		set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
}));

export const selectNotes = (s: CallNotesState) => s.notes;
