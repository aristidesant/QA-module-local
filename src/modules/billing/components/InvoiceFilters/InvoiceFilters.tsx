import { Button, Select, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { FilterInvoiceDto, InvoiceStatus } from '~/models/InvoiceModel';
import type { ClientModel } from '~/models/ClientModel';
import styles from './InvoiceFilters.module.css';

interface InvoiceFiltersProps {
	filters: FilterInvoiceDto;
	clients: ClientModel[];
	onChange: (filters: FilterInvoiceDto) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
	filters,
	clients,
	onChange,
}) => {
	const { t } = useTranslation('billing');

	const statusOptions: { value: InvoiceStatus; label: string }[] = [
		{ value: 'DRAFT', label: t('status.DRAFT') },
		{ value: 'ISSUED', label: t('status.ISSUED') },
		{ value: 'VOIDED', label: t('status.VOIDED') },
	];

	const clientOptions = clients.map((c) => ({
		value: String(c.id),
		label: c.name,
	}));

	const hasActiveFilters =
		!!filters.status ||
		!!filters.issuerClientId ||
		!!filters.receiverClientId ||
		!!filters.periodStart ||
		!!filters.periodEnd;

	return (
		<div className={styles.root}>
			<Select
				label={t('filters.status.label')}
				placeholder={t('filters.status.placeholder')}
				data={statusOptions}
				value={filters.status ?? null}
				onChange={(v) =>
					onChange({ ...filters, status: (v as InvoiceStatus) ?? undefined })
				}
				clearable
				size='sm'
				className={styles.selectField}
			/>
			<Select
				label={t('filters.issuerClient.label')}
				placeholder={t('filters.issuerClient.placeholder')}
				data={clientOptions}
				value={
					filters.issuerClientId != null ? String(filters.issuerClientId) : null
				}
				onChange={(v) =>
					onChange({ ...filters, issuerClientId: v ? Number(v) : undefined })
				}
				clearable
				searchable
				size='sm'
				className={styles.selectField}
			/>
			<Select
				label={t('filters.receiverClient.label')}
				placeholder={t('filters.receiverClient.placeholder')}
				data={clientOptions}
				value={
					filters.receiverClientId != null
						? String(filters.receiverClientId)
						: null
				}
				onChange={(v) =>
					onChange({ ...filters, receiverClientId: v ? Number(v) : undefined })
				}
				clearable
				searchable
				size='sm'
				className={styles.selectField}
			/>
			<DateInput
				label={t('filters.periodStart')}
				value={
					filters.periodStart
						? new Date(`${filters.periodStart}T00:00:00Z`)
						: null
				}
				onChange={(value: string | null) => {
					const dateStr = value
						? new Date(value).toISOString().split('T')[0]
						: undefined;
					onChange({
						...filters,
						periodStart: dateStr,
					});
				}}
				clearable
				size='sm'
				className={styles.dateField}
			/>
			<DateInput
				label={t('filters.periodEnd')}
				value={
					filters.periodEnd ? new Date(`${filters.periodEnd}T00:00:00Z`) : null
				}
				onChange={(value: string | null) => {
					const dateStr = value
						? new Date(value).toISOString().split('T')[0]
						: undefined;
					onChange({
						...filters,
						periodEnd: dateStr,
					});
				}}
				clearable
				size='sm'
				className={styles.dateField}
			/>
			{hasActiveFilters && (
				<Group align='flex-end'>
					<Button variant='subtle' size='sm' onClick={() => onChange({})}>
						{t('filters.clearFilters')}
					</Button>
				</Group>
			)}
		</div>
	);
};

export default InvoiceFilters;
