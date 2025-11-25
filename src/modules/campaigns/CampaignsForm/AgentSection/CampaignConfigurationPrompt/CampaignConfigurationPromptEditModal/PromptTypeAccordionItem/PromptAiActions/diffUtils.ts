import { parseDiff } from 'react-diff-view';
import { diffLines as computeDiffLines, type Change } from 'diff';

export type DiffResult = {
	hasChanges: boolean;
	files: ReturnType<typeof parseDiff>;
	error?: boolean;
};

export const generateDiffData = (
	originalContent: string,
	newContent: string
): DiffResult | null => {
	if (!newContent || !originalContent) {
		return null;
	}

	try {
		const changes: Change[] = computeDiffLines(originalContent, newContent);
		const hasChanges = changes.some((change) => change.added || change.removed);

		if (!hasChanges) {
			return { hasChanges: false, files: [] };
		}

		const oldLines = originalContent.split('\n');
		const newLines = newContent.split('\n');
		const diffLinesArray: string[] = [];

		changes.forEach((change) => {
			const value = change.value || '';
			const lines = value.split('\n');
			if (lines[lines.length - 1] === '') {
				lines.pop();
			}

			lines.forEach((line) => {
				if (change.added) {
					diffLinesArray.push(`+${line}`);
				} else if (change.removed) {
					diffLinesArray.push(`-${line}`);
				} else {
					diffLinesArray.push(` ${line}`);
				}
			});
		});

		const diffText = `--- a/prompt
+++ b/prompt
@@ -1,${oldLines.length} +1,${newLines.length} @@
${diffLinesArray.join('\n')}`;

		const files = parseDiff(diffText, { nearbySequences: 'zip' });
		return { hasChanges: true, files };
	} catch (err) {
		console.error('Error generating diff:', err);
		return { hasChanges: false, files: [], error: true };
	}
};
