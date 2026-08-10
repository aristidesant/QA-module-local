import { useState } from 'react';
import { Stepper, Button, Group, Container, Card, Stack } from '@mantine/core';
import {
	IconServer,
	IconLock,
	IconClock,
	IconChecks,
} from '@tabler/icons-react';
import StepOneServerSetup from './StepOneServerSetup';
import StepTwoAuthAndDirectory from './StepTwoAuthAndDirectory';
import StepFourImportSettings from './StepFourImportSettings';
import StepFiveSuccess from './StepFiveSuccess';
import styles from './ExternalCampaignWizard.module.css';

export interface FtpConfigFormData {
	host: string;
	port: number;
	username: string;
	protocol: 'FTP' | 'SFTP';
	authMethod: 'password' | 'sshKey';
	password: string;
	sshKey: File | null;
	directory: string;
	contactNameEnabled: boolean;
	delimiter: '_' | '-' | '.' | 'none';
	frequency: 'every30' | 'hourly' | 'daily' | 'weekly' | 'ondemand';
	deleteAfterImport: boolean;
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
		contactNameEnabled: false,
		delimiter: '_',
		frequency: 'hourly',
		deleteAfterImport: true,
	});

	const updateFormData = (updates: Partial<FtpConfigFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const handleNext = () => {
		// Validation gates
		if (activeStep === 0 && !connectionTested) {
			return;
		}
		if (activeStep < 3) {
			setActiveStep((current) => current + 1);
		}
	};

	const handlePrevious = () => {
		if (activeStep > 0) {
			setActiveStep((current) => current - 1);
		}
	};

	const handleEdit = () => {
		setActiveStep(0);
		setConnectionTested(false);
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
			label: 'Authentication',
			description: 'Credentials and directory',
			icon: <IconLock size={18} />,
		},
		{
			label: 'Import Settings',
			description: 'Frequency and cleanup',
			icon: <IconClock size={18} />,
		},
		{
			label: 'Review',
			description: 'Confirm configuration',
			icon: <IconChecks size={18} />,
		},
	];

	return (
		<Container size='sm' py='xl' className={styles.wizardContainer}>
			<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
				<Stack gap='lg'>
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

					<div className={styles.stepContent}>
						{activeStep === 0 && (
							<StepOneServerSetup
								formData={formData}
								updateFormData={updateFormData}
								connectionTested={connectionTested}
								setConnectionTested={setConnectionTested}
							/>
						)}
						{activeStep === 1 && (
							<StepTwoAuthAndDirectory
								formData={formData}
								updateFormData={updateFormData}
							/>
						)}
						{activeStep === 2 && (
							<StepFourImportSettings
								formData={formData}
								updateFormData={updateFormData}
							/>
						)}
						{activeStep === 3 && !confirmationDone && (
							<StepFiveSuccess
								formData={formData}
								onEdit={handleEdit}
								onConfirm={handleConfirm}
								isReview={true}
							/>
						)}
						{activeStep === 3 && confirmationDone && (
							<StepFiveSuccess
								formData={formData}
								onEdit={handleEdit}
								onConfirm={handleConfirm}
								isReview={false}
							/>
						)}
					</div>

					{activeStep < 3 && !confirmationDone && (
						<Group justify='space-between'>
							<Button
								variant='default'
								onClick={handlePrevious}
								disabled={activeStep === 0}
							>
								Previous
							</Button>
							<Button
								onClick={handleNext}
								disabled={activeStep === 0 && !connectionTested}
							>
								Next
							</Button>
						</Group>
					)}
				</Stack>
			</Card>
		</Container>
	);
}
