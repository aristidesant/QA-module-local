import { Button, Group, Stack, Text } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import styles from '../ToolForm.module.css';

interface ToolFormFooterActionsProps {
	isSubmitting: boolean;
	isEdit: boolean;
	remainingRequiredSections: number;
	onCancel?: () => void;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormFooterActions({
	isSubmitting,
	isEdit,
	remainingRequiredSections,
	onCancel,
	t,
}: ToolFormFooterActionsProps) {
	return (
		<Stack gap={4} className={styles.footerContent}>
			<Text size='xs' c='dimmed'>
				{remainingRequiredSections > 0
					? t('form.footer.requiredRemaining', {
							count: remainingRequiredSections,
						})
					: t('form.footer.ready')}
			</Text>
			<Group gap='xs' justify='flex-end'>
				<Button variant='subtle' size='sm' onClick={onCancel}>
					{t('actions.cancel', { ns: 'common' })}
				</Button>
				<Button
					type='submit'
					size='sm'
					leftSection={<IconDeviceFloppy size={14} />}
					loading={isSubmitting}
					data-testid='submit-tool-btn'
				>
					{isEdit ? t('actions.saveChanges') : t('actions.createTool')}
				</Button>
			</Group>
		</Stack>
	);
}
