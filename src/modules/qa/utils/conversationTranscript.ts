import type {
	ConversationTranscript,
	ConversationTranscriptProfile,
	ConversationTranscriptSegment,
} from '~/models/qa';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function firstString(record: UnknownRecord, keys: string[]): string | null {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}

	return null;
}

function firstNumber(record: UnknownRecord, keys: string[]): number | null {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'number' && Number.isFinite(value)) return value;
		if (typeof value === 'string' && value.trim()) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) return parsed;
		}
	}

	return null;
}

function firstValue(record: UnknownRecord, keys: string[]): unknown {
	for (const key of keys) {
		if (key in record) return record[key];
	}

	return undefined;
}

function normalizeTimestamp(
	value: number | null,
	keyHint: string
): number | null {
	if (value === null) return null;
	if (/ms|millisecond/i.test(keyHint)) return value / 1000;
	return value > 10_000 ? value / 1000 : value;
}

function segmentArrayFrom(value: unknown): unknown[] {
	if (Array.isArray(value)) return value;
	if (!isRecord(value)) return [];

	for (const key of ['segments', 'utterances', 'items', 'turns', 'messages']) {
		const candidate = value[key];
		if (Array.isArray(candidate)) return candidate;
	}

	for (const key of ['transcript', 'data', 'result']) {
		const candidate = value[key];
		if (Array.isArray(candidate)) return candidate;
		const nested = segmentArrayFrom(candidate);
		if (nested.length > 0) return nested;
	}

	return [];
}

function fullTextFrom(value: unknown): string | null {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (!isRecord(value)) return null;

	const direct = firstString(value, [
		'text',
		'fullText',
		'transcript',
		'content',
	]);
	if (direct) return direct;

	for (const key of ['transcript', 'data', 'result']) {
		const nested = fullTextFrom(value[key]);
		if (nested) return nested;
	}

	return null;
}

function normalizeSegment(
	value: unknown,
	index: number
): ConversationTranscriptSegment | null {
	const record = isRecord(value) ? value : { text: value };
	const text = firstString(record, [
		'text',
		'transcript',
		'content',
		'utterance',
		'message',
	]);

	if (!text) return null;

	const startKey = [
		'startSeconds',
		'startSecond',
		'start',
		'startTime',
		'startMs',
		'startMilliseconds',
	].find((key) => firstValue(record, [key]) !== undefined);
	const endKey = [
		'endSeconds',
		'endSecond',
		'end',
		'endTime',
		'endMs',
		'endMilliseconds',
	].find((key) => firstValue(record, [key]) !== undefined);
	const speaker =
		firstString(record, [
			'speakerLabel',
			'speaker',
			'speakerName',
			'role',
			'channel',
		]) ??
		firstNumber(record, [
			'speakerIndex',
			'speakerId',
			'speaker_id',
		])?.toString() ??
		'';

	return {
		id:
			firstString(record, ['id', 'segmentId', 'utteranceId']) ??
			`segment-${index + 1}`,
		speakerLabel: speaker,
		text,
		startSeconds: normalizeTimestamp(
			firstNumber(record, startKey ? [startKey] : []),
			startKey ?? ''
		),
		endSeconds: normalizeTimestamp(
			firstNumber(record, endKey ? [endKey] : []),
			endKey ?? ''
		),
		raw: value,
	};
}

export function normalizeConversationTranscript(
	raw: unknown,
	profile?: ConversationTranscriptProfile
): ConversationTranscript {
	const segments = segmentArrayFrom(raw)
		.map((segment, index) => normalizeSegment(segment, index))
		.filter((segment): segment is ConversationTranscriptSegment =>
			Boolean(segment)
		);
	const fullText = fullTextFrom(raw);

	return {
		conversationId: isRecord(raw)
			? (firstNumber(raw, ['conversationId']) ?? undefined)
			: undefined,
		profile,
		fullText,
		segments:
			segments.length > 0 || !fullText
				? segments
				: [
						{
							id: 'full-transcript',
							speakerLabel: '',
							text: fullText,
							startSeconds: null,
							endSeconds: null,
							raw,
						},
					],
		raw,
	};
}
