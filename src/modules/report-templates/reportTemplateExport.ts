import { downloadBlob } from '~/utils/fileUtils';

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|\u0000-\u001F]/g;

const sanitizeFilenameBase = (value: string) => {
	return (
		value
			.trim()
			.replace(INVALID_FILENAME_CHARS, '-')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^[.-]+|[.-]+$/g, '') || 'export'
	);
};

export const downloadReportTemplateExport = (
	blob: Blob,
	templateName: string | undefined,
	format: 'csv' | 'xlsx'
) => {
	const filename = `${sanitizeFilenameBase(templateName ?? 'export')}.${format}`;
	downloadBlob(blob, filename);
};
