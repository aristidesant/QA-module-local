import {
	PasswordInput,
	Radio,
	Group,
	Stack,
	Text,
	FileInput,
	Alert,
} from '@mantine/core';
import { IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepTwoProps {
	formData: FtpConfigFormData;
	updateFormData: (updates: Partial<FtpConfigFormData>) => void;
}

export default function StepTwoAuthAndDirectory({
	formData,
	updateFormData,
}: StepTwoProps) {
	const isSFTP = formData.protocol === 'SFTP';

	// Only show SFTP auth if user configured FTP/SFTP
	const hasFtpConfig = formData.host && formData.username;

	if (!hasFtpConfig) {
		return (
			<Stack gap='md' className={styles.formSection}>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='No FTP Configuration'
				>
					You skipped FTP configuration. Proceed to select a file naming pattern
					from the global patterns library.
				</Alert>
			</Stack>
		);
	}

	if (!isSFTP) {
		return (
			<Stack gap='md' className={styles.formSection}>
				<Alert title='FTP Configuration Complete'>
					Your FTP connection is configured. Proceed to the next step to select
					file naming pattern.
				</Alert>
			</Stack>
		);
	}

	// SFTP only - show SSH key option
	return (
		<Stack gap='md' className={styles.formSection}>
			<div>
				<h3 className={styles.sectionTitle}>SFTP Authentication</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					Select how to authenticate with your SFTP server
				</p>
			</div>

			<Radio.Group
				value={formData.authMethod}
				onChange={(value) =>
					updateFormData({ authMethod: value as 'password' | 'sshKey' })
				}
				label='Authentication Method'
			>
				<Group mt='xs'>
					<Radio value='password' label='Password' />
					<Radio value='sshKey' label='SSH Key' />
				</Group>
			</Radio.Group>

			{formData.authMethod === 'password' ? (
				<PasswordInput
					label='Password'
					placeholder='Enter SFTP password'
					value={formData.password}
					onChange={(e) => updateFormData({ password: e.currentTarget.value })}
				/>
			) : (
				<FileInput
					label='SSH Private Key'
					placeholder='Select your .pem or .key file'
					accept='.pem,.key,.pub'
					value={formData.sshKey}
					onChange={(file) => {
						if (file) {
							updateFormData({ sshKey: file });
						}
					}}
					leftSection={<IconUpload size={14} />}
					description='Upload your SSH private key file (max 10 MB)'
				/>
			)}

			{formData.sshKey && formData.authMethod === 'sshKey' && (
				<Text size='sm' c='green'>
					✓ File selected: {formData.sshKey.name}
				</Text>
			)}
		</Stack>
	);
}
