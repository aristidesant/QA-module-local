import {
	TextInput,
	PasswordInput,
	Radio,
	Group,
	Stack,
	Text,
	FileInput,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
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

	return (
		<Stack gap='md' className={styles.formSection}>
			<div>
				<h3 className={styles.sectionTitle}>Authentication</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					{isSFTP
						? 'Select authentication method for SFTP'
						: 'Enter your FTP password'}
				</p>
			</div>

			{isSFTP ? (
				<>
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
							onChange={(e) =>
								updateFormData({ password: e.currentTarget.value })
							}
							required
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
							required
						/>
					)}

					{formData.sshKey && formData.authMethod === 'sshKey' && (
						<Text size='sm' c='green'>
							✓ File selected: {formData.sshKey.name}
						</Text>
					)}
				</>
			) : (
				<PasswordInput
					label='Password'
					placeholder='Enter FTP password'
					value={formData.password}
					onChange={(e) => updateFormData({ password: e.currentTarget.value })}
					required
				/>
			)}

			{/* inline-style-allow: */}
			<div style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
				<h3 className={styles.sectionTitle}>Source Directory</h3>
				<TextInput
					label='Directory Path'
					placeholder='/campaigns/2026/'
					value={formData.directory}
					onChange={(e) => updateFormData({ directory: e.currentTarget.value })}
					description='Path on FTP server (e.g., /campaigns/ or leave empty for root)'
					required
				/>
			</div>
		</Stack>
	);
}
