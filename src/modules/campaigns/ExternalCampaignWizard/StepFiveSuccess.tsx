import { Stack, Group, Text } from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepFiveProps {
	formData: FtpConfigFormData;
	isReview: boolean;
}

const getFrequencyLabel = (freq: string) => {
	const labels: Record<string, string> = {
		every30: 'Every 30 minutes',
		hourly: 'Hourly',
		daily: 'Daily',
		weekly: 'Weekly',
		ondemand: 'On-demand (manual)',
	};
	return labels[freq] || freq;
};

const getNextImportTime = (freq: string) => {
	const now = new Date();
	let next: Date;

	switch (freq) {
		case 'every30':
			next = new Date(now.getTime() + 30 * 60000);
			break;
		case 'hourly':
			next = new Date(now.getTime() + 60 * 60000);
			break;
		case 'daily':
			next = new Date(now.getTime() + 24 * 60 * 60000);
			break;
		case 'weekly':
			next = new Date(now.getTime() + 7 * 24 * 60 * 60000);
			break;
		case 'ondemand':
			return 'Never (manual trigger)';
		default:
			next = new Date(now.getTime() + 60 * 60000);
	}

	return next.toLocaleString();
};

export default function StepFiveSuccess({ formData, isReview }: StepFiveProps) {
	if (!isReview) {
		// Success state
		return (
			<>
				{/* inline-style-allow: */}
				<Stack gap='lg' className={styles.formSection} align='center'>
					{/* inline-style-allow: */}
					<div style={{ textAlign: 'center' }}>
						<IconCheck size={64} color='var(--mantine-color-green-6)' />
						<h2 className={styles.successHeading}>
							Configuration Saved Successfully
						</h2>
						<p className={styles.successMessage}>
							Your external campaign is now set up. Here's what happens next:
						</p>
					</div>

					{/* inline-style-allow: */}
					<div
						style={{
							width: '100%',
							padding: 'var(--mantine-spacing-md)',
							backgroundColor: 'var(--mantine-color-blue-0)',
							borderRadius: 'var(--mantine-radius-md)',
							border: '1px solid var(--mantine-color-blue-2)',
						}}
					>
						<Group gap='sm' mb='xs'>
							<IconClock size={20} color='var(--mantine-color-blue-6)' />
							<div>
								<Text size='sm' fw={500}>
									First import scheduled
								</Text>
								<Text size='xs' c='dimmed'>
									{getNextImportTime(formData.frequency)}
								</Text>
							</div>
						</Group>
						<Text size='sm' c='dimmed'>
							Your campaign will check for new files every{' '}
							<strong>
								{getFrequencyLabel(formData.frequency).toLowerCase()}
							</strong>
							. Files will be imported automatically.
						</Text>
					</div>
				</Stack>
			</>
		);
	}

	// Review state
	return (
		<>
			{/* inline-style-allow: */}
			<Stack gap='md' className={styles.formSection}>
				<h3 className={styles.sectionTitle}>Configuration Summary</h3>

				<div className={styles.summaryCard}>
					<div className={styles.summaryItem}>
						<span className={styles.summaryLabel}>Server</span>
						<span className={styles.summaryValue}>
							{formData.host}:{formData.port} ({formData.protocol})
						</span>
					</div>

					<div className={styles.summaryItem}>
						<span className={styles.summaryLabel}>Username</span>
						<span className={styles.summaryValue}>{formData.username}</span>
					</div>

					<div className={styles.summaryItem}>
						<span className={styles.summaryLabel}>Directory</span>
						<span className={styles.summaryValue}>
							{formData.directory || '/'}
						</span>
					</div>

					<div className={styles.summaryItem}>
						<span className={styles.summaryLabel}>Import Frequency</span>
						<span className={styles.summaryValue}>
							{getFrequencyLabel(formData.frequency)}
						</span>
					</div>
				</div>
			</Stack>
		</>
	);
}
