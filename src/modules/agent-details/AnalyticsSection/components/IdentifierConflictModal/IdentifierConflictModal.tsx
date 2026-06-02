import {
	Badge,
	Button,
	Code,
	Group,
	Modal,
	Paper,
	Radio,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './IdentifierConflictModal.module.css';

interface IdentifierConflictModalProps {
	opened: boolean;
	onClose: () => void;
	identifier: string;
	duplicateIdentifier: string;
	onReplace: () => void;
	onDuplicate: () => void;
}

type ConflictAction = 'replace' | 'duplicate';

export default function IdentifierConflictModal({
	opened,
	onClose,
	identifier,
	duplicateIdentifier,
	onReplace,
	onDuplicate,
}: IdentifierConflictModalProps) {
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
	const [selected, setSelected] = useState<ConflictAction | null>(null);

	const handleClose = () => {
		setSelected(null);
		onClose();
	};

	const handleConfirm = () => {
		if (selected === 'replace') {
			onReplace();
		} else if (selected === 'duplicate') {
			onDuplicate();
		}
		setSelected(null);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={t('form.analytics.conflict.title')}
			size='md'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{t('form.analytics.conflict.description', { identifier })}
				</Text>

				<Stack gap='xs'>
					<UnstyledButton w='100%' onClick={() => setSelected('replace')}>
						<Paper
							withBorder
							p='md'
							className={`${styles.optionCard} ${selected === 'replace' ? styles.optionCardSelectedReplace : ''}`.trim()}
						>
							<Group align='flex-start' wrap='nowrap'>
								<Radio
									checked={selected === 'replace'}
									onChange={() => setSelected('replace')}
									color='red'
									mt={2}
								/>
								<Stack gap={4} className={styles.optionContent}>
									<Group gap='xs'>
										<Text size='sm' fw={600}>
											{t('form.analytics.conflict.replaceTitle')}
										</Text>
										<Badge color='red' size='sm' variant='light'>
											Destructive
										</Badge>
									</Group>
									<Text size='sm' c='dimmed'>
										{t('form.analytics.conflict.replaceDescription', {
											identifier,
										})}
									</Text>
									<Group gap={4} className={styles.warningRow}>
										<IconAlertTriangle
											size={13}
											className={styles.warningIcon}
										/>
										<Text size='xs' c='red'>
											{t('form.analytics.conflict.replaceWarning')}
										</Text>
									</Group>
								</Stack>
							</Group>
						</Paper>
					</UnstyledButton>

					<UnstyledButton w='100%' onClick={() => setSelected('duplicate')}>
						<Paper
							withBorder
							p='md'
							className={`${styles.optionCard} ${selected === 'duplicate' ? styles.optionCardSelectedDuplicate : ''}`.trim()}
						>
							<Group align='flex-start' wrap='nowrap'>
								<Radio
									checked={selected === 'duplicate'}
									onChange={() => setSelected('duplicate')}
									color='blue'
									mt={2}
								/>
								<Stack gap={4} className={styles.optionContent}>
									<Text size='sm' fw={600}>
										{t('form.analytics.conflict.duplicateTitle')}
									</Text>
									<Text size='sm' c='dimmed'>
										{t('form.analytics.conflict.duplicateDescription')}
									</Text>
									<Code className={styles.duplicateCode}>
										{duplicateIdentifier}
									</Code>
								</Stack>
							</Group>
						</Paper>
					</UnstyledButton>
				</Stack>

				<Group justify='flex-end' gap='xs'>
					<Button size='sm' variant='default' onClick={handleClose}>
						{t('form.analytics.conflict.actions.cancel')}
					</Button>
					<Button
						size='sm'
						color='blue'
						disabled={!selected}
						onClick={handleConfirm}
					>
						{t('form.analytics.conflict.confirmAction')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
