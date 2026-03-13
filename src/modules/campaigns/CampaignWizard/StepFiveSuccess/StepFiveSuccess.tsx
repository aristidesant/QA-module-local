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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	const { createdCampaign } = useCampaignWizardStore();
	const navigate = useNavigate();

	const handleComplete = () => {
		onComplete();
	};

	const handleViewCampaign = () => {
		if (createdCampaign?.id) {
			navigate(`/campaign/${createdCampaign.id}`);
			onComplete(); // Ensure cleanup happens via parent
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
							{t('wizard.steps.complete.eyebrow')}
						</Badge>
						<Text className={styles.title}>
							{t('wizard.steps.complete.title')}
						</Text>
						<Text className={styles.description}>
							{createdCampaign?.name
								? t('wizard.steps.complete.descriptionNamed', {
										name: createdCampaign.name,
									})
								: t('wizard.steps.complete.descriptionText')}
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
							{t('wizard.steps.complete.snapshotTitle')}
						</Text>
						<div className={styles.summaryList}>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									{t('wizard.steps.complete.name')}
								</Text>
								<Text size='sm' fw={600}>
									{createdCampaign?.name || '—'}
								</Text>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									{t('wizard.steps.complete.type')}
								</Text>
								<Badge variant='light' color='blue' size='sm'>
									{createdCampaign?.type || '—'}
								</Badge>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									{t('wizard.steps.complete.status')}
								</Text>
								<Badge variant='light' color='yellow' size='sm'>
									{createdCampaign?.status || '—'}
								</Badge>
							</div>
							<div className={styles.summaryItem}>
								<Text size='xs' c='dimmed'>
									{t('wizard.steps.complete.budget')}
								</Text>
								<Text size='sm' fw={600}>
									{budgetLabel}
								</Text>
							</div>
						</div>
					</Card>

					<Card withBorder radius='md' className={styles.nextCard}>
						<Text size='sm' fw={600} className={styles.cardTitle}>
							{t('wizard.steps.complete.momentumTitle')}
						</Text>
						<ul className={styles.nextList}>
							{(
								t('wizard.steps.complete.momentumList', {
									returnObjects: true,
								}) as string[]
							).map((item, index) => (
								<li key={index}>
									<Text size='sm'>{item}</Text>
								</li>
							))}
						</ul>
						<Group gap='xs' mt='md'>
							<ThemeIcon variant='light' color='blue' radius='md' size='lg'>
								<IconRocket size={18} />
							</ThemeIcon>
							<Text size='xs' c='dimmed'>
								{t('wizard.steps.complete.tip')}
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
						{t('wizard.steps.complete.viewCampaign')}
					</Button>
					<Button variant='default' onClick={handleComplete}>
						{t('wizard.steps.complete.closeWizard')}
					</Button>
				</Group>
			</div>
		</Center>
	);
};
