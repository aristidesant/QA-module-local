/** An FTP server already set up in the admin configuration. Only its name is shown. */
export interface ConfiguredFtp {
	id: string;
	name: string;
}

/** Form state of the FTP part of the tab. */
export interface CallSourceValues {
	/** The configured FTP the campaign pulls from; '' until one is chosen. */
	ftpId: string;
}

/** What a campaign keeps about its call source. */
export interface CampaignCallSource {
	ftpId: string;
}

/** Validation messages keyed by field: 'ftpId'. */
export type CallSourceErrors = Record<string, string>;

export type RecordingKind = 'AUDIO' | 'ZIP';
/** STAGED until the user confirms, then UPLOADING while the mocked upload runs, then UPLOADED. */
export type RecordingStatus = 'STAGED' | 'UPLOADING' | 'UPLOADED';

/** One file sent through Manual upload, with its result. */
export interface UploadedRecording {
	id: string;
	name: string;
	kind: RecordingKind;
	sizeBytes: number;
	/** 1 for an audio file; a mocked estimate for a ZIP. */
	calls: number;
	status: RecordingStatus;
}

/** One call found inside an uploaded file: a row of the upload result. */
export interface UploadedCall {
	id: string;
	agent: string;
	durationSeconds: number;
}
