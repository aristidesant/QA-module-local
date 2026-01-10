/**
 * Pre-commit test script
 *
 * This script runs tests only for modified/staged files when tests exist.
 * Missing tests should not fail the commit.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Get list of staged files
 */
function getStagedFiles() {
	try {
		const output = execSync(
			'git diff --cached --name-only --diff-filter=ACMR',
			{
				encoding: 'utf-8',
			}
		);
		return output
			.split('\n')
			.filter((file) => file.trim())
			.filter((file) => /\.tsx$/.test(file)) // Only .tsx files
			.filter(
				(file) =>
					!file.includes('.test.') &&
					!file.includes('.spec.') &&
					!file.includes('setupTests') &&
					!file.includes('test-setup.d.ts') &&
					!file.includes('/models/') &&
					!file.includes('/test-utils/') &&
					!file.includes('/constants/') &&
					!file.includes('__tests__') &&
					!file.endsWith('routes.tsx') &&
					!file.endsWith('App.tsx') &&
					!file.endsWith('main.tsx')
			);
	} catch (error) {
		return [];
	}
}

/**
 * Find test file for a source file
 */
function findTestFile(sourceFile) {
	const dir = path.dirname(sourceFile);
	const baseName = path.basename(sourceFile, path.extname(sourceFile));
	const ext = path.extname(sourceFile);

	// Possible test file patterns
	const testPatterns = [
		path.join(dir, `${baseName}.test${ext}`),
		path.join(dir, `${baseName}.spec${ext}`),
		path.join(dir, '__tests__', `${baseName}.test${ext}`),
		path.join(dir, '__tests__', `${baseName}.spec${ext}`),
	];

	for (const pattern of testPatterns) {
		if (fs.existsSync(pattern)) {
			return pattern;
		}
	}

	return null;
}

/**
 * Run tests for specific files
 */
function runTests(testFiles) {
	if (testFiles.length === 0) {
		console.log('✓ No test files to run');
		return { success: true };
	}

	try {
		// Run tests for specific files
		const cmd = `npx vitest run ${testFiles.join(' ')}`;
		console.log(`Running tests for modified files...`);

		execSync(cmd, {
			encoding: 'utf-8',
			stdio: 'inherit',
		});
		return { success: true };
	} catch (error) {
		return { success: false };
	}
}

/**
 * Main execution
 */
function main() {
	console.log('\n🔍 Checking staged files for tests...\n');

	const stagedFiles = getStagedFiles();

	if (stagedFiles.length === 0) {
		console.log('✓ No source files staged for commit\n');
		return 0;
	}

	console.log(`📁 Staged source files (${stagedFiles.length}):`);
	stagedFiles.forEach((f) => console.log(`   - ${f}`));

	// Find corresponding test files
	const testFiles = [];

	for (const sourceFile of stagedFiles) {
		const testFile = findTestFile(sourceFile);
		if (testFile) {
			testFiles.push(testFile);
		}
	}

	console.log(
		`\n🧪 Found ${testFiles.length} test file(s) for staged source files`
	);

	if (testFiles.length === 0) {
		console.log('✓ No tests to run\n');
		return 0;
	}

	// Run tests
	const { success } = runTests(testFiles);

	if (!success) {
		console.log('\n❌ Tests failed\n');
		return 1;
	}

	console.log('✓ All tests passed\n');
	return 0;
}

process.exit(main());
