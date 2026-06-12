export type ConvaiStatus =
	| 'disconnected'
	| 'connecting'
	| 'connected'
	| 'error';
export type ConvaiMode = 'speaking' | 'listening';

export type TranscriptItem = {
	id: string;
	role: 'user' | 'agent';
	message: string;
	timestamp: number;
};

export type VoiceOption = {
	voiceId: string;
	voiceName: string;
};

export const STATUS_COLOR_MAP: Record<ConvaiStatus, string> = {
	disconnected: 'gray',
	connecting: 'blue',
	connected: 'green',
	error: 'red',
} as const;
