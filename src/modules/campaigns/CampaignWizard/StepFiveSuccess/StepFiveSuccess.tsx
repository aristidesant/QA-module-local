import React from 'react';
import {
	Button,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Center,
	Badge,
	Card,
} from '@mantine/core';
import { IconCheck, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import styles from './StepFiveSuccess.module.css';

interface StepFiveSuccessProps {
	onComplete: () => void;
}

export const StepFiveSuccess: React.FC<StepFiveSuccessProps> = ({
	onComplete,
}) => {
	const { createdCampaign, reset } = useCampaignWizardStore();
	const navigate = useNavigate();

	const handleComplete = () => {
		reset(); // Clear wizard state
		onComplete();
	};

	const handleViewCampaign = () => {
		if (createdCampaign?.id) {
			reset(); // Clear wizard state
			navigate(`/campaign/${createdCampaign.id}`);
		} else {
			handleComplete();
		}
	};

	return (
		<Center py='xl'>
			<Stack align='center' gap='xl' className={styles.container}>
				{/* Success Icon */}
				<ThemeIcon
					variant='light'
					color='green'
					size={80}
					className={styles.successIcon}
				>
					<IconCheck size={40} />
				</ThemeIcon>

				{/* Success Message */}
				<Stack align='center' gap='sm'>
					<Text size='xl' fw={600} className={styles.title}>
						🎉 Campaign Created Successfully!
					</Text>
					<Text size='md' c='dimmed' ta='center' className={styles.subtitle}>
						Your campaign "{createdCampaign?.name}" has been created and is
						ready to launch.
					</Text>
				</Stack>

				{/* Campaign Summary Card */}
				<Card withBorder radius='md' className={styles.summaryCard}>
					<Stack gap='sm'>
						<Text size='sm' fw={500} mb='xs'>
							Campaign Summary
						</Text>

						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								Name:
							</Text>
							<Text size='sm' fw={500}>
								{createdCampaign?.name}
							</Text>
						</Group>

						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								Type:
							</Text>
							<Badge variant='light' color='blue' size='sm'>
								{createdCampaign?.type}
							</Badge>
						</Group>

						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								Status:
							</Text>
							<Badge variant='light' color='yellow' size='sm'>
								{createdCampaign?.status}
							</Badge>
						</Group>

						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								Budget:
							</Text>
							<Text size='sm' fw={500}>
								${createdCampaign?.budget}
							</Text>
						</Group>
					</Stack>
				</Card>

				{/* Next Steps */}
				<Stack align='center' gap='md'>
					<Text size='sm' fw={500}>
						What's next?
					</Text>
					<Stack gap='xs' className={styles.nextSteps}>
						<Text size='xs' c='dimmed' ta='center'>
							✅ Configure agent settings and knowledge bases
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							✅ Set up outcome flows for call categorization
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							✅ Define working hours and parameters
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							📞 Ready to add contacts and launch your campaign!
						</Text>
					</Stack>
				</Stack>

				{/* Action Buttons */}
				<Group gap='sm' className={styles.actions}>
					<Button
						variant='outline'
						leftSection={<IconEye size={16} />}
						onClick={handleViewCampaign}
					>
						View Campaign
					</Button>
				</Group>

				{/* Close Button */}
				<Button
					variant='default'
					onClick={handleComplete}
					className={styles.closeButton}
				>
					Close Wizard
				</Button>
			</Stack>
		</Center>
	);
};
