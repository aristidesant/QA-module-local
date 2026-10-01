import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, NumberInput, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { validateBands } from '../helpers';
import type { QaMetricKey, ScoreBands } from '../types';

interface CategoryRow {
	key: QaMetricKey;
	label: string;
}

interface CategoryBandsTableProps {
	title: string;
	description: string;
	value: Record<QaMetricKey, ScoreBands>;
	onChange: (value: Record<QaMetricKey, ScoreBands>) => void;
}

/** COPC categories in the order the dashboard lists them. */
const CATEGORY_KEYS: QaMetricKey[] = ['ecn', 'enc', 'ecc', 'ecuf'];

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** One row per COPC category, each with its own On target / Watch cut points. */
export const CategoryBandsTable: React.FC<CategoryBandsTableProps> = ({
	title,
	description,
	value,
	onChange,
}) => {
	const { t } = useTranslation('qa.settings');

	const rows: CategoryRow[] = CATEGORY_KEYS.map((key) => ({
		key,
		label: t(`metrics.qa.${key}`),
	}));

	const setBands = (key: QaMetricKey, patch: Partial<ScoreBands>) =>
		onChange({ ...value, [key]: { ...value[key], ...patch } });

	const columns: BaseTableColumnDef<CategoryRow>[] = [
		{
			accessorKey: 'label',
			header: t('copc.columns.category'),
			cell: ({ row }) => (
				<Text size='sm' fw={500}>
					{row.original.label}
				</Text>
			),
		},
		{
			id: 'values',
			header: t('copc.columns.values'),
			cell: ({ row }) => {
				const bands = value[row.original.key];
				const error = validateBands(bands);
				return (
					<Group gap='xs' wrap='nowrap' align='flex-start'>
						<NumberInput
							size='xs'
							w={96}
							aria-label={`${row.original.label}: ${t('bands.onTarget')}`}
							value={bands.onTarget}
							min={0}
							max={100}
							error={error ? t(error) : undefined}
							onChange={(v) =>
								setBands(row.original.key, {
									onTarget: toNumber(v, bands.onTarget),
								})
							}
						/>
						<NumberInput
							size='xs'
							w={96}
							aria-label={`${row.original.label}: ${t('bands.watch')}`}
							value={bands.watch}
							min={0}
							max={100}
							onChange={(v) =>
								setBands(row.original.key, {
									watch: toNumber(v, bands.watch),
								})
							}
						/>
					</Group>
				);
			},
		},
	];

	return (
		<SectionCard title={title} description={description}>
			<BaseTable<CategoryRow>
				columns={columns}
				data={rows}
				getRowId={(row) => row.key}
				density='compact'
			/>
		</SectionCard>
	);
};

export default CategoryBandsTable;
