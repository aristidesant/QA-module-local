import React, { useEffect, useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Modal,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './CampaignDynamicVariablesModal.module.css';

type Entry = { id: string; key: string; value: string };

interface Props {
	opened: boolean;
	onClose: () => void;
	placeholders: Record<string, unknown>;
	onApply: (next: Record<string, string>) => void;
}

const toEntries = (record: Record<string, unknown>): Entry[] =>
	Object.entries(record).map(([key, value]) => ({
		id: crypto.randomUUID(),
		key,
		value: String(value ?? ''),
	}));

const toRecord = (entries: Entry[]): Record<string, string> =>
	Object.fromEntries(entries.map(({ key, value }) => [key.trim(), value]));

const CampaignDynamicVariablesModal: React.FC<Props> = ({
	opened,
	onClose,
	placeholders,
	onApply,
}) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const [entries, setEntries] = useState<Entry[]>([]);

	useEffect(() => {
		if (opened) {
			setEntries(toEntries(placeholders));
		}
	}, [opened]);

	const updateEntry = (id: string, field: 'key' | 'value', val: string) => {
		setEntries((prev) =>
			prev.map((e) => (e.id === id ? { ...e, [field]: val } : e))
		);
	};

	const addEntry = () => {
		setEntries((prev) => [
			...prev,
			{ id: crypto.randomUUID(), key: '', value: '' },
		]);
	};

	const removeEntry = (id: string) => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
	};

	const keyErrors = (): Record<string, string> => {
		const errors: Record<string, string> = {};
		const seen = new Set<string>();
		for (const entry of entries) {
			if (!entry.key.trim()) {
				errors[entry.id] = t('dynamicVariables.errorEmptyKey');
			} else if (seen.has(entry.key.trim())) {
				errors[entry.id] = t('dynamicVariables.errorDuplicateKey');
			} else {
				seen.add(entry.key.trim());
			}
		}
		return errors;
	};

	const errors = keyErrors();
	const hasErrors = Object.keys(errors).length > 0;

	const handleApply = () => {
		if (hasErrors) return;
		onApply(toRecord(entries));
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('dynamicVariables.title')}
			size='lg'
			centered
			classNames={{
				content: styles.modalContent,
				body: styles.modalBody,
				header: styles.modalHeader,
				title: styles.modalTitle,
			}}
		>
			<Stack gap='sm' className={styles.contentStack}>
				<Group justify='flex-end' className={styles.toolbar}>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconPlus size={14} />}
						onClick={addEntry}
					>
						{t('dynamicVariables.addVariable')}
					</Button>
				</Group>

				{entries.length === 0 ? (
					<Text size='sm' c='dimmed' ta='center' py='md'>
						{t('dynamicVariables.empty')}
					</Text>
				) : (
					<Stack gap='xs' className={styles.tableShell}>
						<div className={styles.headerRow}>
							<Text size='xs' fw={600} c='dimmed'>
								{t('dynamicVariables.keyPlaceholder')}
							</Text>
							<Text size='xs' fw={600} c='dimmed'>
								{t('dynamicVariables.valuePlaceholder')}
							</Text>
							<div className={styles.actionCol} />
						</div>

						<ScrollArea.Autosize
							mah='min(52vh, 31rem)'
							type='auto'
							offsetScrollbars='y'
							className={styles.rowsScrollArea}
						>
							<Stack gap='xs' className={styles.rowsStack}>
								{entries.map((entry) => (
									<div key={entry.id} className={styles.entryRow}>
										<TextInput
											placeholder={t('dynamicVariables.keyPlaceholder')}
											aria-label={t('dynamicVariables.keyPlaceholder')}
											value={entry.key}
											onChange={(e) =>
												updateEntry(entry.id, 'key', e.currentTarget.value)
											}
											error={errors[entry.id]}
											size='sm'
										/>
										<TextInput
											placeholder={t('dynamicVariables.valuePlaceholder')}
											aria-label={t('dynamicVariables.valuePlaceholder')}
											value={entry.value}
											onChange={(e) =>
												updateEntry(entry.id, 'value', e.currentTarget.value)
											}
											size='sm'
										/>
										<Tooltip
											label={t('dynamicVariables.removeVariable')}
											withArrow
										>
											<ActionIcon
												color='red'
												variant='subtle'
												size='sm'
												aria-label={t('dynamicVariables.removeVariable')}
												className={styles.removeButton}
												onClick={() => removeEntry(entry.id)}
											>
												<IconTrash size={14} />
											</ActionIcon>
										</Tooltip>
									</div>
								))}
							</Stack>
						</ScrollArea.Autosize>
					</Stack>
				)}

				<Group justify='flex-end' className={styles.footer}>
					<Button size='sm' variant='subtle' onClick={onClose}>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button size='sm' onClick={handleApply} disabled={hasErrors}>
						{t('dynamicVariables.apply')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default CampaignDynamicVariablesModal;
