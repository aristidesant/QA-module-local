import { useEffect, useState } from 'react';
import { Checkbox, Select, Stack, Alert, Badge } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import PatternPreviewDisplay from './Components/PatternPreviewDisplay';
import FilePreviewTable from './Components/FilePreviewTable';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepThreeProps {
	formData: FtpConfigFormData;
	updateFormData: (updates: Partial<FtpConfigFormData>) => void;
	filePreviewMatches: boolean;
	setFilePreviewMatches: (matches: boolean) => void;
}

interface MockFile {
	name: string;
	size: string;
	modified: string;
	matches: boolean;
}

const MOCK_FILES: MockFile[] = [
	{
		name: 'ACME_20260810_143022.wav',
		size: '2.4 MB',
		modified: 'Today 2:30 PM',
		matches: true,
	},
	{
		name: 'ACME_20260810_144015_John_Doe.wav',
		size: '1.8 MB',
		modified: 'Today 2:40 PM',
		matches: true,
	},
	{
		name: 'ACME_20260809_090000.wav',
		size: '3.1 MB',
		modified: 'Yesterday 9:00 AM',
		matches: true,
	},
	{
		name: 'ACME_20260809_151530_Jane_Smith.wav',
		size: '2.2 MB',
		modified: 'Yesterday 3:15 PM',
		matches: true,
	},
	{
		name: 'ACME_20260808_120000.wav',
		size: '2.8 MB',
		modified: '2 days ago 12:00 PM',
		matches: true,
	},
	{
		name: 'call_data_20260810.wav',
		size: '2.2 MB',
		modified: 'Today 1:50 PM',
		matches: false,
	},
	{
		name: 'archive.zip',
		size: '45 MB',
		modified: '3 days ago',
		matches: false,
	},
	{
		name: 'backup_2026.tar.gz',
		size: '120 MB',
		modified: '1 week ago',
		matches: false,
	},
];

export default function StepThreeNomenclature({
	formData,
	updateFormData,
	setFilePreviewMatches,
}: StepThreeProps) {
	const [filteredFiles, setFilteredFiles] = useState<MockFile[]>(MOCK_FILES);

	// Filter files based on pattern
	useEffect(() => {
		let pattern = 'ACME_YYYYMMDD_HHMMSS';
		if (formData.delimiter !== 'none') {
			pattern = pattern.replace(/_/g, formData.delimiter);
		}
		if (formData.contactNameEnabled) {
			const delim = formData.delimiter === 'none' ? '' : formData.delimiter;
			pattern += `${delim}ContactName`;
		}

		// Simple mock filtering: show matches if pattern looks reasonable
		const hasMatches = MOCK_FILES.some((f) => f.matches);
		setFilteredFiles(MOCK_FILES);
		setFilePreviewMatches(hasMatches);
	}, [formData.contactNameEnabled, formData.delimiter, setFilePreviewMatches]);

	const matchCount = filteredFiles.filter((f) => f.matches).length;

	return (
		<Stack gap='md' className={styles.formSection}>
			<div>
				<h3 className={styles.sectionTitle}>File Naming Pattern</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					Define how to identify and parse incoming files
				</p>
			</div>

			{/* inline-style-allow: */}
			<div
				style={{
					padding: 'var(--mantine-spacing-md)',
					backgroundColor: 'var(--mantine-color-gray-0)',
					borderRadius: 'var(--mantine-radius-md)',
				}}
			>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						fontWeight: 500,
						marginBottom: 'var(--mantine-spacing-xs)',
					}}
				>
					Mandatory Fields
				</p>
				{/* inline-style-allow: */}
				<div
					style={{
						display: 'flex',
						gap: 'var(--mantine-spacing-sm)',
						flexWrap: 'wrap',
						marginBottom: 'var(--mantine-spacing-md)',
					}}
				>
					<Badge color='blue' variant='light'>
						✓ Client ID
					</Badge>
					<Badge color='blue' variant='light'>
						✓ Date (YYYYMMDD)
					</Badge>
					<Badge color='blue' variant='light'>
						✓ Time (HHMMSS)
					</Badge>
				</div>

				<Checkbox
					label='Contact Name'
					checked={formData.contactNameEnabled}
					onChange={(e) =>
						updateFormData({ contactNameEnabled: e.currentTarget.checked })
					}
					mb='md'
				/>

				<Select
					label='Delimiter'
					placeholder='Select delimiter'
					value={formData.delimiter}
					onChange={(value) =>
						updateFormData({ delimiter: value as '_' | '-' | '.' | 'none' })
					}
					data={[
						{ value: '_', label: 'Underscore (_)' },
						{ value: '-', label: 'Dash (-)' },
						{ value: '.', label: 'Period (.)' },
						{ value: 'none', label: 'None' },
					]}
				/>
			</div>

			<PatternPreviewDisplay
				contactNameEnabled={formData.contactNameEnabled}
				delimiter={formData.delimiter}
			/>

			<div>
				<h3 className={styles.sectionTitle}>
					File Preview
					{matchCount > 0 && (
						<>
							{/* inline-style-allow: */}
							<span
								style={{
									marginLeft: 'var(--mantine-spacing-sm)',
									fontSize: 'var(--mantine-font-size-sm)',
									color: 'var(--mantine-color-gray-6)',
								}}
							>
								({matchCount} matched)
							</span>
						</>
					)}
				</h3>
			</div>

			{matchCount === 0 && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='No Files Matched'
					color='yellow'
				>
					No files in {formData.directory || '/'} match this pattern. Try
					adjusting your nomenclature settings.
				</Alert>
			)}

			<FilePreviewTable files={filteredFiles} />
		</Stack>
	);
}
