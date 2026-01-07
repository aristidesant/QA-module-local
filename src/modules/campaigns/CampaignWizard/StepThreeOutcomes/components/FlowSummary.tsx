import { Badge, Box, Button, Group, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconCopy, IconEye } from '@tabler/icons-react';
import styles from '../StepThreeOutcomes.module.css';

export type FlowOrigin = 'created' | 'imported' | 'existing';

interface FlowSummaryProps {
	origin: FlowOrigin;
	nodeCount: number;
	importSourceCampaignName?: string;
	canPreviewImported: boolean;
	onPreviewImported?: () => void;
	onEditCreated?: () => void;
	onStartOver: () => void;
	isDeleting: boolean;
}

export function FlowSummary({
	origin,
	nodeCount,
	importSourceCampaignName,
	canPreviewImported,
	onPreviewImported,
	onStartOver,
	isDeleting,
}: FlowSummaryProps) {
	const { t } = useTranslation('campaigns');
	const title =
		origin === 'imported'
			? t('wizard.steps.outcomes.summary.importedSuccess')
			: origin === 'existing'
				? t('wizard.steps.outcomes.summary.existingConfigured')
				: t('wizard.steps.outcomes.summary.createdSuccess');

	return (
		<Box className={styles.flowSummary}>
			<Group gap='sm' mb='xs'>
				<ThemeIcon variant='light' color='green' size='sm'>
					<IconCheck size={16} />
				</ThemeIcon>
				<Text size='sm' fw={500}>
					{title}
				</Text>
			</Group>

			<Group gap='xs' mb='md'>
				{origin === 'imported' ? (
					<>
						<Badge variant='light' color='violet'>
							<Group gap={4}>
								<IconCopy size={12} />
								{t('wizard.steps.outcomes.summary.imported')}
							</Group>
						</Badge>
						<Text size='xs' c='dimmed'>
							{t('wizard.steps.outcomes.summary.from', {
								name:
									importSourceCampaignName ||
									t('wizard.steps.outcomes.summary.unknownCampaign'),
							})}
						</Text>
					</>
				) : (
					<>
						<Badge variant='light' color='blue'>
							{nodeCount}{' '}
							{nodeCount === 1
								? t('wizard.steps.outcomes.summary.outcome')
								: t('wizard.steps.outcomes.summary.outcomes')}
						</Badge>
						<Text size='xs' c='dimmed'>
							{t('wizard.steps.outcomes.summary.flowReady')}
						</Text>
					</>
				)}
			</Group>

			<Group gap='xs'>
				{origin === 'imported' && canPreviewImported && (
					<Button
						variant='outline'
						size='sm'
						leftSection={<IconEye size={16} />}
						onClick={onPreviewImported}
					>
						{t('wizard.steps.outcomes.summary.previewFlow')}
					</Button>
				)}

				<Button
					variant='subtle'
					size='sm'
					color='gray'
					loading={isDeleting}
					onClick={onStartOver}
				>
					{t('wizard.steps.outcomes.summary.startOver')}
				</Button>
			</Group>
		</Box>
	);
}
