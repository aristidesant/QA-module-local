import {
	Button,
	Divider,
	Group,
	Modal,
	Select,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsDataCollectionRow } from '../../analyticsFormContext';

export type BulkConflictResolution = 'replace' | 'duplicate' | 'skip';

export interface BulkImportConflictItem {
	variableId: number;
	identifier: string;
	sourceType: string;
	existingType: string;
	suggestedDuplicateIdentifier: string;
	existingRow: AnalyticsDataCollectionRow;
}

interface BulkImportConflictModalProps {
	opened: boolean;
	onClose: () => void;
	conflicts: BulkImportConflictItem[];
	onConfirm: (resolutions: Record<number, BulkConflictResolution>) => void;
}

const actionOptions = (
	t: (key: string) => string
): { value: BulkConflictResolution; label: string }[] => [
	{ value: 'replace', label: t('form.analytics.bulkConflict.actions.replace') },
	{
		value: 'duplicate',
		label: t('form.analytics.bulkConflict.actions.duplicate'),
	},
	{ value: 'skip', label: t('form.analytics.bulkConflict.actions.skip') },
];

export default function BulkImportConflictModal({
	opened,
	onClose,
	conflicts,
	onConfirm,
}: BulkImportConflictModalProps) {
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
	const [resolutions, setResolutions] = useState<
		Record<number, BulkConflictResolution>
	>({});
	const [applyToAll, setApplyToAll] = useState<BulkConflictResolution | null>(
		null
	);

	useEffect(() => {
		if (!opened) {
			setResolutions({});
			setApplyToAll(null);
			return;
		}

		const next: Record<number, BulkConflictResolution> = {};
		for (const conflict of conflicts) {
			next[conflict.variableId] = 'duplicate';
		}
		setResolutions(next);
	}, [opened, conflicts]);

	const handleApplyToAll = (value: string | null) => {
		if (!value) {
			setApplyToAll(null);
			return;
		}
		const typed = value as BulkConflictResolution;
		setApplyToAll(typed);
		setResolutions((prev) => {
			const next = { ...prev };
			for (const conflict of conflicts) {
				next[conflict.variableId] = typed;
			}
			return next;
		});
	};

	const handleActionChange = (variableId: number, value: string | null) => {
		if (!value) return;
		setResolutions((prev) => ({
			...prev,
			[variableId]: value as BulkConflictResolution,
		}));
	};

	const canConfirm = useMemo(
		() =>
			conflicts.length > 0 &&
			conflicts.every((conflict) => Boolean(resolutions[conflict.variableId])),
		[conflicts, resolutions]
	);

	const handleConfirm = () => {
		if (!canConfirm) return;
		onConfirm(resolutions);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.analytics.bulkConflict.title')}
			size='xl'
		>
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('form.analytics.bulkConflict.description')}
				</Text>
				<Text size='sm' fw={500}>
					{t('form.analytics.bulkConflict.summary.conflictCount', {
						count: conflicts.length,
					})}
				</Text>

				<Group align='flex-end' gap='xs'>
					<Select
						size='sm'
						label={t('form.analytics.bulkConflict.actions.applyAll')}
						placeholder={t('form.analytics.bulkConflict.actions.applyAll')}
						data={actionOptions(t)}
						value={applyToAll}
						onChange={handleApplyToAll}
						allowDeselect
					/>
				</Group>

				<Divider />

				<Table striped highlightOnHover withTableBorder withColumnBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>
								{t('form.analytics.bulkConflict.fields.identifier')}
							</Table.Th>
							<Table.Th>
								{t('form.analytics.bulkConflict.fields.existingType')}
							</Table.Th>
							<Table.Th>
								{t('form.analytics.bulkConflict.fields.incomingType')}
							</Table.Th>
							<Table.Th>
								{t('form.analytics.bulkConflict.fields.action')}
							</Table.Th>
							<Table.Th>
								{t('form.analytics.bulkConflict.fields.duplicatePreview')}
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{conflicts.map((conflict) => {
							const selectedAction =
								resolutions[conflict.variableId] || 'duplicate';
							return (
								<Table.Tr key={conflict.variableId}>
									<Table.Td>
										<Text size='sm' ff='monospace'>
											{conflict.identifier}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm'>{conflict.existingType}</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm'>{conflict.sourceType}</Text>
									</Table.Td>
									<Table.Td>
										<Select
											size='xs'
											data={actionOptions(t)}
											value={selectedAction}
											onChange={(value) =>
												handleActionChange(conflict.variableId, value)
											}
											allowDeselect={false}
										/>
									</Table.Td>
									<Table.Td>
										<Text size='sm' ff='monospace' c='dimmed'>
											{selectedAction === 'duplicate'
												? conflict.suggestedDuplicateIdentifier
												: '--'}
										</Text>
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>

				<Group justify='flex-end' gap='xs'>
					<Button size='sm' variant='default' onClick={onClose}>
						{t('form.analytics.bulkConflict.actions.cancel')}
					</Button>
					<Button size='sm' onClick={handleConfirm} disabled={!canConfirm}>
						{t('form.analytics.bulkConflict.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
