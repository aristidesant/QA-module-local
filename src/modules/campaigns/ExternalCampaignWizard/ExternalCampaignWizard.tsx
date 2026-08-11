import { useState } from 'react';
import { Stepper, Button, Group, Container, Card } from '@mantine/core';
import { IconServer, IconClock, IconChecks } from '@tabler/icons-react';
import StepOneServerSetup from './StepOneServerSetup';
import StepFourImportSettings from './StepFourImportSettings';
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
}

export default function ExternalCampaignWizard({
	onComplete,
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
		if (activeStep < 2) {
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

	const stepData = [
		{
			label: 'Server Setup',
			description: 'Configure FTP/SFTP connection',
			icon: <IconServer size={18} />,
		},
		{
			label: 'File Pattern & Import',
			description: 'Nomenclature and frequency',
			icon: <IconClock size={18} />,
		},
		{
			label: 'Review',
			description: 'Confirm configuration',
			icon: <IconChecks size={18} />,
		},
	];

	return (
		<>
			{/* Fixed Stepper at Top */}
			{/* inline-style-allow: */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					backgroundColor: 'var(--mantine-color-white)',
					borderBottom: '1px solid var(--mantine-color-gray-2)',
					padding: 'var(--mantine-spacing-lg)',
					zIndex: 99,
				}}
			>
				<Container size='sm'>
					<div>
						<h1 className={styles.title}>External Campaign Setup</h1>
						<p className={styles.subtitle}>
							Configure FTP/SFTP for automated file imports
						</p>
					</div>

					<Stepper
						active={activeStep}
						onStepClick={setActiveStep}
						allowNextStepsSelect={false}
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
				</Container>
			</div>

			{/* Main Content Area with Top Padding */}
			{/* inline-style-allow: */}
			<div
				style={{
					marginTop: '300px',
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
							{activeStep === 1 && (
								<StepFourImportSettings
									formData={formData}
									updateFormData={updateFormData}
								/>
							)}
							{activeStep === 2 && !confirmationDone && (
								<StepFiveSuccess formData={formData} isReview={true} />
							)}
							{activeStep === 2 && confirmationDone && (
								<StepFiveSuccess formData={formData} isReview={false} />
							)}
						</div>
					</Card>
				</Container>
			</div>

			{/* Fixed Controls at Bottom Right */}
			{!confirmationDone && (
				<>
					{/* inline-style-allow: */}
					<Group
						gap='sm'
						style={{
							position: 'fixed',
							bottom: 0,
							right: 0,
							padding: 'var(--mantine-spacing-lg)',
							backgroundColor: 'var(--mantine-color-white)',
							borderTop: '1px solid var(--mantine-color-gray-2)',
							borderLeft: '1px solid var(--mantine-color-gray-2)',
							zIndex: 100,
						}}
					>
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

						{activeStep < 2 && <Button onClick={handleNext}>Next</Button>}
						{activeStep === 2 && (
							<Button onClick={handleConfirm}>Confirm & Save</Button>
						)}
					</Group>
				</>
			)}
		</>
	);
}
