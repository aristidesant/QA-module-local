import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	ActionIcon,
	Alert,
	Button,
	Group,
	Modal,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import {
	IconInfoCircle,
	IconPlus,
	IconTrash,
	IconVariable,
} from '@tabler/icons-react';
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
	const [infoDismissed, setInfoDismissed] = useState(false);
	const viewportRef = useRef<HTMLDivElement>(null);

	// placeholders intentionally omitted from deps — snapshot semantics: captures state at open time only
	useEffect(() => {
		if (opened) {
			setEntries(toEntries(placeholders));
			setInfoDismissed(false);
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
		requestAnimationFrame(() => {
			if (viewportRef.current) {
				viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
			}
		});
	};

	const removeEntry = (id: string) => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
	};

	const errors = useMemo(() => {
		const errs: Record<string, string> = {};
		const seen = new Set<string>();
		for (const entry of entries) {
			if (!entry.key.trim()) {
				errs[entry.id] = t('dynamicVariables.errorEmptyKey');
			} else if (seen.has(entry.key.trim())) {
				errs[entry.id] = t('dynamicVariables.errorDuplicateKey');
			} else {
				seen.add(entry.key.trim());
			}
		}
		return errs;
	}, [entries, t]);

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
				{!infoDismissed && (
					<Alert
						variant='light'
						color='blue'
						icon={<IconInfoCircle size={18} />}
						withCloseButton
						onClose={() => setInfoDismissed(true)}
						classNames={{ root: styles.infoBanner }}
					>
						{t('dynamicVariables.infoHelp')}
					</Alert>
				)}

				{entries.length === 0 ? (
					<Stack align='center' gap='xs' py='lg'>
						<IconVariable
							size={40}
							color='var(--mantine-color-gray-4)'
							stroke={1.5}
						/>
						<Text size='sm' c='dimmed' ta='center'>
							{t('dynamicVariables.empty')}
						</Text>
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={addEntry}
						>
							{t('dynamicVariables.addVariable')}
						</Button>
					</Stack>
				) : (
					<Stack gap={0} className={styles.tableShell}>
						<div className={styles.headerRow}>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' lts='0.04em'>
								{t('dynamicVariables.keyPlaceholder')}
							</Text>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' lts='0.04em'>
								{t('dynamicVariables.valuePlaceholder')}
							</Text>
							<div className={styles.actionCol} />
						</div>

						<ScrollArea.Autosize
							mah='min(52vh, 31rem)'
							type='auto'
							offsetScrollbars='y'
							className={styles.rowsScrollArea}
							viewportRef={viewportRef}
						>
							<Stack gap='xs' className={styles.rowsStack}>
								{entries.map((entry) => (
									<div key={entry.id} className={styles.entryRow}>
										<TextInput
											placeholder='variable_name'
											aria-label={t('dynamicVariables.keyPlaceholder')}
											value={entry.key}
											onChange={(e) =>
												updateEntry(entry.id, 'key', e.currentTarget.value)
											}
											error={errors[entry.id]}
											size='sm'
											classNames={{ input: styles.keyInput }}
										/>
										<TextInput
											placeholder={t('dynamicVariables.valuePlaceholder')}
											aria-label={t('dynamicVariables.valuePlaceholder')}
											value={entry.value}
											onChange={(e) =>
												updateEntry(entry.id, 'value', e.currentTarget.value)
											}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addEntry();
												}
											}}
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

						<div className={styles.addRow}>
							<Button
								size='xs'
								variant='subtle'
								leftSection={<IconPlus size={14} />}
								onClick={addEntry}
							>
								{t('dynamicVariables.addVariable')}
							</Button>
						</div>
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
