import React from 'react';
import {
	Button,
	Group,
	Text,
	ThemeIcon,
	Badge,
	Card,
	Center,
} from '@mantine/core';
import { IconCheck, IconEye, IconRocket } from '@tabler/icons-react';
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

	const budgetLabel =
		typeof createdCampaign?.budget === 'number'
			? `$${createdCampaign.budget.toLocaleString()}`
			: '—';

	return (
		<Center py='xl'>
			<div className={styles.surface}>
				<div className={styles.header}>
					<div>
						<Badge variant='light' color='teal' size='sm'>
							Step 5 · Completed
						</Badge>
						<Text className={styles.title}>Campaign is live and ready</Text>
						<Text className={styles.description}>
							{createdCampaign?.name
								? `“${createdCampaign.name}” is configured. Review the summary or jump straight to the campaign overview.`
								: 'Your campaign is configured. Review the summary or jump straight to the campaign overview.'}
						</Text>
					</div>
					<ThemeIcon
						variant='light'
						color='teal'
						size={70}
						radius='xl'
						className={styles.icon}
					>
						<IconCheck size={32} />
					</ThemeIcon>
				</div>

				<div className={styles.contentGrid}>
					<Card withBorder radius='md' className={styles.summaryCard}>
						<Text size='sm' fw={600} className={styles.cardTitle}>
							Campaign snapshot
						</Text>
						<div className={styles.summaryList}>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									Name
								</Text>
								<Text size='sm' fw={600}>
									{createdCampaign?.name || '—'}
								</Text>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									Type
								</Text>
								<Badge variant='light' color='blue' size='sm'>
									{createdCampaign?.type || '—'}
								</Badge>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									Status
								</Text>
								<Badge variant='light' color='yellow' size='sm'>
									{createdCampaign?.status || '—'}
								</Badge>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									Budget
								</Text>
								<Text size='sm' fw={600}>
									{budgetLabel}
								</Text>
							</div>
						</div>
					</Card>

					<Card withBorder radius='md' className={styles.nextCard}>
						<Text size='sm' fw={600} className={styles.cardTitle}>
							Keep the momentum
						</Text>
						<ul className={styles.nextList}>
							<li>
								<Text size='sm'>
									Review dispositions and outcome automations.
								</Text>
							</li>
							<li>
								<Text size='sm'>
									Upload your contact list or connect a segment.
								</Text>
							</li>
							<li>
								<Text size='sm'>
									Schedule working hours and throttling rules.
								</Text>
							</li>
							<li>
								<Text size='sm'>Launch a test call to validate the flow.</Text>
							</li>
						</ul>
						<Group gap='xs' mt='md'>
							<ThemeIcon variant='light' color='blue' radius='md' size='lg'>
								<IconRocket size={18} />
							</ThemeIcon>
							<Text size='xs' c='dimmed'>
								Tip: monitor performance from the campaign dashboard once calls
								start.
							</Text>
						</Group>
					</Card>
				</div>

				<Group className={styles.actions} gap='sm'>
					<Button
						variant='outline'
						leftSection={<IconEye size={16} />}
						onClick={handleViewCampaign}
					>
						View campaign
					</Button>
					<Button variant='default' onClick={handleComplete}>
						Close wizard
					</Button>
				</Group>
			</div>
		</Center>
	);
};
