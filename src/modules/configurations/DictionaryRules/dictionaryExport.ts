import type { PronunciationRule } from '~/models/PronunciationDictionaryModel';
import { downloadBlob } from '~/utils/fileUtils';

const CSV_HEADERS =
	'grapheme,ruleType,phoneme,alias,locale,description,category';

function escapeCsvField(value: string | null | undefined): string {
	const str = value ?? '';
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function rulesToCsv(rules: PronunciationRule[]): string {
	const rows = rules.map((rule) =>
		[
			escapeCsvField(rule.grapheme),
			escapeCsvField(rule.ruleType),
			escapeCsvField(rule.phoneme),
			escapeCsvField(rule.alias),
			escapeCsvField(rule.locale),
			escapeCsvField(rule.description),
			escapeCsvField(rule.category),
		].join(',')
	);
	return [CSV_HEADERS, ...rows].join('\n');
}

function slugifyFilename(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function downloadDictionaryAsCsv(
	dictionaryName: string,
	rules: PronunciationRule[]
): void {
	const csv = rulesToCsv(rules);
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const filename = `${slugifyFilename(dictionaryName)}-rules.csv`;
	downloadBlob(blob, filename);
}
