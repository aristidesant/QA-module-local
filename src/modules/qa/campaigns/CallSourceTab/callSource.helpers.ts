import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type {
	CallSourceErrors,
	CallSourceValues,
	CampaignCallSource,
	RecordingKind,
	UploadedCall,
	UploadedRecording,
} from './callSource.types';

export const RECORDINGS_ACCEPT =
	'.mp3,.wav,.zip,audio/mpeg,audio/wav,audio/x-wav,application/zip,application/x-zip-compressed';
export const RECORDING_MAX_SIZE_MB = 200;
/** How long the mocked upload takes before a file shows as uploaded. */
export const UPLOAD_DELAY_MS = 1200;
/** Mocked: roughly one call per 1.2 MB of ZIP, between 2 and 60. */
const ZIP_BYTES_PER_CALL = 1.2 * 1024 * 1024;

/** The tab's FTP form state for a saved source, or an empty one. */
export const fromCampaignSource = (
	source: CampaignCallSource | undefined
): CallSourceValues => ({ ftpId: source?.ftpId ?? '' });

/** What gets saved on the campaign, or nothing while no FTP is chosen. */
export const toCampaignSource = ({
	ftpId,
}: CallSourceValues): CampaignCallSource | undefined =>
	ftpId ? { ftpId } : undefined;

/** Errors keyed by field: 'ftpId'. */
export const validateCallSource = (
	{ ftpId }: CallSourceValues,
	t: (key: string) => string
): CallSourceErrors => (ftpId ? {} : { ftpId: t('callSource.ftp.required') });

export const recordingKindOf = (file: File): RecordingKind | null => {
	const name = file.name.toLowerCase();
	if (name.endsWith('.zip') || file.type.includes('zip')) return 'ZIP';
	if (
		name.endsWith('.mp3') ||
		name.endsWith('.wav') ||
		file.type.startsWith('audio/')
	)
		return 'AUDIO';
	return null;
};

let recordingSeq = 0;
export const toRecording = (
	file: File,
	kind: RecordingKind
): UploadedRecording => ({
	id: `rec-${++recordingSeq}`,
	name: file.name,
	kind,
	sizeBytes: file.size,
	calls:
		kind === 'AUDIO'
			? 1
			: Math.min(60, Math.max(2, Math.round(file.size / ZIP_BYTES_PER_CALL))),
	status: 'STAGED',
});

export const totalCalls = (recordings: UploadedRecording[]) =>
	recordings.reduce((n, r) => n + r.calls, 0);

/** Small seeded generator so a file always yields the same mocked calls. */
const seededRandom = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const AGENT_NAMES = TEAM_AGENTS.map((agent) => agent.name);

/**
 * Mocked content of an uploaded file: one call for an audio file, or as many
 * calls as the ZIP is estimated to hold, each with an ID, an agent and a duration.
 */
export const callsOf = (recording: UploadedRecording): UploadedCall[] => {
	const number = Number(recording.id.replace(/\D/g, '')) || 1;
	const random = seededRandom(number * 9301 + recording.calls);
	return Array.from({ length: recording.calls }, (_, index) => ({
		// Unique per file and position, so rows can use it as their key.
		id: `CALL-${48000 + number * 137 + index * 7}`,
		agent: AGENT_NAMES[Math.floor(random() * AGENT_NAMES.length)] ?? '-',
		// Between 1:00 and 14:59.
		durationSeconds: 60 + Math.floor(random() * 840),
	}));
};

/** m:ss, e.g. 4:07. */
export const formatCallDuration = (seconds: number) =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
