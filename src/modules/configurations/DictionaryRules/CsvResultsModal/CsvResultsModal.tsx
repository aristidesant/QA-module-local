import { Badge, Button, Group, Modal, Stack, Table, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BulkUploadCsvResult } from '~/models/PronunciationDictionaryModel';
import styles from './CsvResultsModal.module.css';

interface CsvResultsModalProps {
	result: BulkUploadCsvResult;
	opened: boolean;
	onClose: () => void;
	onNavigate?: () => void;
}

export default function CsvResultsModal({
	result,
	opened,
	onClose,
	onNavigate,
}: CsvResultsModalProps) {
	const { t } = useTranslation('dictionary-rules');

	const hasErrors = result.errors.length > 0;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('results.title')}
			size='lg'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{t('results.summary', { processed: result.processed })}
				</Text>

				<Group gap='xs'>
					<Badge
						leftSection={<IconCheck size={12} />}
						color='green'
						variant='light'
						size='lg'
					>
						{t('results.succeeded')}: {result.succeeded}
					</Badge>
					{hasErrors && (
						<Badge
							leftSection={<IconX size={12} />}
							color='red'
							variant='light'
							size='lg'
						>
							{t('results.failed')}: {result.failed}
						</Badge>
					)}
				</Group>

				{hasErrors ? (
					<Stack gap='xs'>
						<Text size='sm' fw={500}>
							{t('results.errorsTitle')}
						</Text>
						<div className={styles.tableWrapper}>
							<Table striped withTableBorder withColumnBorders fz='xs'>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>{t('results.tableRow')}</Table.Th>
										<Table.Th>{t('results.tableGrapheme')}</Table.Th>
										<Table.Th>{t('results.tableError')}</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{result.errors.map((err) => (
										<Table.Tr key={`${err.row}-${err.grapheme}`}>
											<Table.Td>{err.row}</Table.Td>
											<Table.Td>
												<Text size='xs' fw={500}>
													{err.grapheme}
												</Text>
											</Table.Td>
											<Table.Td c='red'>{err.error}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					</Stack>
				) : (
					<Text size='sm' c='green'>
						{t('results.noErrors')}
					</Text>
				)}

				<Group justify='flex-end' mt='xs'>
					<Button variant='default' size='sm' onClick={onClose}>
						{t('results.close')}
					</Button>
					{onNavigate && (
						<Button size='sm' onClick={onNavigate}>
							{t('results.goToDictionary')}
						</Button>
					)}
				</Group>
			</Stack>
		</Modal>
	);
}
