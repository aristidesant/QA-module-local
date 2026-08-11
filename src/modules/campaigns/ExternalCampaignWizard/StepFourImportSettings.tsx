import { Select, Stack, Text } from '@mantine/core';
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
					interval and import any files it finds.
				</Text>
			</div>
		</Stack>
	);
}
