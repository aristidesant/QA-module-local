import type {
	AgentBranchDetails,
	AgentVersionCommit,
	AgentVersionSnapshot,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import { normalizeAgentVersionSnapshot } from '~/utils/agentVersioning';
import { diffLines, diffWords } from 'diff';

export const getMainBranch = (branchDetails?: AgentBranchDetails) =>
	branchDetails;

export const getHistoricalVersions = (
	branchDetails?: AgentBranchDetails
): AgentVersionSummary[] => {
	if (!branchDetails?.mostRecentVersions?.data?.length) {
		return [];
	}

	return branchDetails.mostRecentVersions.data.slice(1);
};

export const findCommitForVersion = (
	version: AgentVersionSummary,
	commits: AgentVersionCommit[]
): AgentVersionCommit | undefined => {
	if (commits.length === 0) return undefined;

	const byId = commits.find(
		(c) => c.versionId != null && c.versionId === version.id
	);
	if (byId) return byId;

	// Fall back to closest timestamp match (no hard tolerance — system clock skew
	// between ElevenLabs and our backend can exceed 2 minutes)
	const versionTimeMs = version.timeCommittedSecs * 1000;
	let best: AgentVersionCommit | undefined;
	let bestDiff = Infinity;

	for (const commit of commits) {
		const diff = Math.abs(new Date(commit.createdAt).getTime() - versionTimeMs);
		if (diff < bestDiff) {
			bestDiff = diff;
			best = commit;
		}
	}

	return best;
};

const sortJsonValue = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sortJsonValue);
	}

	if (value && typeof value === 'object') {
		return Object.keys(value as Record<string, unknown>)
			.sort((left, right) => left.localeCompare(right))
			.reduce<Record<string, unknown>>((accumulator, key) => {
				accumulator[key] = sortJsonValue(
					(value as Record<string, unknown>)[key]
				);
				return accumulator;
			}, {});
	}

	return value;
};

export const stringifySnapshot = (snapshot?: AgentVersionSnapshot | null) =>
	JSON.stringify(
		sortJsonValue(normalizeAgentVersionSnapshot(snapshot)),
		null,
		2
	);

export type SplitDiffLineKind = 'context' | 'added' | 'removed' | 'empty';

export interface WordSegment {
	text: string;
	changed: boolean;
}

export interface SplitDiffLine {
	lineNumber: number | null;
	text: string;
	kind: SplitDiffLineKind;
	wordSegments?: WordSegment[];
}

export interface SplitDiffRow {
	left: SplitDiffLine;
	right: SplitDiffLine;
}

export type SplitDiffDisplayRow =
	| {
			type: 'line';
			left: SplitDiffLine;
			right: SplitDiffLine;
	  }
	| {
			type: 'separator';
			hiddenLineCount: number;
			rowRange: { start: number; end: number };
	  };

const toDisplayLines = (value: string) => {
	const normalized = value.replace(/\r\n/g, '\n');
	const lines = normalized.split('\n');

	if (lines.at(-1) === '') {
		lines.pop();
	}

	return lines.length > 0 ? lines : [''];
};

const createEmptyLine = (): SplitDiffLine => ({
	lineNumber: null,
	text: '',
	kind: 'empty',
});

