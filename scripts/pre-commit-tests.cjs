/**
 * Pre-commit test script
 *
 * This script runs tests only for modified/staged files and enforces
 * a minimum 20% coverage for new files.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MIN_COVERAGE_FOR_NEW_FILES = 20;

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
			.filter((file) => /\.(ts|tsx)$/.test(file))
			.filter(
				(file) =>
					!file.includes('.test.') &&
					!file.includes('.spec.') &&
					!file.includes('setupTests') &&
					!file.includes('/models/') &&
					!file.includes('/test-utils/')
			);
	} catch (error) {
		return [];
	}
}

/**
 * Get list of newly added files (not previously tracked)
 */
function getNewFiles() {
	try {
		const output = execSync('git diff --cached --name-only --diff-filter=A', {
			encoding: 'utf-8',
		});
		return output
			.split('\n')
			.filter((file) => file.trim())
			.filter((file) => /\.(ts|tsx)$/.test(file))
			.filter(
				(file) =>
					!file.includes('.test.') &&
					!file.includes('.spec.') &&
					!file.includes('setupTests') &&
					!file.includes('/models/') &&
					!file.includes('/test-utils/')
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
 * Run tests for specific files and get coverage
 */
function runTestsWithCoverage(testFiles, coverageFiles) {
	if (testFiles.length === 0) {
		console.log('✓ No test files to run');
		return { success: true, coverage: {} };
	}

	const coverageInclude = coverageFiles
		.map((f) => f.replace(/\\/g, '/'))
		.join(',');

	try {
		// Run tests with coverage for specific files
		const cmd = `npx vitest run ${testFiles.join(' ')} --coverage --coverage.include="${coverageInclude}" --coverage.reporter=json --coverage.reporter=text-summary --silent`;
		console.log(`Running tests for modified files...`);

		execSync(cmd, {
			encoding: 'utf-8',
			stdio: 'inherit',
		});

		// Parse coverage results
		const coveragePath = path.join(
			process.cwd(),
			'coverage',
			'coverage-summary.json'
		);
		if (fs.existsSync(coveragePath)) {
			const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
			return { success: true, coverage: coverageData };
		}

		return { success: true, coverage: {} };
	} catch (error) {
		return { success: false, coverage: {} };
	}
}

/**
 * Check coverage for new files
 */
function checkNewFilesCoverage(newFiles, coverageData) {
	const failedFiles = [];

	for (const file of newFiles) {
		const filePath = path.resolve(process.cwd(), file);
		const relativePath = file.replace(/\\/g, '/');

		// Look for coverage data for this file
		const fileCoverage =
			coverageData[filePath] ||
			coverageData[relativePath] ||
			coverageData[`./${relativePath}`];

		if (!fileCoverage) {
			// No coverage data means no tests
			failedFiles.push({
				file,
				coverage: 0,
				reason: 'No test coverage found',
			});
			continue;
		}

		// Calculate line coverage percentage
		const lines = fileCoverage.lines;
		const coverage = lines.pct;

		if (coverage < MIN_COVERAGE_FOR_NEW_FILES) {
			failedFiles.push({
				file,
				coverage,
				reason: `Coverage ${coverage.toFixed(1)}% is below minimum ${MIN_COVERAGE_FOR_NEW_FILES}%`,
			});
		}
	}

	return failedFiles;
}

/**
 * Main execution
 */
function main() {
	console.log('\n🔍 Checking staged files for tests...\n');

	const stagedFiles = getStagedFiles();
	const newFiles = getNewFiles();

	if (stagedFiles.length === 0) {
		console.log('✓ No source files staged for commit\n');
		return 0;
	}

	console.log(`📁 Staged source files (${stagedFiles.length}):`);
	stagedFiles.forEach((f) => console.log(`   - ${f}`));

	if (newFiles.length > 0) {
		console.log(
			`\n🆕 New files requiring ${MIN_COVERAGE_FOR_NEW_FILES}% coverage:`
		);
		newFiles.forEach((f) => console.log(`   - ${f}`));
	}

	// Find corresponding test files
	const testFiles = [];
	const sourceFilesWithTests = [];

	for (const sourceFile of stagedFiles) {
		const testFile = findTestFile(sourceFile);
		if (testFile) {
			testFiles.push(testFile);
			sourceFilesWithTests.push(sourceFile);
		}
	}

	console.log(
		`\n🧪 Found ${testFiles.length} test file(s) for staged source files`
	);

	if (testFiles.length === 0 && newFiles.length === 0) {
		console.log('✓ No tests to run\n');
		return 0;
	}

	// Check if new files have test files
	const newFilesWithoutTests = newFiles.filter((f) => !findTestFile(f));
	if (newFilesWithoutTests.length > 0) {
		console.log('\n❌ New files missing test files:');
		newFilesWithoutTests.forEach((f) => console.log(`   - ${f}`));
		console.log(
			`\n⚠️  New files must have corresponding test files with at least ${MIN_COVERAGE_FOR_NEW_FILES}% coverage.`
		);
		console.log(
			'   Create test files following the pattern: ComponentName.test.tsx\n'
		);
		return 1;
	}

	// Run tests with coverage
	const { success, coverage } = runTestsWithCoverage(testFiles, stagedFiles);

	if (!success) {
		console.log('\n❌ Tests failed\n');
		return 1;
	}

	// Check coverage for new files
	if (newFiles.length > 0) {
		console.log('\n📊 Checking coverage for new files...');
		const failedFiles = checkNewFilesCoverage(newFiles, coverage);

		if (failedFiles.length > 0) {
			console.log('\n❌ Coverage requirements not met for new files:\n');
			failedFiles.forEach(({ file, coverage, reason }) => {
				console.log(`   ❌ ${file}`);
				console.log(`      ${reason}\n`);
			});
			console.log(
				`⚠️  New files must have at least ${MIN_COVERAGE_FOR_NEW_FILES}% test coverage.\n`
			);
			return 1;
		}

		console.log('✓ All new files meet coverage requirements\n');
	}

	console.log('✓ All tests passed\n');
	return 0;
}

process.exit(main());
