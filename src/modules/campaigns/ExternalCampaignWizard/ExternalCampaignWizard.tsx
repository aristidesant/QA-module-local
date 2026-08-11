import { useState } from 'react';
import { Button, Container, Card } from '@mantine/core';
import StepOneServerSetup from './StepOneServerSetup';
import StepFiveSuccess from './StepFiveSuccess';
import styles from './ExternalCampaignWizard.module.css';

export interface PatternTag {
	id: string;
	value: string;
	fieldType: string;
	order: number;
}

export interface FtpConfigFormData {
	host: string;
	port: number;
	username: string;
	protocol: 'FTP' | 'SFTP';
	authMethod: 'password' | 'sshKey';
	password: string;
	sshKey: File | null;
	directory: string;
	frequency: 'every30' | 'hourly' | 'daily' | 'weekly' | 'ondemand';
}

interface ExternalCampaignWizardProps {
	onComplete?: () => void;
	onCancel?: () => void;
	onBack?: () => void;
}

export default function ExternalCampaignWizard({
	onComplete,
	onCancel,
	onBack,
}: ExternalCampaignWizardProps = {}) {
	const [activeStep, setActiveStep] = useState(0);
	const [connectionTested, setConnectionTested] = useState(false);
	const [confirmationDone, setConfirmationDone] = useState(false);

	const [formData, setFormData] = useState<FtpConfigFormData>({
		host: '',
		port: 21,
		username: '',
		protocol: 'FTP',
		authMethod: 'password',
		password: '',
		sshKey: null,
		directory: '',
		frequency: 'hourly',
	});

	const updateFormData = (updates: Partial<FtpConfigFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const handleNext = () => {
		if (activeStep < 1) {
			setActiveStep((current) => current + 1);
		}
	};

	const handlePrevious = () => {
		if (activeStep > 0) {
			setActiveStep((current) => current - 1);
		} else if (activeStep === 0 && onBack) {
			onBack();
		}
	};

	const handleSkipFTP = () => {
		// Skip FTP configuration and go to Review
		setActiveStep(1);
	};

	const handleConfirm = () => {
		setConfirmationDone(true);
		if (onComplete) {
			setTimeout(() => onComplete(), 1500);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	return (
		<>
			{/* Main Content Area */}
			{/* inline-style-allow: */}
			<div
				style={{
					minHeight: '100vh',
					paddingBottom: '80px',
				}}
			>
				<Container size='sm' py='xl' className={styles.wizardContainer}>
					<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
						{/* inline-style-allow: */}
						<div className={styles.stepContent} style={{ paddingBottom: '0' }}>
							{activeStep === 0 && (
								<StepOneServerSetup
									formData={formData}
									updateFormData={updateFormData}
									connectionTested={connectionTested}
									setConnectionTested={setConnectionTested}
								/>
							)}
							{activeStep === 1 && !confirmationDone && (
								<StepFiveSuccess formData={formData} isReview={true} />
							)}
							{activeStep === 1 && confirmationDone && (
								<StepFiveSuccess formData={formData} isReview={false} />
							)}
						</div>
					</Card>
				</Container>
			</div>

			{/* Fixed Controls at Bottom - Full Width */}
			{!confirmationDone && (
				<>
					{/* inline-style-allow: */}
					<div
						style={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 'var(--mantine-spacing-sm)',
							padding: 'var(--mantine-spacing-lg)',
							backgroundColor: 'var(--mantine-color-white)',
							borderTop: '1px solid var(--mantine-color-gray-2)',
							zIndex: 100,
						}}
					>
						<Button variant='default' onClick={handleCancel}>
							Cancel
						</Button>

						<Button variant='default' onClick={handlePrevious}>
							Previous
						</Button>

						{activeStep === 0 && (
							<Button onClick={handleSkipFTP}>Skip FTP Configuration</Button>
						)}

						{activeStep < 1 && <Button onClick={handleNext}>Next</Button>}
						{activeStep === 1 && (
							<Button onClick={handleConfirm}>Confirm & Save</Button>
						)}
					</div>
				</>
			)}
		</>
	);
}
