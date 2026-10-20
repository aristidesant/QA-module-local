import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Menu,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconEdit,
	IconInbox,
	IconPlus,
	IconRefresh,
	IconRuler2,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import {
	selectScoreScales,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { ScoreScaleDrawer } from '../components/ScoreScaleDrawer';
import { SCALE_TYPES } from '../constants';
import { formatBand } from '../helpers';
import type { ScaleType, ScoreScale } from '../types';

type SortKey = 'updatedAt' | 'name' | 'type';
type SortDirection = 'asc' | 'desc';

const DEFAULT_FILTERS = {
	search: '',
	type: null as ScaleType | null,
	sortBy: 'updatedAt' as SortKey,
	direction: 'desc' as SortDirection,
};

/** Named score ranges (Low, Excellent, …) that alert rules and dashboards refer to. */
export const ScoreScalesTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const scales = useGlobalConfigStore(selectScoreScales);
	const upsert = useGlobalConfigStore((s) => s.upsertScoreScale);
	const remove = useGlobalConfigStore((s) => s.deleteScoreScale);
	const date = useDateFormatter();

	const [filters, setFilters] = useState(DEFAULT_FILTERS);
	const [drawer, setDrawer] = useState<{ opened: boolean; scale?: ScoreScale }>(
		{ opened: false }
	);

	const visible = useMemo(() => {
		const needle = filters.search.trim().toLowerCase();
		const list = scales.filter(
			(scale) =>
				(needle === '' || scale.name.toLowerCase().includes(needle)) &&
				(filters.type === null || scale.type === filters.type)
		);
		const sign = filters.direction === 'asc' ? 1 : -1;
		return [...list].sort((a, b) => {
			const left = a[filters.sortBy];
			const right = b[filters.sortBy];
			return left < right ? -sign : left > right ? sign : 0;
		});
	}, [scales, filters]);

	const columns: BaseTableColumnDef<ScoreScale>[] = [
		{
			accessorKey: 'name',
			header: t('scoreScales.columns.name'),
			size: 220,
			cell: ({ row }) => (
				<Text size='sm' fw={600}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'type',
			header: t('scoreScales.columns.type'),
			size: 150,
			cell: ({ row }) => (
				<Badge variant='light' color='gray' size='sm'>
					{t(`scoreScales.types.${row.original.type}`)}
				</Badge>
			),
		},
		{
			id: 'bands',
			header: t('scoreScales.columns.bands'),
			cell: ({ row }) => (
				<Group gap={4}>
					{row.original.bands.map((band, index) => (
						<Badge
							key={`${band.label}-${index}`}
							variant='outline'
							color='gray'
							size='sm'
							tt='none'
							fw={500}
						>
							{formatBand(band, row.original.bands[index + 1])}
						</Badge>
					))}
				</Group>
			),
		},
		{
			accessorKey: 'updatedAt',
			header: t('common.updated'),
			size: 140,
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{date.format(new Date(row.original.updatedAt))}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('scoreScales.columns.actions'),
			size: 70,
			cell: ({ row }) => (
				<Menu withinPortal position='bottom-end'>
					<Menu.Target>
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label={t('scoreScales.columns.actions')}
						>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={() => setDrawer({ opened: true, scale: row.original })}
						>
							{t('common.actions.edit')}
						</Menu.Item>
						<Menu.Item
							color='red'
							leftSection={<IconTrash size={14} />}
							onClick={() => remove(row.original.id)}
						>
							{t('common.actions.delete')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			),
		},
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconRuler2}
				title={t('scoreScales.title')}
				description={t('scoreScales.description')}
				headerActions={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setDrawer({ opened: true })}
					>
						{t('scoreScales.create')}
					</Button>
				}
			>
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing='sm'>
					<TextInput
						label={t('common.search')}
						leftSection={<IconSearch size={16} />}
						value={filters.search}
						onChange={(event) =>
							setFilters({ ...filters, search: event.currentTarget.value })
						}
					/>
					<Select
						label={t('scoreScales.columns.type')}
						data={SCALE_TYPES.map((type) => ({
							value: type,
							label: t(`scoreScales.types.${type}`),
						}))}
						value={filters.type}
						onChange={(value) =>
							setFilters({ ...filters, type: value as ScaleType | null })
						}
						clearable
						comboboxProps={{ withinPortal: true }}
					/>
					<Select
						label={t('scoreScales.filters.sortBy')}
						data={[
							{ value: 'updatedAt', label: t('scoreScales.sort.updated') },
							{ value: 'name', label: t('scoreScales.sort.name') },
							{ value: 'type', label: t('scoreScales.sort.type') },
						]}
						value={filters.sortBy}
						onChange={(value) =>
							value && setFilters({ ...filters, sortBy: value as SortKey })
						}
						allowDeselect={false}
						comboboxProps={{ withinPortal: true }}
					/>
					<Select
						label={t('scoreScales.filters.direction')}
						data={[
							{ value: 'desc', label: t('scoreScales.direction.desc') },
							{ value: 'asc', label: t('scoreScales.direction.asc') },
						]}
						value={filters.direction}
						onChange={(value) =>
							value &&
							setFilters({ ...filters, direction: value as SortDirection })
						}
						allowDeselect={false}
						comboboxProps={{ withinPortal: true }}
					/>
					<Button
						variant='default'
						leftSection={<IconRefresh size={16} />}
						onClick={() => setFilters(DEFAULT_FILTERS)}
						mt={{ base: 0, sm: 'auto' }}
					>
						{t('scoreScales.filters.refresh')}
					</Button>
				</SimpleGrid>
			</SectionCard>

			<SectionCard>
				{visible.length === 0 ? (
					<EmptyState
						icon={<IconInbox size={40} stroke={1.5} />}
						message={t('scoreScales.empty.title')}
						description={t('scoreScales.empty.description')}
					/>
				) : (
					<BaseTable<ScoreScale>
						data={visible}
						columns={columns}
						getRowId={(scale) => scale.id}
						density='compact'
					/>
				)}
			</SectionCard>

			<ScoreScaleDrawer
				opened={drawer.opened}
				scale={drawer.scale}
				onClose={() => setDrawer({ opened: false })}
				onSave={upsert}
			/>
		</Stack>
	);
};

export default ScoreScalesTab;
