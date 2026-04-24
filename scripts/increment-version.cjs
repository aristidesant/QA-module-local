#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '../src/version.ts');

// Read current version
const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
const versionMatch = versionFileContent.match(/APP_VERSION = '(\d+)'/);

if (!versionMatch) {
	console.error('Could not find APP_VERSION in version.ts');
	process.exit(1);
}

const currentVersion = versionMatch[1];

// Parse current version (YYMMDDBN format)
if (currentVersion.length !== 8) {
	console.error('Invalid version format. Expected YYMMDDBN (8 digits)');
	process.exit(1);
}

const currentYYMMDD = currentVersion.substring(0, 6);
const currentBuildNumber = parseInt(currentVersion.substring(6, 8), 10);

// Get current date in YYMMDD format
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const todayYYMMDD = `${year}${month}${day}`;

// Determine new version
let newVersion;
if (todayYYMMDD === currentYYMMDD) {
	// Same day, increment build number
	const newBuildNumber = String(currentBuildNumber + 1).padStart(2, '0');
	newVersion = `${currentYYMMDD}${newBuildNumber}`;
} else {
	// Different day, start with build 01
	newVersion = `${todayYYMMDD}01`;
}

// Update version file
const newContent = `// Manual version file generated per request
export const APP_VERSION = '${newVersion}';
`;

fs.writeFileSync(versionFilePath, newContent, 'utf8');

console.log(`Version updated: ${currentVersion} -> ${newVersion}`);
