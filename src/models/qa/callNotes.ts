/** Roles that can leave notes on a call. Agents never see them. */
export type CallNoteAuthorRole = 'supervisor' | 'qaManager' | 'superAdmin';

export interface CallNoteAuthor {
	id: string;
	name: string;
	role: CallNoteAuthorRole;
}

/** A note on a whole call, shared by the review team. */
export interface CallNote {
	id: string;
	callId: string;
	text: string;
	author: CallNoteAuthor;
	createdAt: string;
	/** Set once the author changes the text. */
	editedAt?: string;
	/** Second of the recording the note points at, when the author linked one. */
	seconds?: number;
}

export const CALL_NOTE_MAX_LENGTH = 1000;
