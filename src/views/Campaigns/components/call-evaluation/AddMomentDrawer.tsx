import { useEffect } from 'react';
import { Button, Group, Select, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFlag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { QA_ERROR_TYPES, QA_ERROR_TYPE_ORDER } from '../../constants';
import type { QAErrorTypeCode, TranscriptTurn } from '../../types';

const MIN_NOTE = 10;
const TURN_PREVIEW_CHARS = 70;

export interface AddMomentItem {
	id: string;
	name: string;
	errorType: QAErrorTypeCode;
	aspectName: string;
}

interface AddMomentDrawerProps {
	opened: boolean;
	onClose: () => void;
	turns: TranscriptTurn[];
	/** Pre-selected turn when opened from the transcript flag icon. */
	initialTurnId: string | null;
	items: AddMomentItem[];
	onSave: (input: {
		turn: TranscriptTurn;
		itemId: string | null;
		itemName: string;
		errorType: QAErrorTypeCode;
		note: string;
	}) => void;
}

interface FormValues {
	turnId: string | null;
	itemId: string | null;
	errorType: QAErrorTypeCode | null;
	note: string;
}

/** Reviewer form to flag a transcript moment the AI missed. */
export function AddMomentDrawer({
	opened,
	onClose,
	turns,
	initialTurnId,
	items,
	onSave,
}: AddMomentDrawerProps) {
	const { t } = useTranslation('qa.calls');

	const form = useForm<FormValues>({
		initialValues: { turnId: null, itemId: null, errorType: null, note: '' },
		validate: {
			turnId: (v) => (v ? null : t('moments.add.turn')),
			errorType: (v) => (v ? null : t('moments.add.errorType')),
			note: (v) =>
				v.trim().length >= MIN_NOTE ? null : t('moments.add.notePlaceholder'),
		},
	});

	useEffect(() => {
		if (!opened) return;
		form.setValues({
			turnId: initialTurnId,
			itemId: null,
			errorType: null,
			note: '',
		});
		form.clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, initialTurnId]);

	const turnOptions = turns.map((turn) => ({
		value: turn.id,
		label: `${turn.timestamp} · ${
			turn.speaker === 'agent'
				? t('moments.transcript.agent')
				: t('moments.transcript.customer')
		} · ${turn.text.slice(0, TURN_PREVIEW_CHARS)}${
			turn.text.length > TURN_PREVIEW_CHARS ? '…' : ''
		}`,
	}));

	const aspects = Array.from(new Set(items.map((i) => i.aspectName)));
	const itemOptions = aspects.map((aspectName) => ({
		group: aspectName,
		items: items
			.filter((i) => i.aspectName === aspectName)
			.map((i) => ({ value: i.id, label: `${i.errorType} · ${i.name}` })),
	}));

	const errorTypeOptions = QA_ERROR_TYPE_ORDER.map((code) => ({
		value: code,
		label: `${code} · ${QA_ERROR_TYPES[code].shortLabel}`,
	}));

	const submit = form.onSubmit((values) => {
		const turn = turns.find((x) => x.id === values.turnId);
		if (!turn || !values.errorType) return;
		const item = items.find((i) => i.id === values.itemId);
		onSave({
			turn,
			itemId: item?.id ?? null,
			itemName: item?.name ?? t('moments.noItem'),
			errorType: values.errorType,
			note: values.note.trim(),
		});
		onClose();
	});

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			icon={<IconFlag size={20} />}
			iconColor='red'
			title={t('moments.add.title')}
			description={t('moments.add.description')}
		>
			<form onSubmit={submit}>
				<Stack gap='lg'>
					<Select
						label={t('moments.add.turn')}
						data={turnOptions}
						searchable
						required
						{...form.getInputProps('turnId')}
					/>
					<Select
						label={t('moments.add.item')}
						placeholder={t('moments.add.itemNone')}
						data={itemOptions}
						searchable
						clearable
						value={form.values.itemId}
						onChange={(value) => {
							form.setFieldValue('itemId', value);
							const item = items.find((i) => i.id === value);
							if (item) form.setFieldValue('errorType', item.errorType);
						}}
					/>
					<Select
						label={t('moments.add.errorType')}
						data={errorTypeOptions}
						required
						allowDeselect={false}
						{...form.getInputProps('errorType')}
					/>
					<Textarea
						label={t('moments.add.note')}
						placeholder={t('moments.add.notePlaceholder')}
						autosize
						minRows={3}
						required
						{...form.getInputProps('note')}
					/>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>
							{t('moments.add.cancel')}
						</Button>
						<Button type='submit' leftSection={<IconFlag size={14} />}>
							{t('moments.add.save')}
						</Button>
					</Group>
				</Stack>
			</form>
		</AppDrawer>
	);
}
