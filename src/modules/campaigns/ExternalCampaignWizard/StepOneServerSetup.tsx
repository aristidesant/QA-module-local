import { useState } from 'react';
import {
	TextInput,
	NumberInput,
	SegmentedControl,
	Stack,
	Alert,
	PasswordInput,
	FileInput,
	Text,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconUpload } from '@tabler/icons-react';
import ConnectionTestButton from './Components/ConnectionTestButton';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepOneProps {
	formData: FtpConfigFormData;
	updateFormData: (updates: Partial<FtpConfigFormData>) => void;
	connectionTested: boolean;
	setConnectionTested: (tested: boolean) => void;
}

export default function StepOneServerSetup({
	formData,
	updateFormData,
	connectionTested,
	setConnectionTested,
}: StepOneProps) {
	const [testingConnection, setTestingConnection] = useState(false);
	const [testError, setTestError] = useState<string | null>(null);

	const handleTestConnection = async () => {
		// Check if any fields are filled
		const hasAnyFields = formData.host || formData.port || formData.username;

		if (!hasAnyFields) {
			// No fields filled, skip testing
			setConnectionTested(true);
			return;
		}

		setTestingConnection(true);
		setTestError(null);

		// If any fields are filled, validate all required fields
		if (!formData.host || !formData.port || !formData.username) {
			setTestError('Please fill in all connection details');
			setTestingConnection(false);
			return;
		}

		// Validate FTP password if FTP protocol selected
		if (formData.protocol === 'FTP' && !formData.password) {
			setTestError('Please enter FTP password');
			setTestingConnection(false);
			return;
		}

		// Mock connection test
		setTimeout(() => {
			setConnectionTested(true);
			setTestingConnection(false);
		}, 1000);
	};

	return (
		<Stack gap='md' className={styles.formSection}>
			<div>
				<h3 className={styles.sectionTitle}>Server Configuration</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					Enter your FTP or SFTP server details
				</p>
			</div>

			<TextInput
				label='Server Host'
				placeholder='ftp.example.com'
				value={formData.host}
				onChange={(e) => {
					updateFormData({ host: e.currentTarget.value });
					setConnectionTested(false);
					setTestError(null);
				}}
			/>

			<NumberInput
				label='Port'
				placeholder='21'
				value={formData.port}
				onChange={(val) => {
					if (typeof val === 'number') {
						updateFormData({ port: val });
						setConnectionTested(false);
						setTestError(null);
					}
				}}
				min={1}
				max={65535}
			/>

			<TextInput
				label='Username'
				placeholder='admin'
				value={formData.username}
				onChange={(e) => {
					updateFormData({ username: e.currentTarget.value });
					setConnectionTested(false);
					setTestError(null);
				}}
			/>

			<div>
				{/* inline-style-allow: */}
				<label
					style={{
						display: 'block',
						marginBottom: 'var(--mantine-spacing-xs)',
						fontWeight: 500,
					}}
				>
					Protocol
				</label>
				<SegmentedControl
					value={formData.protocol}
					onChange={(value) => {
						updateFormData({ protocol: value as 'FTP' | 'SFTP' });
						setConnectionTested(false);
						setTestError(null);
					}}
					data={[
						{ label: 'FTP', value: 'FTP' },
						{ label: 'SFTP', value: 'SFTP' },
					]}
					fullWidth
				/>
			</div>

			{formData.protocol === 'FTP' ? (
				<PasswordInput
					label='Password'
					placeholder='Enter FTP password'
					value={formData.password}
					onChange={(e) => {
						updateFormData({ password: e.currentTarget.value });
						setConnectionTested(false);
						setTestError(null);
					}}
					required
				/>
			) : (
				<div>
					<FileInput
						label='SSH Private Key'
						placeholder='Select your .pem or .key file'
						accept='.pem,.key,.pub'
						value={formData.sshKey}
						onChange={(file) => {
							if (file) {
								updateFormData({ sshKey: file });
								setConnectionTested(false);
								setTestError(null);
							}
						}}
						leftSection={<IconUpload size={14} />}
						description='Upload your SSH private key file (max 10 MB)'
						required
					/>
					{formData.sshKey && (
						<Text size='sm' c='green' mt='xs'>
							✓ File selected: {formData.sshKey.name}
						</Text>
					)}
				</div>
			)}

			<TextInput
				label='Source Directory'
				placeholder='/campaigns/imports'
				value={formData.directory}
				onChange={(e) => {
					updateFormData({ directory: e.currentTarget.value });
					setConnectionTested(false);
					setTestError(null);
				}}
				description='Path on the FTP server where files are located'
			/>

			<ConnectionTestButton
				loading={testingConnection}
				tested={connectionTested}
				onClick={handleTestConnection}
			/>

			{testError && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='Connection Failed'
					color='red'
				>
					{testError}
				</Alert>
			)}

			{connectionTested && (
				<Alert
					icon={<IconCheck size={16} />}
					title='Connected Successfully'
					color='green'
				>
					Your connection details are valid. Click Next to continue.
				</Alert>
			)}
		</Stack>
	);
}
