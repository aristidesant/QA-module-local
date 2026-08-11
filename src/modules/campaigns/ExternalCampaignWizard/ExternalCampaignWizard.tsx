import { useState } from 'react';
import { Stepper, Button, Container, Card } from '@mantine/core';
import { IconServer, IconChecks } from '@tabler/icons-react';
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
}

export default function ExternalCampaignWizard({
	onComplete,
	onCancel,
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
		}
	};

	const handleSkipFTP = () => {
		// Skip FTP configuration and go to Step 2 (File Pattern & Import)
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

	const stepData = [
		{
			label: 'Server Setup',
			description: 'Configure FTP/SFTP connection',
			icon: <IconServer size={18} />,
		},
		{
			label: 'Review',
			description: 'Confirm configuration',
			icon: <IconChecks size={18} />,
		},
	];

	return (
		<>
			{/* Fixed Stepper at Top - Full Width */}
			{/* inline-style-allow: */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					backgroundColor: 'var(--mantine-color-white)',
					borderBottom: '1px solid var(--mantine-color-gray-2)',
					padding: 'var(--mantine-spacing-md) var(--mantine-spacing-lg)',
					zIndex: 99,
				}}
			>
				<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
					<div style={{ marginBottom: 'var(--mantine-spacing-sm)' }}>
						<h1 className={styles.title}>External Campaign Setup</h1>
						<p className={styles.subtitle}>
							Configure FTP/SFTP for automated file imports
						</p>
					</div>

					<Stepper
						active={activeStep}
						onStepClick={setActiveStep}
						allowNextStepsSelect={false}
						size='sm'
					>
						{stepData.map((step, idx) => (
							<Stepper.Step
								key={idx}
								label={step.label}
								description={step.description}
								icon={step.icon}
							/>
						))}
						<Stepper.Completed>Completed</Stepper.Completed>
					</Stepper>
				</div>
			</div>

			{/* Main Content Area with Top Padding */}
			{/* inline-style-allow: */}
			<div
				style={{
					marginTop: '180px',
					minHeight: 'calc(100vh - 180px)',
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

						<Button
							variant='default'
							onClick={handlePrevious}
							disabled={activeStep === 0}
						>
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
