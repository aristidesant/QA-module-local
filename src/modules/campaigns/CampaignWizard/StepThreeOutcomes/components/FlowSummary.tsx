import { Badge, Box, Button, Group, Text, ThemeIcon } from '@mantine/core';
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
	const title =
		origin === 'imported'
			? 'Outcome flow imported successfully'
			: origin === 'existing'
				? 'Outcome flow already configured'
				: 'Outcome flow created successfully';

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
								Imported
							</Group>
						</Badge>
						<Text size='xs' c='dimmed'>
							From: {importSourceCampaignName || 'Unknown campaign'}
						</Text>
					</>
				) : (
					<>
						<Badge variant='light' color='blue'>
							{nodeCount} {nodeCount === 1 ? 'outcome' : 'outcomes'}
						</Badge>
						<Text size='xs' c='dimmed'>
							Flow ready for campaign
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
						Preview Flow
					</Button>
				)}

				<Button
					variant='subtle'
					size='sm'
					color='gray'
					loading={isDeleting}
					onClick={onStartOver}
				>
					Start Over
				</Button>
			</Group>
		</Box>
	);
}
