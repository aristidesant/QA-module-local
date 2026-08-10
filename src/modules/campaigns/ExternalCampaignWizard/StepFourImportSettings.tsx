import { Select, Checkbox, Stack, Text } from '@mantine/core';
import FilePatternExtractor from './Components/FilePatternExtractor';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepFourProps {
	formData: FtpConfigFormData;
	updateFormData: (updates: Partial<FtpConfigFormData>) => void;
}

export default function StepFourImportSettings({
	formData,
	updateFormData,
}: StepFourProps) {
	return (
		<Stack gap='md' className={styles.formSection}>
			{/* File Naming Pattern Section */}
			<FilePatternExtractor
				onPatternsChange={(patterns, delimiter) => {
					updateFormData({
						patternTags: patterns as any,
						patternDelimiter: delimiter,
					});
				}}
			/>

			{/* Import Settings Section */}
			<div>
				<h3 className={styles.sectionTitle}>Auto-Import Settings</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					Configure how often the system will check for new files
				</p>
			</div>

			<Select
				label='Import Frequency'
				placeholder='Select frequency'
				value={formData.frequency}
				onChange={(value) => updateFormData({ frequency: value as any })}
				data={[
					{ value: 'every30', label: 'Every 30 minutes' },
					{ value: 'hourly', label: 'Hourly' },
					{ value: 'daily', label: 'Daily' },
					{ value: 'weekly', label: 'Weekly' },
					{ value: 'ondemand', label: 'On-demand (manual)' },
				]}
				required
				description='System will check for new files on this schedule and import automatically'
			/>

			{/* inline-style-allow: */}
			<div
				style={{
					marginTop: 'var(--mantine-spacing-lg)',
					padding: 'var(--mantine-spacing-md)',
					backgroundColor: 'var(--mantine-color-gray-0)',
					borderRadius: 'var(--mantine-radius-md)',
				}}
			>
				<Checkbox
					label='Delete files after successful import'
					checked={formData.deleteAfterImport}
					onChange={(e) =>
						updateFormData({ deleteAfterImport: e.currentTarget.checked })
					}
					description='Removes imported files from the FTP server to prevent re-ingestion'
				/>
			</div>

			{/* inline-style-allow: */}
			<div
				style={{
					padding: 'var(--mantine-spacing-md)',
					backgroundColor: 'var(--mantine-color-blue-0)',
					borderRadius: 'var(--mantine-radius-md)',
					border: '1px solid var(--mantine-color-blue-2)',
				}}
			>
				<Text size='sm' fw={500} mb='xs'>
					ℹ How It Works
				</Text>
				<Text size='sm' c='dimmed'>
					The system will automatically check your FTP server at the selected
					interval. When it finds files matching your naming pattern, it will:
				</Text>
				{/* inline-style-allow: */}
				<ul
					style={{
						marginTop: 'var(--mantine-spacing-xs)',
						paddingLeft: 'var(--mantine-spacing-lg)',
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					<li>Import the files into the campaign</li>
					<li>Process the audio data</li>
					{formData.deleteAfterImport && (
						<li>Delete the files from the FTP server</li>
					)}
				</ul>
			</div>
		</Stack>
	);
}
