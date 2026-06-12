import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconSettings2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import classes from './SelectedVoicesStrip.module.css';

export interface SelectedVoicesStripProps {
	selectedCount: number;
	availableCount: number;
	customNameCount: number;
	statusLabel: string;
	statusColor: 'gray' | 'green' | 'yellow' | 'red';
	onManageDefaults: () => void;
}

const SelectedVoicesStrip: React.FC<SelectedVoicesStripProps> = ({
	selectedCount,
	availableCount,
	customNameCount,
	statusLabel,
	statusColor,
	onManageDefaults,
}) => {
	const { t } = useTranslation('campaign.form.voices');
	const hasSelections = selectedCount > 0;

	return (
		<div className={classes.summary}>
			<Group justify='space-between' align='center' gap='sm' wrap='wrap'>
				<Stack gap={2} className={classes.copy}>
					<Text size='sm' fw={700} className={classes.title}>
						{t('summary.title')}
					</Text>
					<Text size='xs' c='dimmed' className={classes.meta}>
						{t('summary.count', {
							count: selectedCount,
							selected: selectedCount,
							available: availableCount,
						})}
						{customNameCount > 0 &&
							` · ${t('summary.customNames', { count: customNameCount })}`}
					</Text>
				</Stack>

				<Group gap='xs' wrap='nowrap'>
					<Badge variant='light' color={statusColor} radius='xl'>
						{statusLabel}
					</Badge>
					<Button
						type='button'
						variant='subtle'
						size='xs'
						leftSection={<IconSettings2 size={14} />}
						onClick={onManageDefaults}
						disabled={!hasSelections}
						className={classes.action}
					>
						{t('summary.manageDefaults')}
					</Button>
				</Group>
			</Group>
		</div>
	);
};

export default SelectedVoicesStrip;
