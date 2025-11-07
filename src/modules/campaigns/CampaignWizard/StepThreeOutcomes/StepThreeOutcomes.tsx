import React, { useState } from 'react';
import {
	Button,
	Group,
	Stack,
	Box,
	Text,
	Modal,
	Badge,
	ThemeIcon,
	Center,
	Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconNetwork, IconCheck } from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useDispositionBuilderStore } from '~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore';
import DispositionForm from '~/modules/campaigns/CampaignsForm/DispositionSection/DispositionForm';
import { useCreateDispositionFlow } from '~/queries/dispositionFlowQueries';
import useDispositionLabel from '~/hooks/useDispositionLabel';
import styles from './StepThreeOutcomes.module.css';
import sharedStyles from '../CampaignWizard.module.css';

interface StepThreeOutcomesProps {
	onNext: () => void;
	onBack: () => void;
}

export const StepThreeOutcomes: React.FC<StepThreeOutcomesProps> = ({
	onNext,
	onBack,
}) => {
	const { createdCampaign, setIsSubmitting } = useCampaignWizardStore();

	const [modalOpened, setModalOpened] = useState(false);
	const [hasCreatedFlow, setHasCreatedFlow] = useState(false);

	const updateCampaign = useCreateDispositionFlow();
	const queryClient = useQueryClient();
	const dispositionLabel = useDispositionLabel();

	const { flowJson, setDispositionFlow, setFlowJson, setCampaignId } =
		useDispositionBuilderStore();

	const handleOpenModal = () => {
		// Initialize disposition builder for new campaign
		setDispositionFlow({});
		setFlowJson({});
		setCampaignId(createdCampaign?.id);
		setModalOpened(true);
	};

	const handleCloseModal = () => {
		setModalOpened(false);
		// Keep the flow data in store for potential re-editing
	};

	const handleFlowComplete = () => {
		setHasCreatedFlow(true);
		setModalOpened(false);
		notifications.show({
			title: 'Outcome Flow Created',
			message:
				'Your outcome flow has been created successfully. Click "Save & Continue" to proceed.',
			color: 'green',
		});
	};

	const handleSubmit = async () => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		if (!hasCreatedFlow || !flowJson || Object.keys(flowJson).length === 0) {
			notifications.show({
				title: 'No Outcome Flow',
				message: 'Please create an outcome flow before continuing.',
				color: 'orange',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Create disposition flow for the campaign
			await updateCampaign.mutateAsync({
				flowJson: flowJson as any, // Type assertion for now
				campaignId: createdCampaign.id,
			});

			setIsSubmitting(false);

			// Invalidate related queries
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlows', 'campaign', createdCampaign.id],
			});
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlows'],
			});

			notifications.show({
				title: 'Outcome Flow Saved',
				message: 'Outcome configuration saved successfully.',
				color: 'green',
			});

			onNext();
		} catch (error) {
			setIsSubmitting(false);
			notifications.show({
				title: 'Error',
				message:
					error instanceof Error
						? error.message
						: 'Failed to save outcome configuration',
				color: 'red',
			});
		}
	};

	// Count nodes in flow for summary
	const nodeCount = flowJson?.dispositionNodes?.length || 0;

	// Loading state check
	if (!createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>Loading campaign data...</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<Stack gap='md'>
				{/* Outcomes Configuration Section */}
				<Box className={styles.sectionCard}>
					<div className={styles.sectionHeader}>
						<IconNetwork size={20} className={styles.sectionIcon} />
						<h3 className={styles.sectionTitle}>Outcome Configuration</h3>
					</div>
					<Text className={styles.sectionDescription}>
						{dispositionLabel(
							'Set up call outcomes for this campaign. Define how calls should be categorized and what actions to take based on different scenarios.'
						)}
					</Text>

					{hasCreatedFlow && nodeCount > 0 ? (
						// Show summary of created flow
						<Box className={styles.flowSummary}>
							<Group gap='sm' mb='xs'>
								<ThemeIcon variant='light' color='green' size='sm'>
									<IconCheck size={16} />
								</ThemeIcon>
								<Text size='sm' fw={500}>
									Outcome flow created successfully
								</Text>
							</Group>
							<Group gap='xs' mb='md'>
								<Badge variant='light' color='blue'>
									{nodeCount} {nodeCount === 1 ? 'outcome' : 'outcomes'}
								</Badge>
								<Text size='xs' c='dimmed'>
									Flow ready for campaign
								</Text>
							</Group>
							<Group gap='xs'>
								<Button variant='outline' size='sm' onClick={handleOpenModal}>
									Edit Flow
								</Button>
							</Group>
						</Box>
					) : (
						// Show create flow interface
						<Box className={styles.createFlowContainer}>
							<Center py='xl'>
								<Stack align='center' gap='md'>
									<ThemeIcon variant='light' color='blue' size='xl'>
										<IconNetwork size={32} />
									</ThemeIcon>
									<Stack align='center' gap='xs'>
										<Text fw={500}>No outcome flow configured</Text>
										<Text size='sm' c='dimmed' ta='center'>
											Create an outcome flow to define how calls should be
											categorized and processed in your campaign.
										</Text>
									</Stack>
									<Button
										leftSection={<IconPlus size={16} />}
										onClick={handleOpenModal}
										size='md'
									>
										{dispositionLabel('Create Outcome Flow')}
									</Button>
								</Stack>
							</Center>
						</Box>
					)}
				</Box>
			</Stack>

			<Group className={sharedStyles.actions}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Button
					type='button'
					loading={updateCampaign.isPending}
					disabled={!hasCreatedFlow}
					onClick={handleSubmit}
				>
					Save & Continue
				</Button>
			</Group>

			{/* Disposition Form Modal */}
			<Modal
				opened={modalOpened}
				onClose={handleCloseModal}
				size='100vw'
				fullScreen
				withCloseButton={false}
				padding={0}
			>
				<DispositionForm onComplete={handleFlowComplete} />
			</Modal>
		</>
	);
};
