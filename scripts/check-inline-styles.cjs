/**
 * Inline style policy guard
 *
 * Blocks new `style={...}` usages introduced in staged source files under `src/`.
 * Exceptions must be documented with an `inline-style-allow:` comment immediately
 * above the inline style.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOURCE_FILE_RE = /^src\/.+\.(ts|tsx)$/;
const INLINE_STYLE_RE = /\bstyle\s*=\s*\{/;
const ALLOW_MARKER_RE = /inline-style-allow:/i;
const CONTEXT_LINES_TO_CHECK = 2;

function getStagedDiff() {
	try {
		return execSync('git diff --cached --unified=0 --diff-filter=ACMR -- src', {
			encoding: 'utf-8',
		});
	} catch (error) {
		return error.stdout || '';
	}
}

function getFileLines(filePath) {
	try {
		return fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
	} catch (error) {
		return [];
	}
}

function hasAllowMarker(lines, lineNumber) {
	const startIndex = Math.max(0, lineNumber - CONTEXT_LINES_TO_CHECK - 1);
	const endIndex = Math.max(0, lineNumber - 1);

	for (let index = startIndex; index < endIndex; index += 1) {
		if (ALLOW_MARKER_RE.test(lines[index] || '')) {
			return true;
		}
	}

	return false;
}

function main() {
	const diff = getStagedDiff();

	if (!diff.trim()) {
		console.log('✓ No staged `src/` changes to inspect for inline styles');
		return 0;
	}

	const violations = [];
	const fileCache = new Map();

	let currentFile = null;
	let currentNewLine = 0;

	for (const rawLine of diff.split('\n')) {
		if (rawLine.startsWith('+++ b/')) {
			currentFile = rawLine.slice(6).trim();
			continue;
		}

		if (rawLine.startsWith('@@ ')) {
			const match = rawLine.match(/\+(\d+)(?:,(\d+))?/);
			currentNewLine = match ? Number(match[1]) - 1 : 0;
			continue;
		}

		if (!currentFile || !SOURCE_FILE_RE.test(currentFile)) {
			continue;
		}

		if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) {
			currentNewLine += 1;
			const addedLine = rawLine.slice(1);

			if (!INLINE_STYLE_RE.test(addedLine)) {
				continue;
			}

			const absolutePath = path.join(process.cwd(), currentFile);
			let fileLines = fileCache.get(absolutePath);

			if (!fileLines) {
				fileLines = getFileLines(absolutePath);
				fileCache.set(absolutePath, fileLines);
			}

			const allowed = hasAllowMarker(fileLines, currentNewLine);

			if (!allowed) {
				violations.push({
					file: currentFile,
					line: currentNewLine,
					content: addedLine.trim(),
				});
			}
		}
	}

	if (violations.length === 0) {
		console.log('✓ Inline style policy passed for staged `src/` changes');
		return 0;
	}

	console.error('\nInline style policy violation(s) found:');
	for (const violation of violations) {
		console.error(`- ${violation.file}:${violation.line}`);
		console.error(`  ${violation.content}`);
		console.error(
			'  Add an `inline-style-allow:` comment immediately above the line only if there is no practical alternative.'
		);
	}

	console.error('\nBlocked because new inline styles must not be introduced in `src/`.');
	return 1;
}

process.exit(main());
