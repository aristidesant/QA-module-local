import { Modal, Group, Button, Text, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';

dayjs.extend(utc);
dayjs.extend(localizedFormat);
import conversationsApi from '~/api/conversationsApi';
import classes from './ExportToExcelModal.module.css';

export type Direction = 'inbound' | 'outbound';

export interface ExportToExcelModalProps {
	opened: boolean;
	onClose: () => void;
	onSubmit?: (params: { from: Date; to: Date; direction: Direction }) => void;
}

export default function ExportToExcelModal({
	opened,
	onClose,
	onSubmit,
}: ExportToExcelModalProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const [loading, setLoading] = useState(false);

	const directionOptions = useMemo(
		() => [
			{ value: 'inbound', label: t('export.inbound') },
			{ value: 'outbound', label: t('export.outbound') },
		],
		[t]
	);

	const form = useForm<{
		from: Date | null;
		to: Date | null;
		direction: Direction | null;
	}>({
		initialValues: { from: null, to: null, direction: null },
		validate: {
			from: (v) => (v ? null : t('export.errors.required')),
			to: (v) => (v ? null : t('export.errors.required')),
			direction: (v) => (v ? null : t('export.errors.selectType')),
		},
	});

	const handleClose = () => {
		onClose();
		form.reset();
	};

	const handleSubmit = () => {
		const { from, to, direction } = form.values;
		void from;
		void to;
		void direction;
		if (!from || !to || !direction) return;
		// If parent provided a handler, delegate to it
		if (onSubmit) {
			onSubmit({ from, to, direction });
			handleClose();
			return;
		}

		// Otherwise, handle export here: build UTC day range and download file
		// Use dayjs to reliably compute local start/end of day and convert to ISO
		// Instants. This avoids timezone parsing pitfalls and keeps the selected
		// calendar day for the user.
		const startDate = dayjs(from).startOf('day').toISOString();
		// Use UTC endOf('day') so the resulting ISO is the day's 23:59:59Z and
		// doesn't roll into the next day in UTC for negative timezones.
		const endDate = dayjs(to).utc().endOf('day').toISOString();

		setLoading(true);
		conversationsApi()
			.exportConversationsCsv({
				startDate,
				endDate,
				campaingType: direction,
			})
			.then(({ blob, filename }) => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = filename || `conversations-${startDate}-${endDate}.csv`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);
			})
			.catch((err) => {
				void err;
			})
			.finally(() => {
				setLoading(false);
				handleClose();
			});
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Text component='span' fw={600} size='sm'>
					{t('export.title')}
				</Text>
			}
			centered
			size='lg'
			classNames={{ body: classes.root }}
		>
			<div
				className={classes.header}
				data-testid='export-to-excel-modal-content'
			>
				<Text className={classes.hint}>{t('export.hint')}</Text>
			</div>

			<div className={classes.fieldGroup}>
				<DatePickerInput
					label={t('export.from')}
					placeholder={t('export.fromPlaceholder')}
					value={form.values.from}
					onChange={(v) =>
						form.setFieldValue('from', (v as unknown as Date) ?? null)
					}
					maxDate={new Date()}
					valueFormat='YYYY-MM-DD'
					popoverProps={{ withinPortal: true }}
					error={form.errors.from}
					data-testid='export-from-date'
				/>

				<DatePickerInput
					label={t('export.to')}
					placeholder={t('export.toPlaceholder')}
					value={form.values.to}
					onChange={(v) =>
						form.setFieldValue('to', (v as unknown as Date) ?? null)
					}
					maxDate={new Date()}
					valueFormat='YYYY-MM-DD'
					popoverProps={{ withinPortal: true }}
					error={form.errors.to}
					data-testid='export-to-date'
				/>

				<Select
					label={t('export.type')}
					placeholder={t('export.typePlaceholder')}
					data={directionOptions}
					value={form.values.direction}
					onChange={(val) =>
						form.setFieldValue('direction', (val as Direction) ?? null)
					}
					comboboxProps={{ withinPortal: true }}
					error={form.errors.direction}
					data-testid='export-direction-select'
				/>
			</div>

			<Group className={classes.actions}>
				<Button variant='default' onClick={handleClose}>
					{t('actions.cancel', { ns: 'common' })}
				</Button>
				<Button
					onClick={handleSubmit}
					loading={loading}
					disabled={
						!form.values.direction || !form.values.from || !form.values.to
					}
				>
					{t('actions.export', { ns: 'common' })}
				</Button>
			</Group>
		</Modal>
	);
}
