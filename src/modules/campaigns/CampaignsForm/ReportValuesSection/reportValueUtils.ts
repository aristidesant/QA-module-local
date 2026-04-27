import type { ReportValue } from '~/models/ReportValue';

export const DEFAULT_SHEET = 1;
export const DEFAULT_SHEET_NAME_PREFIX = 'Report';
export const INVALID_SHEET_NAME_PATTERN = /[:\\/?*\[\]]/;
export const MAX_SHEET_NAME_LENGTH = 31;

export const ORIGIN_TYPE_COLORS: Record<string, string> = {
	SQL: 'blue',
	DYNAMIC: 'violet',
	OBJECT: 'teal',
	METADATA: 'orange',
	CUSTOM_VARIABLES: 'green',
};

export const DATA_TYPE_COLORS: Record<string, string> = {
	STRING: 'gray',
	NUMBER: 'orange',
	BOOLEAN: 'pink',
	DATE: 'cyan',
	DATETIME: 'indigo',
};

export type SheetGroup = {
	sheet: number;
	sheetName: string;
	columns: ReportValue[];
};

export const isSameSheetColumn = (left: ReportValue, right: ReportValue) =>
	left.originType === right.originType && left.key === right.key;

export const getDefaultSheetName = (sheet: number) =>
	`${DEFAULT_SHEET_NAME_PREFIX} ${sheet}`;

export const getNormalizedSheetNumber = (sheet: number | null | undefined) => {
	if (!Number.isInteger(sheet) || (sheet ?? 0) < 1) {
		return DEFAULT_SHEET;
	}

	return Number(sheet);
};

export const getNormalizedSheetName = (
	sheetName: string | null | undefined,
	sheet: number
) => {
	const trimmed = sheetName?.trim();
	return trimmed ? trimmed : getDefaultSheetName(sheet);
};

export const normalizeColumns = (items: ReportValue[]): ReportValue[] => {
	const grouped = new Map<number, ReportValue[]>();

	for (const item of items) {
		const sheet = getNormalizedSheetNumber(item.sheet);
		const normalizedItem = {
			...item,
			format: item.format ?? null,
			sheet,
			sheetName: getNormalizedSheetName(item.sheetName, sheet),
		};

		const current = grouped.get(sheet) ?? [];
		current.push(normalizedItem);
		grouped.set(sheet, current);
	}

	return [...grouped.entries()]
		.sort(([leftSheet], [rightSheet]) => leftSheet - rightSheet)
		.flatMap(([, group]) =>
			[...group]
				.sort((a, b) => a.order - b.order || a.id - b.id)
				.map((item, index) => ({
					...item,
					order: index,
				}))
		);
};

export const buildSheetGroups = (items: ReportValue[]): SheetGroup[] => {
	const grouped = new Map<number, SheetGroup>();

	for (const item of normalizeColumns(items)) {
		const existing = grouped.get(item.sheet);
		if (existing) {
			existing.columns.push(item);
			continue;
		}

		grouped.set(item.sheet, {
			sheet: item.sheet,
			sheetName: item.sheetName,
			columns: [item],
		});
	}

	return [...grouped.values()].sort((a, b) => a.sheet - b.sheet);
};

export const toComparableColumn = (item: ReportValue) => ({
	id: item.id,
	originType: item.originType,
	key: item.key,
	label: item.label,
	dataType: item.dataType,
	format: item.format ?? null,
	order: item.order,
	sheet: item.sheet,
	sheetName: item.sheetName,
});

export const getNextSheetNumber = (groups: SheetGroup[]): number => {
	const usedSheets = new Set(groups.map((group) => group.sheet));
	let nextSheet = DEFAULT_SHEET;

	while (usedSheets.has(nextSheet)) {
		nextSheet += 1;
	}

	return nextSheet;
};

export const reindexSheetColumns = (
	items: ReportValue[],
	sheet: number,
	sheetName?: string
): ReportValue[] => {
	let order = 0;
	return items.map((item) => {
		if (item.sheet !== sheet) {
			return item;
		}

		return {
			...item,
			order: order++,
			sheetName: sheetName ? sheetName.trim() : item.sheetName,
		};
	});
};