export const buildSplitDiffRows = (
	currentSnapshot?: AgentVersionSnapshot | null,
	selectedSnapshot?: AgentVersionSnapshot | null
): SplitDiffRow[] => {
	const currentText = stringifySnapshot(currentSnapshot);
	const selectedText = stringifySnapshot(selectedSnapshot);
	const changes = diffLines(currentText, selectedText);
	const rows: SplitDiffRow[] = [];
	let leftLineNumber = 1;
	let rightLineNumber = 1;

	for (let index = 0; index < changes.length; index += 1) {
		const change = changes[index];

		if (change.removed) {
			const removedLines = toDisplayLines(change.value);
			const nextChange = changes[index + 1];
			const addedLines = nextChange?.added
				? toDisplayLines(nextChange.value)
				: [];
			const maxLines = Math.max(removedLines.length, addedLines.length);

			for (let lineIndex = 0; lineIndex < maxLines; lineIndex += 1) {
				const removedLine = removedLines[lineIndex];
				const addedLine = addedLines[lineIndex];

				let leftWordSegments;
				let rightWordSegments;
				if (removedLine !== undefined && addedLine !== undefined) {
					const wordChanges = diffWords(removedLine, addedLine);
					leftWordSegments = wordChanges
						.filter((c) => !c.added)
						.map((c) => ({ text: c.value, changed: !!c.removed }));
					rightWordSegments = wordChanges
						.filter((c) => !c.removed)
						.map((c) => ({ text: c.value, changed: !!c.added }));
				}
				rows.push({
					left:
						removedLine !== undefined
							? {
									lineNumber: leftLineNumber++,
									text: removedLine,
									kind: 'removed',
									wordSegments: leftWordSegments,
								}
							: createEmptyLine(),
					right:
						addedLine !== undefined
							? {
									lineNumber: rightLineNumber++,
									text: addedLine,
									kind: 'added',
									wordSegments: rightWordSegments,
								}
							: createEmptyLine(),
				});
			}

			if (nextChange?.added) {
				index += 1;
			}

			continue;
		}

		if (change.added) {
			const addedLines = toDisplayLines(change.value);

			for (const line of addedLines) {
				rows.push({
					left: createEmptyLine(),
					right: {
						lineNumber: rightLineNumber++,
						text: line,
						kind: 'added',
					},
				});
			}

			continue;
		}

		for (const line of toDisplayLines(change.value)) {
			rows.push({
				left: {
					lineNumber: leftLineNumber++,
					text: line,
					kind: 'context',
				},
				right: {
					lineNumber: rightLineNumber++,
					text: line,
					kind: 'context',
				},
			});
		}
	}

	return rows;
};

export const buildDisplayDiffRows = (
	rows: SplitDiffRow[],
	contextLines = 3
): SplitDiffDisplayRow[] => {
	const changedIndexes = rows
		.map((row, index) =>
			row.left.kind !== 'context' || row.right.kind !== 'context' ? index : -1
		)
		.filter((index) => index >= 0);

	if (changedIndexes.length === 0) {
		return rows.map((row) => ({ type: 'line', ...row }));
	}

	const ranges: Array<{ start: number; end: number }> = [];

	for (const changedIndex of changedIndexes) {
		const nextRange = {
			start: Math.max(0, changedIndex - contextLines),
			end: Math.min(rows.length - 1, changedIndex + contextLines),
		};
		const previousRange = ranges.at(-1);

		if (!previousRange || nextRange.start > previousRange.end + 1) {
			ranges.push(nextRange);
			continue;
		}

		previousRange.end = Math.max(previousRange.end, nextRange.end);
	}

	const displayRows: SplitDiffDisplayRow[] = [];
	let currentIndex = 0;

	for (const range of ranges) {
		if (range.start > currentIndex) {
			displayRows.push({
				type: 'separator',
				hiddenLineCount: range.start - currentIndex,
				rowRange: { start: currentIndex, end: range.start - 1 },
			});
		}

		for (let index = range.start; index <= range.end; index += 1) {
			displayRows.push({
				type: 'line',
				...rows[index],
			});
		}

		currentIndex = range.end + 1;
	}

	if (currentIndex < rows.length) {
		displayRows.push({
			type: 'separator',
			hiddenLineCount: rows.length - currentIndex,
			rowRange: { start: currentIndex, end: rows.length - 1 },
		});
	}

	return displayRows;
};

export const formatCommittedAt = (timestampSecs: number) =>
	new Date(timestampSecs * 1000).toLocaleString();

export const formatCommittedAgo = (timestampSecs: number) => {
	const diffMs = Date.now() - timestampSecs * 1000;
	const diffMinutes = Math.floor(diffMs / 60000);

	if (diffMinutes < 1) return 'Just now';
	if (diffMinutes < 60)
		return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24)
		return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks < 5)
		return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;

	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12)
		return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;

	const diffYears = Math.floor(diffDays / 365);
	return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
};
