import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, NumberInput, Switch, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { OVERRIDE_METRICS } from '../constants';
import { validateBands } from '../helpers';
import type { ScoreBands, SettingsAspect } from '../types';

type OverrideAspect = Exclude<SettingsAspect, 'sentiment'>;

interface OverrideRow {
	key: string;
	label: string;
}

interface MetricOverridesTableProps {
	aspect: OverrideAspect;
	/** The aspect's own bands, shown on rows that inherit them. */
	inherited: ScoreBands;
	overrides: Partial<Record<string, ScoreBands>>;
	onChange: (overrides: Partial<Record<string, ScoreBands>>) => void;
}

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** One row per metric: it follows the aspect's bands until "Custom" is switched on. */
export const MetricOverridesTable: React.FC<MetricOverridesTableProps> = ({
	aspect,
	inherited,
	overrides,
	onChange,
}) => {
	const { t } = useTranslation('qa.settings');

	const rows = useMemo<OverrideRow[]>(
		() =>
			OVERRIDE_METRICS[aspect].map((metric) => ({
				key: metric.key,
				label: t(metric.labelKey),
			})),
		[aspect, t]
	);

	const setOverride = (key: string, bands: ScoreBands | undefined) => {
		const next = { ...overrides };
		if (bands) next[key] = bands;
		else delete next[key];
		onChange(next);
	};

	const columns: BaseTableColumnDef<OverrideRow>[] = [
		{
			accessorKey: 'label',
			header: t('overrides.columns.metric'),
			cell: ({ row }) => (
				<Text size='sm' fw={500}>
					{row.original.label}
				</Text>
			),
		},
		{
			id: 'values',
			header: t('overrides.columns.values'),
			cell: ({ row }) => {
				const own = overrides[row.original.key];
				if (!own) {
					return (
						<Text size='sm' c='dimmed'>
							{t('overrides.inherits', {
								onTarget: inherited.onTarget,
								watch: inherited.watch,
							})}
						</Text>
					);
				}
				const error = validateBands(own);
				return (
					<Group gap='xs' wrap='nowrap'>
						<NumberInput
							size='xs'
							w={96}
							aria-label={t('bands.onTarget')}
							value={own.onTarget}
							min={0}
							max={100}
							error={error ? t(error) : undefined}
							onChange={(v) =>
								setOverride(row.original.key, {
									...own,
									onTarget: toNumber(v, own.onTarget),
								})
							}
						/>
						<NumberInput
							size='xs'
							w={96}
							aria-label={t('bands.watch')}
							value={own.watch}
							min={0}
							max={100}
							onChange={(v) =>
								setOverride(row.original.key, {
									...own,
									watch: toNumber(v, own.watch),
								})
							}
						/>
					</Group>
				);
			},
		},
		{
			id: 'custom',
			header: t('overrides.columns.custom'),
			cell: ({ row }) => (
				<Switch
					aria-label={t('overrides.custom', { metric: row.original.label })}
					checked={Boolean(overrides[row.original.key])}
					onChange={(event) =>
						setOverride(
							row.original.key,
							event.currentTarget.checked ? { ...inherited } : undefined
						)
					}
				/>
			),
		},
	];

	return (
		<SectionCard
			title={t('overrides.title')}
			description={t('overrides.description')}
		>
			<BaseTable<OverrideRow>
				columns={columns}
				data={rows}
				getRowId={(row) => row.key}
				density='compact'
			/>
		</SectionCard>
	);
};

export default MetricOverridesTable;