export const validateSheetName = (
	sheetName: string,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const trimmedName = sheetName.trim();

	if (!trimmedName) {
		return t('reportValues.validation.sheetNameRequired', {
			ns: 'campaign.contact-list',
		});
	}

	if (trimmedName.length > MAX_SHEET_NAME_LENGTH) {
		return t('reportValues.validation.sheetNameTooLong', {
			ns: 'campaign.contact-list',
		});
	}

	if (INVALID_SHEET_NAME_PATTERN.test(trimmedName)) {
		return t('reportValues.validation.sheetNameInvalidChars', {
			ns: 'campaign.contact-list',
		});
	}

	return null;
};

export type SheetOption = {
	sheet: number;
	sheetName: string;
};

export const validateWorksheetName = (
	sheetName: string,
	sheet: number,
	availableSheets: SheetOption[],
	reportValue: ReportValue | undefined,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const baseError = validateSheetName(sheetName, t);
	if (baseError) return baseError;

	const trimmed = sheetName.trim();

	const currentSheetAssignment = availableSheets.find(
		(item) => item.sheet === sheet
	);
	if (currentSheetAssignment && currentSheetAssignment.sheetName !== trimmed) {
		return t('reportValues.validation.sheetNameMismatch', {
			ns: 'campaign.contact-list',
			sheet,
		});
	}

	const existingAssignment = availableSheets.find(
		(item) =>
			item.sheetName === trimmed &&
			item.sheet !== sheet &&
			item.sheet !== reportValue?.sheet
	);

	if (existingAssignment) {
		return t('reportValues.validation.sheetNameAlreadyAssigned', {
			ns: 'campaign.contact-list',
			sheetName: trimmed,
			sheet: existingAssignment.sheet,
		});
	}

	return null;
};

export const validateSheetColumnUniqueness = (
	sheet: number,
	sourceColumn: ReportValue | undefined,
	existingColumns: ReportValue[],
	reportValue: ReportValue | undefined,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	if (!sourceColumn) {
		return null;
	}

	const existingMatch = existingColumns.find(
		(item) =>
			item.id !== reportValue?.id &&
			item.sheet === sheet &&
			isSameSheetColumn(item, sourceColumn)
	);

	if (!existingMatch) {
		return null;
	}

	return t('reportValues.validation.duplicateColumnInSheet', {
		ns: 'campaign.contact-list',
		label: sourceColumn.label,
		sheet,
	});
};

export const validateDraftColumns = (
	items: ReportValue[],
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const sheetToName = new Map<number, string>();
	const nameToSheet = new Map<string, number>();
	const sheetColumnKeys = new Set<string>();

	for (const item of items) {
		if (!Number.isInteger(item.sheet) || item.sheet < 1) {
			return t('reportValues.validation.sheetRequired', {
				ns: 'campaign.contact-list',
			});
		}

		const sheetNameError = validateSheetName(item.sheetName, t);
		if (sheetNameError) {
			return sheetNameError;
		}

		const normalizedSheetName = item.sheetName.trim();
		const existingSheetName = sheetToName.get(item.sheet);
		if (existingSheetName && existingSheetName !== normalizedSheetName) {
			return t('reportValues.validation.sheetNameMismatch', {
				ns: 'campaign.contact-list',
				sheet: item.sheet,
			});
		}

		sheetToName.set(item.sheet, normalizedSheetName);

		const existingSheet = nameToSheet.get(normalizedSheetName);
		if (existingSheet && existingSheet !== item.sheet) {
			return t('reportValues.validation.sheetNameAlreadyAssigned', {
				ns: 'campaign.contact-list',
				sheetName: normalizedSheetName,
				sheet: existingSheet,
			});
		}

		nameToSheet.set(normalizedSheetName, item.sheet);

		const uniqueColumnKey = `${item.sheet}:${item.originType}:${item.key}`;
		if (sheetColumnKeys.has(uniqueColumnKey)) {
			return t('reportValues.validation.duplicateColumnInSheet', {
				ns: 'campaign.contact-list',
				label: item.label,
				sheet: item.sheet,
			});
		}

		sheetColumnKeys.add(uniqueColumnKey);
	}

	return null;
};
